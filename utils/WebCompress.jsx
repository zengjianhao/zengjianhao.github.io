function main() {
    var inputFolder = Folder.selectDialog("请选择文件夹");
    if (inputFolder == null) return;

    var outputFolder = Folder.selectDialog("请选择一个新的文件夹来保存压缩后的图片");
    if (outputFolder == null) return;

    var files = inputFolder.getFiles(/\.(jpg|jpeg|png)$/i);

    var maxDimension = 512;
    var targetSizeLimit = 150 * 1024;
    app.displayDialogs = DialogModes.NO;
    var count = 0;

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var doc = app.open(file);

        var width = doc.width.value;
        var height = doc.height.value;
        var ratio = 1;

        if (width > maxDimension || height > maxDimension) {
            if (width > height) {
                ratio = maxDimension / width;
            } else {
                ratio = maxDimension / height;
            }
        }

        if (ratio < 1) {
            doc.resizeImage(width * ratio, height * ratio, 72, ResampleMethod.BICUBIC);
        }

        var newFileName = file.name.replace(/\.(png|jpeg|jpg)$/i, ".jpg");
        var newFile = new File(outputFolder + "/" + newFileName);
        var quality = 80;

        while (quality >= 10) {
            var exportOptions = new ExportOptionsSaveForWeb();
            exportOptions.format = SaveDocumentType.JPEG;
            exportOptions.quality = quality;
            exportOptions.includeProfile = false;
            exportOptions.optimized = true;

            doc.exportDocument(newFile, ExportType.SAVEFORWEB, exportOptions);

            if (newFile.length <= targetSizeLimit) {
                break;
            }
            quality -= 10;
        }

        doc.close(SaveOptions.DONOTSAVECHANGES);
        count++;
    }

    app.displayDialogs = DialogModes.ALL;
}

main();