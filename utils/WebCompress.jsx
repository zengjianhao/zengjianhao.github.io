var TARGET_SIZE_LIMIT = 10 * 1000 * 1000;
var MAX_JPEG_QUALITY = 100;
var MIN_JPEG_QUALITY = 72;
var FALLBACK_MIN_JPEG_QUALITY = 50;
var MIN_SCALE = 0.05;
var SCALE_SEARCH_STEPS = 6;
var INCLUDE_COLOR_PROFILE = true;

function main() {
    var inputFolder = Folder.selectDialog("请选择文件夹");
    if (inputFolder == null) return;

    var outputFolder = Folder.selectDialog("请选择一个文件夹来保存处理后的图片");
    if (outputFolder == null) return;

    var files = inputFolder.getFiles(/\.(jpg|jpeg|png)$/i);
    if (files.length === 0) {
        alert("没有找到 jpg、jpeg 或 png 图片。");
        return;
    }

    var originalDialogs = app.displayDialogs;
    var originalRulerUnits = app.preferences.rulerUnits;
    app.displayDialogs = DialogModes.NO;
    app.preferences.rulerUnits = Units.PIXELS;

    var copiedCount = 0;
    var compressedCount = 0;
    var failedCount = 0;
    var failedMessages = [];

    try {
        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            try {
                if (getFileSize(file) <= TARGET_SIZE_LIMIT) {
                    copyOriginalFile(file, outputFolder);
                    copiedCount++;
                } else {
                    compressFile(file, outputFolder);
                    compressedCount++;
                }
            } catch (error) {
                failedCount++;
                failedMessages.push(file.name + ": " + error.message);
            }
        }
    } finally {
        app.displayDialogs = originalDialogs;
        app.preferences.rulerUnits = originalRulerUnits;
    }

    var message = "处理完成\n"
        + "原样复制: " + copiedCount + "\n"
        + "压缩输出: " + compressedCount + "\n"
        + "失败: " + failedCount;

    if (failedMessages.length > 0) {
        message += "\n\n失败文件:\n" + failedMessages.slice(0, 10).join("\n");
    }

    alert(message);
}

function copyOriginalFile(file, outputFolder) {
    var outputFile = makeOutputFile(file, outputFolder, file.name, "_copy");

    if (!file.copy(outputFile.fsName)) {
        throw new Error("原文件小于 10MB，但复制失败。");
    }
}

function compressFile(file, outputFolder) {
    var doc = null;
    var outputFile = makeOutputFile(file, outputFolder, getBaseName(file.name) + ".jpg", "_compressed");

    try {
        doc = app.open(file);
        prepareDocumentForWeb(doc);
        compressDocumentToLimit(doc, outputFile);
    } catch (error) {
        removeFileIfExists(outputFile);
        throw error;
    } finally {
        if (doc != null) {
            doc.close(SaveOptions.DONOTSAVECHANGES);
        }
    }

    if (!outputFile.exists) {
        throw new Error("压缩失败，没有生成输出文件。");
    }

    if (getFileSize(outputFile) > TARGET_SIZE_LIMIT) {
        removeFileIfExists(outputFile);
        throw new Error("无法压缩到 10MB 以内。");
    }
}

function compressDocumentToLimit(doc, outputFile) {
    var originalWidth = doc.width.value;
    var originalHeight = doc.height.value;
    var originalState = doc.activeHistoryState;

    setScaleFromOriginal(doc, originalState, originalWidth, originalHeight, 1);
    var fullSizeAtMinQuality = exportJpeg(doc, outputFile, MIN_JPEG_QUALITY);

    if (fullSizeAtMinQuality <= TARGET_SIZE_LIMIT) {
        setScaleFromOriginal(doc, originalState, originalWidth, originalHeight, 1);
        findBestQualityUnderLimit(doc, outputFile, MIN_JPEG_QUALITY, MAX_JPEG_QUALITY);
        return;
    }

    var highScale = 1;
    var lowScale = Math.sqrt(TARGET_SIZE_LIMIT / fullSizeAtMinQuality) * 0.98;
    lowScale = clamp(lowScale, MIN_SCALE, 0.95);

    setScaleFromOriginal(doc, originalState, originalWidth, originalHeight, lowScale);
    var lowSize = exportJpeg(doc, outputFile, MIN_JPEG_QUALITY);
    var guard = 0;

    while (lowSize > TARGET_SIZE_LIMIT && lowScale > MIN_SCALE && guard < 10) {
        highScale = lowScale;
        lowScale = Math.min(lowScale * 0.85, lowScale * Math.sqrt(TARGET_SIZE_LIMIT / lowSize) * 0.98);
        lowScale = clamp(lowScale, MIN_SCALE, highScale);

        setScaleFromOriginal(doc, originalState, originalWidth, originalHeight, lowScale);
        lowSize = exportJpeg(doc, outputFile, MIN_JPEG_QUALITY);
        guard++;
    }

    if (lowSize <= TARGET_SIZE_LIMIT) {
        for (var i = 0; i < SCALE_SEARCH_STEPS; i++) {
            var midScale = (lowScale + highScale) / 2;
            setScaleFromOriginal(doc, originalState, originalWidth, originalHeight, midScale);

            if (exportJpeg(doc, outputFile, MIN_JPEG_QUALITY) <= TARGET_SIZE_LIMIT) {
                lowScale = midScale;
            } else {
                highScale = midScale;
            }
        }

        setScaleFromOriginal(doc, originalState, originalWidth, originalHeight, lowScale);
        findBestQualityUnderLimit(doc, outputFile, MIN_JPEG_QUALITY, MAX_JPEG_QUALITY);
        return;
    }

    setScaleFromOriginal(doc, originalState, originalWidth, originalHeight, MIN_SCALE);
    findBestQualityUnderLimit(doc, outputFile, FALLBACK_MIN_JPEG_QUALITY, MAX_JPEG_QUALITY);
}

