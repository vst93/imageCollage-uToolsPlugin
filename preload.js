const electron = require('electron')
const { clipboard } = require('electron')
const app = electron.app
const path = require('path')
const http = require('http');
const https = require('https');
const fs = require('fs');
const os = require('os');
const nativeImage = require('electron').nativeImage
const sizeOf = require('image-size');


matchImgUrl = str => {
    var reg = /data-original="(.*?)"/gim;
    var res = []
    while (re = reg.exec(str)) {
        res.push(re[1])
    }
    return res;
}


window.getImageWH = function(path) {
    var dimensions = sizeOf(path);
    return {
        "h": dimensions.height,
        "w": dimensions.width
    }
}
