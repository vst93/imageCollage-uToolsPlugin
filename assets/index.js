var imageListFirstItemId = null
var imageListLastItemId = null
var imageList = {}
var haveMargin = true

utools.onPluginEnter(({ code, type, payload }) => {
    // if (utools.isDarkColors()) {
    //     $(document.body).addClass('dark-mode');
    // } else {
    //     $(document.body).removeClass('dark-mode');
    // }
    // recommendPic()
    // utools.setExpendHeight(0);
    // utools.setSubInput(({
    //     text
    // }) => {
    //     this.text = text
    //     this.page = 1
    //     if (text[text.length - 1] == ' ') {
    //         text = text.replace(/(\s*$)/g, "");
    //         this.text = text;
    //         utools.setSubInputValue(text)
    //         enterText();
    //     }
    // }, "想搜点啥（搜索结果点击即可复制到剪切板）");

    if (type == "files") {
        payload.forEach(payloadVal => {
            // console.log(payloadVal.path)
            if (payloadVal.isDirectory == true) {
                return true;
            }
            appendImage(payloadVal.path)
            // theId = createGuid()
            // // theId = payloadVal.name
            // console.log(theId)
            // theUpItemId = imageListLastItemId
            // imageList[theId] = {
            //     "id": theId,
            //     "path": payloadVal.path,
            //     "up": theUpItemId,
            //     "next": null
            // }
            // if (imageListLastItemId != null) {
            //     imageList[imageListLastItemId]["next"] = theId
            // }
            // imageListLastItemId = theId

            // if (imageListFirstItemId == null) {
            //     imageListFirstItemId = theId
            // }
            // console.log("end")
        })
    }
    showImageList();
});


function createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


function showImageList() {
    content = ""
    for (imageListKey in imageList) {
        theImageListItem = imageList[imageListKey]
        content += '<img src="' + theImageListItem.path + '" id="' + theImageListItem.id + '"></img>'
    }
    console.log(content)
    $(".content .images").html(content)
    $(".content .images img").last().css("margin-bottom", "0")
}

function refreshCheckBoxStatus(idName, theVal) {
    if (window[theVal] == true) {
        $("#" + idName).attr("checked", true);
    } else {
        $("#" + idName).attr("checked", false);
    }
}

function exchangeCheckBoxStatus(idName, theVal) {
    window[theVal] = !window[theVal]
    refreshCheckBoxStatus(idName, theVal)
}

function clearImageList(){
    imageList = {}
    showImageList()
}

function makeCollage() {
    if (Object.keys(imageList).length==0){
        showToast('warnToast',"未添加图片")
        return
    }
    var cw = 0;
    var ch = 0;
    var imageCommonW = 0
    //计算所需canvas宽高
    for (imageListKey in imageList) {
        theImageWH = window.getImageWH(imageList[imageListKey]["path"])
        if (cw == 0) {
            cw = theImageWH.w
            imageCommonW = theImageWH.w
        }
        theH = theImageWH.h * cw / theImageWH.w
        ch += theH
    }

    //添加间隙
    if (haveMargin == true) {
        cw += cw / 100 * 2
        ch += cw / 100 * (Object.keys(imageList).length + 1)
    }

    var c = document.getElementById("myCanvas");
    document.getElementById("myCanvas").width = cw;
    document.getElementById("myCanvas").height = ch;
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, cw, ch);
    var theY = 0
    var theX = 0

    if (haveMargin == true) {
        theX = imageCommonW / 100
    }
    for (imageListKey in imageList) {
        if (haveMargin == true) {
            theY += imageCommonW / 100
        }
        theImageWH = window.getImageWH(imageList[imageListKey]["path"])
        var img = document.getElementById(imageListKey);
        theH = theImageWH.h * imageCommonW / theImageWH.w

        ctx.drawImage(img, theX, theY, imageCommonW, theH);
        theY += theH
    }

    imgDataUrl = c.toDataURL()
    // utools.copyImage(imgDataUrl)
    imageFile = utools.getPath('downloads') + '/' + new Date().getTime() + '.png'
    showToast("toast","保存成功")
    window.saveImage(imageFile, imgDataUrl)
}


function showToast(idName,theText){
    $("#" + idName + " .weui-toast .weui-toast__content").text(theText)
    var $toast = $('#'+idName);
    if ($toast.css('display') != 'none') return;
    $toast.fadeIn(100);
    setTimeout(function () {
        $toast.fadeOut(100);
    }, 2000);
}

function addImage(){
    v = utools.showOpenDialog({
        filters: [{ 'name': 'Images', extensions: ['jpg','jpeg','gif','png','bmp','webp'] }],
        properties: ['openFile','multiSelections']
    })
    if(v==undefined){
        return
    }
    for (vk in v){
        appendImage(v[vk]) 
    }
    showImageList()
}

function appendImage(imagePath){
    console.log(imagePath)
    theId = createGuid()
    theUpItemId = imageListLastItemId
    imageList[theId] = {
        "id": theId,
        "path": imagePath,
        "up": theUpItemId,
        "next": null
    }
    if (imageListLastItemId != null) {
        imageList[imageListLastItemId]["next"] = theId
    }
    imageListLastItemId = theId

    if (imageListFirstItemId == null) {
        imageListFirstItemId = theId
    }
}