function findBestQualityUnderLimit(doc, outputFile, minQuality, maxQuality) {
    var minSize = exportJpeg(doc, outputFile, minQuality);
    if (minSize > TARGET_SIZE_LIMIT) {
        throw new Error("最低质量下仍超过 " + formatMB(TARGET_SIZE_LIMIT) + "。");
    }

    var maxSize = exportJpeg(doc, outputFile, maxQuality);
    if (maxSize <= TARGET_SIZE_LIMIT) {
        return;
    }

    var low = minQuality;
    var high = maxQuality;
    var bestQuality = minQuality;

    while (low <= high) {
        var quality = Math.floor((low + high) / 2);
        var size = exportJpeg(doc, outputFile, quality);

        if (size <= TARGET_SIZE_LIMIT) {
            bestQuality = quality;
            low = quality + 1;
        } else {
            high = quality - 1;
        }
    }

    exportJpeg(doc, outputFile, bestQuality);
}

function exportJpeg(doc, outputFile, quality) {
    removeFileIfExists(outputFile);

    var exportOptions = new ExportOptionsSaveForWeb();
    exportOptions.format = SaveDocumentType.JPEG;
    exportOptions.quality = quality;
    exportOptions.includeProfile = INCLUDE_COLOR_PROFILE;
    exportOptions.optimized = true;

    doc.exportDocument(outputFile, ExportType.SAVEFORWEB, exportOptions);
    return getFileSize(outputFile);
}

function prepareDocumentForWeb(doc) {
    try {
        if (doc.bitsPerChannel !== BitsPerChannelType.EIGHT) {
            doc.bitsPerChannel = BitsPerChannelType.EIGHT;
        }
    } catch (error) {
    }

    try {
        if (doc.mode !== DocumentMode.RGB) {
            doc.changeMode(ChangeMode.RGB);
        }
    } catch (error) {
    }
}

function setScaleFromOriginal(doc, originalState, originalWidth, originalHeight, scale) {
    doc.activeHistoryState = originalState;

    if (scale >= 0.999) {
        return;
    }

    var width = Math.max(1, Math.round(originalWidth * scale));
    var height = Math.max(1, Math.round(originalHeight * scale));
    doc.resizeImage(UnitValue(width, "px"), UnitValue(height, "px"), doc.resolution, getResizeMethod());
}

function getResizeMethod() {
    try {
        if (ResampleMethod.BICUBICSHARPER) {
            return ResampleMethod.BICUBICSHARPER;
        }
    } catch (error) {
    }

    return ResampleMethod.BICUBIC;
}

function makeOutputFile(inputFile, outputFolder, outputName, sameFileSuffix) {
    var outputFile = new File(outputFolder.fsName + "/" + outputName);

    if (isSamePath(inputFile, outputFile)) {
        outputFile = new File(
            outputFolder.fsName + "/" + getBaseName(outputName) + sameFileSuffix + getExtension(outputName)
        );
    }

    removeFileIfExists(outputFile);

    return outputFile;
}

function getFileSize(file) {
    var freshFile = new File(file.fsName);
    return freshFile.length;
}

function removeFileIfExists(file) {
    var freshFile = new File(file.fsName);

    if (freshFile.exists) {
        freshFile.remove();
    }
}

function isSamePath(fileA, fileB) {
    return fileA.fsName.toLowerCase() === fileB.fsName.toLowerCase();
}

function getBaseName(fileName) {
    return fileName.replace(/\.[^\.]+$/, "");
}

function getExtension(fileName) {
    var match = fileName.match(/(\.[^\.]+)$/);
    return match ? match[1] : "";
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function formatMB(bytes) {
    return (bytes / 1000 / 1000).toFixed(2) + "MB";
}

main();
