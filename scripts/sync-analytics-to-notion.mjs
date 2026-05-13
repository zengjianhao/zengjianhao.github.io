#!/usr/bin/env node

import { createSign } from "node:crypto";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GA_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const NOTION_API_VERSION = "2022-06-28";

const env = process.env;

const propertyNames = {
  title: env.NOTION_TITLE_PROPERTY || "Name",
  date: env.NOTION_DATE_PROPERTY || "Date",
  pageViews: env.NOTION_PAGE_VIEWS_PROPERTY || "Page Views",
  activeUsers: env.NOTION_ACTIVE_USERS_PROPERTY || "Active Users",
  sessions: env.NOTION_SESSIONS_PROPERTY || "Sessions",
  newUsers: env.NOTION_NEW_USERS_PROPERTY || "New Users",
  eventCount: env.NOTION_EVENT_COUNT_PROPERTY || "Event Count",
  topPages: env.NOTION_TOP_PAGES_PROPERTY || "Top Pages",
  site: env.NOTION_SITE_PROPERTY || "Site",
  gaProperty: env.NOTION_GA_PROPERTY || "GA Property",
};

function requiredEnv(name) {
  const value = env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function base64url(value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function formatDateInTimeZone(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function defaultReportDate() {
  const timeZone = env.REPORT_TIME_ZONE || "Asia/Shanghai";
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return formatDateInTimeZone(yesterday, timeZone);
}

function reportDate() {
  const value = env.REPORT_DATE?.trim();
  if (!value) {
    return defaultReportDate();
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("REPORT_DATE must use YYYY-MM-DD format.");
  }
  return value;
}

function normalizePrivateKey(privateKey) {
  return privateKey.replace(/\\n/g, "\n");
}

function googleCredentials() {
  let raw = env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw && env.GOOGLE_SERVICE_ACCOUNT_B64) {
    raw = Buffer.from(env.GOOGLE_SERVICE_ACCOUNT_B64, "base64").toString("utf8");
  }

  if (raw) {
    const credentials = JSON.parse(raw);
    if (!credentials.client_email || !credentials.private_key) {
      throw new Error("Google service account JSON must include client_email and private_key.");
    }
    return {
      clientEmail: credentials.client_email,
      privateKey: normalizePrivateKey(credentials.private_key),
    };
  }

  if (env.GOOGLE_CLIENT_EMAIL && env.GOOGLE_PRIVATE_KEY) {
    return {
      clientEmail: env.GOOGLE_CLIENT_EMAIL.trim(),
      privateKey: normalizePrivateKey(env.GOOGLE_PRIVATE_KEY.trim()),
    };
  }

  throw new Error(
    "Provide GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_SERVICE_ACCOUNT_B64, or GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY.",
  );
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = body?.error?.message || body?.message || text;
    throw new Error(`${options.method || "GET"} ${url} failed with ${response.status}: ${message}`);
  }

  return body;
}

async function googleAccessToken() {
  const credentials = googleCredentials();
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: credentials.clientEmail,
    scope: GA_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = base64url(signer.sign(credentials.privateKey));
  const assertion = `${signingInput}.${signature}`;

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const token = await fetchJson(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  return token.access_token;
}

function hostNameFilter() {
  const hostName = env.SITE_HOSTNAME?.trim();
  if (!hostName) {
    return undefined;
  }
  return {
    filter: {
      fieldName: "hostName",
      stringFilter: {
        matchType: "EXACT",
        value: hostName,
      },
    },
  };
}

async function runGaReport(accessToken, propertyId, body) {
  return fetchJson(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function metricMap(response, metricNames) {
  const row = response.rows?.[0];
  return Object.fromEntries(
    metricNames.map((metricName, index) => [
      metricName,
      Number(row?.metricValues?.[index]?.value || 0),
    ]),
  );
}

async function analyticsSummary(accessToken, propertyId, date) {
  const metricNames = ["screenPageViews", "activeUsers", "sessions", "newUsers", "eventCount"];
  const dimensionFilter = hostNameFilter();
  const body = {
    dateRanges: [{ startDate: date, endDate: date }],
    dimensions: [{ name: "date" }],
    metrics: metricNames.map((name) => ({ name })),
  };
  if (dimensionFilter) {
    body.dimensionFilter = dimensionFilter;
  }

  const response = await runGaReport(accessToken, propertyId, body);
  return metricMap(response, metricNames);
}

async function topPages(accessToken, propertyId, date) {
  const body = {
    dateRanges: [{ startDate: date, endDate: date }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 10,
  };
  const dimensionFilter = hostNameFilter();
  if (dimensionFilter) {
    body.dimensionFilter = dimensionFilter;
  }

  const response = await runGaReport(accessToken, propertyId, body);
  return (response.rows || []).map((row) => ({
    path: row.dimensionValues?.[0]?.value || "(unknown)",
    views: Number(row.metricValues?.[0]?.value || 0),
  }));
}

function cleanNotionId(value) {
  const candidate = value.trim().split("?")[0].split("/").pop() || value.trim();
  const compact = candidate.replace(/-/g, "");
  const match = compact.match(/[0-9a-fA-F]{32}/);
  if (!match) {
    throw new Error("NOTION_DATABASE_ID must be a Notion database ID or database URL.");
  }

  const id = match[0].toLowerCase();
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

async function notionFetch(path, options = {}) {
  return fetchJson(`https://api.notion.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${requiredEnv("NOTION_TOKEN")}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_API_VERSION,
      ...options.headers,
    },
  });
}

async function notionDatabase(databaseId) {
  return notionFetch(`/databases/${databaseId}`);
}

function propertyType(database, propertyName) {
  return database.properties?.[propertyName]?.type;
}

function requireProperty(database, propertyName, expectedType) {
  const actualType = propertyType(database, propertyName);
  if (actualType !== expectedType) {
    throw new Error(
      `Notion property "${propertyName}" must exist and use type "${expectedType}". Current type: ${actualType || "missing"}.`,
    );
  }
}

function optionalProperty(database, propertyName, expectedType) {
  const actualType = propertyType(database, propertyName);
  if (!actualType) {
    console.warn(`Skipping optional Notion property "${propertyName}" because it does not exist.`);
    return false;
  }
  if (actualType !== expectedType) {
    console.warn(
      `Skipping optional Notion property "${propertyName}" because it is "${actualType}", not "${expectedType}".`,
    );
    return false;
  }
  return true;
}

function richText(content) {
  if (!content) {
    return [];
  }
  return [{ text: { content: content.slice(0, 2000) } }];
}

function numberProperty(properties, database, propertyName, value, required = false) {
  if (required) {
    requireProperty(database, propertyName, "number");
  } else if (!optionalProperty(database, propertyName, "number")) {
    return;
  }
  properties[propertyName] = { number: value };
}

function notionProperties(database, date, propertyId, summary, pages) {
  requireProperty(database, propertyNames.title, "title");
  requireProperty(database, propertyNames.date, "date");

  const siteHostName = env.SITE_HOSTNAME?.trim() || "zengjianhao.github.io";
  const topPagesText = pages.map((page) => `${page.path}: ${page.views}`).join("\n");
  const properties = {
    [propertyNames.title]: {
      title: [{ text: { content: `${siteHostName} ${date}` } }],
    },
    [propertyNames.date]: {
      date: { start: date },
    },
  };

  numberProperty(properties, database, propertyNames.pageViews, summary.screenPageViews, true);
  numberProperty(properties, database, propertyNames.activeUsers, summary.activeUsers, true);
  numberProperty(properties, database, propertyNames.sessions, summary.sessions);
  numberProperty(properties, database, propertyNames.newUsers, summary.newUsers);
  numberProperty(properties, database, propertyNames.eventCount, summary.eventCount);

  if (optionalProperty(database, propertyNames.topPages, "rich_text")) {
    properties[propertyNames.topPages] = { rich_text: richText(topPagesText) };
  }
  if (optionalProperty(database, propertyNames.gaProperty, "rich_text")) {
    properties[propertyNames.gaProperty] = { rich_text: richText(propertyId) };
  }
  if (optionalProperty(database, propertyNames.site, "url")) {
    properties[propertyNames.site] = { url: `https://${siteHostName}` };
  }

  return properties;
}

async function existingPage(databaseId, date) {
  const response = await notionFetch(`/databases/${databaseId}/query`, {
    method: "POST",
    body: JSON.stringify({
      filter: {
        property: propertyNames.date,
        date: {
          equals: date,
        },
      },
      page_size: 1,
    }),
  });
  return response.results?.[0];
}

async function upsertNotionPage(databaseId, date, properties) {
  const page = await existingPage(databaseId, date);
  if (page) {
    await notionFetch(`/pages/${page.id}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
    return { action: "updated", pageId: page.id };
  }

  const created = await notionFetch("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties,
    }),
  });
  return { action: "created", pageId: created.id };
}

async function main() {
  const date = reportDate();
  const propertyId = requiredEnv("GA_PROPERTY_ID");
  const databaseId = cleanNotionId(requiredEnv("NOTION_DATABASE_ID"));

  console.log(`Syncing GA property ${propertyId} for ${date}.`);

  const [accessToken, database] = await Promise.all([
    googleAccessToken(),
    notionDatabase(databaseId),
  ]);
  const [summary, pages] = await Promise.all([
    analyticsSummary(accessToken, propertyId, date),
    topPages(accessToken, propertyId, date),
  ]);
  const properties = notionProperties(database, date, propertyId, summary, pages);
  const result = await upsertNotionPage(databaseId, date, properties);

  console.log(
    `Notion page ${result.action}: ${result.pageId}. Page views=${summary.screenPageViews}, active users=${summary.activeUsers}, sessions=${summary.sessions}.`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
