# Hi! 👋

This is my personal website, built with [Tailwind CSS](https://tailwindcss.com/).


## Usage

Clone the repository and install dependencies:

```bash
git clone https://github.com/zengjianhao/zengjianhao.github.io.git
cd zengjianhao.github.io
npm ci
```

Start the Tailwind CSS watcher:

```bash
npm run dev
```

In another terminal, start a local static server:

```bash
python3 -m http.server 8000 --directory src
```

Then visit [localhost:8000](http://localhost:8000).

Build the stylesheet once for production with minification:

```bash
npm run build
```
