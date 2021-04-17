const fs = require('fs');
const sizeOf = require('image-size');


window.getImageWH = function (path) {
    var dimensions = sizeOf(path);
    return {
        "h": dimensions.height,
        "w": dimensions.width
    }
}

window.saveImage = function (filePath, base64Data) {
    base64Data = base64Data.replace(/^data:.+;base64,/, '');
    dataBuffer = new Buffer.from(base64Data, 'base64');
    fs.writeFile(filePath, dataBuffer, err => {
        if (err != null) {
            utools.showNotification('保存文件异常')
            return
        }else{
            utools.shellShowItemInFolder(filePath)
        }
    });
}