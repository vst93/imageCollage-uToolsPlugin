
var imageList = {}
var haveMargin = true
var bgColor = true
var theImage = null

utools.onPluginEnter(({ code, type, payload }) => {
    if (type == "files") {
        (function (callback) {
            payload.forEach(payloadVal => {
                if (payloadVal.isDirectory == true) {
                    return true;
                }
                appendImage(payloadVal.path)
            })
            callback(true);
        })(showImageList)
    } else {
        showImageList()
    }
});


$(function () {
    $(document).on('mouseenter', '.content >.images > img', function () {
        thisTop = $(this).offset().top + $(this).height() / 2 - 20
        thisLeft = $(this).offset().left + 190

        $('#image-tools').css('top', thisTop)
        $('#image-tools').css('left', thisLeft)
        theImage = this
        showImageTools()
    })
    $(document).on('mouseleave', '.content >.images', function () {
        hideImageTools()
    })
    $(document).on('mouseover', '#image-tools', function () {
        showImageTools()
    })
    $(document).on('mouseover', '#image-tools p', function () {
        showImageTools()
    })

    //快捷键
    document.onkeydown = function (ev) {
        var oEvent = ev || window.event;
        var cmKey = oEvent.ctrlKey || oEvent.metaKey
        if (cmKey && oEvent.keyCode == 83) {
            makeCollage()
        }
        if (cmKey && oEvent.keyCode == 65) {
            addImage()
        }
        if (cmKey && oEvent.keyCode == 68) {
            clearImageList()
        }
    }

})

function showImageTools() {
    $(theImage).css('opacity', 0.6)
    $(theImage).css('filter', 'dropshadow(color=#666666,offx=3,offy=3,positive=2)')
    $('#image-tools').show()
}

function hideImageTools() {
    $('.content .images img').css('opacity', 1)
    $('.content .images img').css('filter', '')
    $('#image-tools').hide()
}

//获取唯一id
function createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

//渲染图片列表
function showImageList(scrollTop) {
    content = ""
    console.log(imageList)
    if (Object.keys(imageList).length == 0) {
        $(".content .images").html('')
        $(".content .images").css('padding', '0');
        return
    }
    var imageListFirstItemId = null
    for (imageListKey in imageList) {
        theImageListItem = imageList[imageListKey]
        if (theImageListItem.up == null) {
            imageListFirstItemId = imageListKey
            break
        }
    }

    var theItemid = imageListFirstItemId
    while (theItemid != null && imageList[theItemid] != undefined) {
        theImageListItem = imageList[theItemid]
        content += '<img src="' + theImageListItem.path + '?' + (new Date()).valueOf() + '" id="' + theImageListItem.id + '"></img>'
        theItemid = theImageListItem.next
    }
    $(".content .images").html(content)
    exchangeMargin()
    if (scrollTop == true) {
        $('.content .images').end().scrollTop($('.content .images').height())
    }
}

//切换边框配置
function exchangeMargin() {
    if (haveMargin == true) {
        $(".content .images").css('padding', '5px');
        $(".content .images img").css('margin-bottom', '5px');
    } else {
        $(".content .images").css('padding', '0');
        $(".content .images img").css('margin-bottom', '0');
    }
    $(".content .images img").last().css("margin-bottom", "0")
}

//切换背景颜色
function exchangeBgColor() {
    if (bgColor == true) {
        $(".content .images").css('background', '#FFFFFF');
    } else {
        $(".content .images").css('background', '#000000');
    }
}

//刷新开关对应的状态
function refreshCheckBoxStatus(idName, theVal) {
    if (window[theVal] == true) {
        $("#" + idName).attr("checked", true);
    } else {
        $("#" + idName).attr("checked", false);
    }
}

//切换开关
function exchangeCheckBoxStatus(idName, theVal) {
    window[theVal] = !window[theVal]
    refreshCheckBoxStatus(idName, theVal)
}

//清空图片列表
function clearImageList() {
    imageList = {}
    showImageList(true)
}

//合成图片
function makeCollage() {
    $("#loadingToast").show()
    if (Object.keys(imageList).length == 0) {
        showToast('warnToast', "未添加图片")
        $("#loadingToast").hide()
        return
    }
    var imageListFirstItemId = null
    for (imageListKey in imageList) {
        theImageListItem = imageList[imageListKey]
        if (theImageListItem.up == null) {
            imageListFirstItemId = imageListKey
            break
        }
    }

    //计算所需canvas宽高
    var cw = 0;
    var ch = 0;
    var imageCommonW = 0
    var theItemid = imageListFirstItemId
    while (theItemid != null && imageList[theItemid] != undefined) {
        theImageListItem = imageList[theItemid]
        try{
            theImageWH = window.getImageWH(imageList[theItemid]["path"])
        }catch(err){
            $("#loadingToast").hide()
            return
        }
        if (cw == 0) {
            cw = theImageWH.w
            imageCommonW = theImageWH.w
        }
        theH = theImageWH.h * cw / theImageWH.w
        ch += theH
        theItemid = theImageListItem.next
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
    if (bgColor == false) {
        ctx.fillStyle = "#000000";
    } else {
        ctx.fillStyle = "#FFFFFF";
    }
    ctx.fillRect(0, 0, cw, ch);
    var theY = 0
    var theX = 0

    if (haveMargin == true) {
        theX = imageCommonW / 100
    }

    var theItemid = imageListFirstItemId
    while (theItemid != null && imageList[theItemid] != undefined) {
        theImageListItem = imageList[theItemid]
        if (haveMargin == true) {
            theY += imageCommonW / 100
        }
        theImageWH = window.getImageWH(imageList[theItemid]["path"])
        console.log('HHH22', theImageWH)
        var img = document.getElementById(theItemid);
        theH = theImageWH.h * imageCommonW / theImageWH.w

        ctx.drawImage(img, theX, theY, imageCommonW, theH);
        theY += theH
        theItemid = theImageListItem.next
    }

    imgDataUrl = c.toDataURL()
    // utools.copyImage(imgDataUrl)
    if (utools.isWindows()) {
        imageFile = utools.getPath('downloads') + '\\' + new Date().getTime() + '.png'
    } else {
        imageFile = utools.getPath('downloads') + '/' + new Date().getTime() + '.png'
    }
    setTimeout(function () { window.saveImage(imageFile, imgDataUrl) }, 0);
}

//显示提示框
function showToast(idName, theText) {
    $("#" + idName + " .weui-toast .weui-toast__content").text(theText)
    var $toast = $('#' + idName);
    if ($toast.css('display') != 'none') return;
    $toast.fadeIn(100);
    setTimeout(function () {
        $toast.fadeOut(100);
    }, 2000);
}

//选择图片文件
function addImage() {
    v = utools.showOpenDialog({
        filters: [{ 'name': 'Images', extensions: ['jpg', 'jpeg', 'gif', 'png', 'bmp', 'webp'] }],
        properties: ['openFile', 'multiSelections']
    })
    if (v == undefined) {
        return
    }
    for (vk in v) {
        appendImage(v[vk])
    }
    showImageList(true)
}

//加入图片
function appendImage(imagePath) {

    var imageListFirstItemId = null
    var imageListLastItemId = null
    for (imageListKey in imageList) {
        theImageListItem = imageList[imageListKey]
        if (theImageListItem.up == null) {
            imageListFirstItemId = imageListKey
        }
        if (theImageListItem.next == null) {
            imageListLastItemId = imageListKey
        }
    }
    console.log(imagePath)
    theId = createGuid()
    // theId = imagePath
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
}

//删除图片
function toDel() {
    if (theImage == null) {
        return
    }
    var theImageId = $(theImage).attr('id') //当前项
    if (theImageId == null) {
        return
    }
    var theUpItemId = imageList[theImageId]['up']  //上一项   
    var theNextItemId = imageList[theImageId]['next']  //下一项
    if (theUpItemId != null) {
        imageList[theUpItemId]['next'] = imageList[theImageId]['next']
    }
    //theImage 不是最后一项
    if (theNextItemId != null) {
        imageList[theNextItemId]['up'] = theUpItemId
    }
    delete imageList[theImageId]
    hideImageTools()
    showImageList(false)
}

//上移
function toUp() {
    if (theImage == null) {
        return
    }
    var theImageId = $(theImage).attr('id') //当前项
    var theUpItemId = imageList[theImageId]['up']  //上一项
    var theUpUpItemId = null   //上上一项
    if (theUpItemId != null) {
        var theUpUpItemId = imageList[theUpItemId]['up']
    }
    var theNextItemId = imageList[theImageId]['next']  //下一项
    //已经是第一项
    if (theUpItemId == null) {
        return
    }
    imageList[theImageId]['up'] = imageList[theUpItemId]['up']
    imageList[theUpItemId]['up'] = theImageId
    imageList[theUpItemId]['next'] = imageList[theImageId]['next']
    imageList[theImageId]['next'] = theUpItemId
    //theImage 不是最后一项
    if (theNextItemId != null) {
        imageList[theNextItemId]['up'] = theUpItemId
    }
    //上上项的next修改
    if (theUpUpItemId != null) {
        imageList[theUpUpItemId]['next'] = theImageId
    }
    hideImageTools()
    showImageList(false)
}

//下移
function toNext() {
    if (theImage == null) {
        return
    }
    var theImageId = $(theImage).attr('id') //当前项
    var theNextItemId = imageList[theImageId]['next']  //下一项
    var theNextNextItemId = null   //下下一项
    if (theNextItemId != null) {
        theNextNextItemId = imageList[theNextItemId]['next']
    }
    var theUpItemId = imageList[theImageId]['up']  //上一项
    //已经是最后一项
    if (theNextItemId == null) {
        return
    }
    imageList[theImageId]['next'] = imageList[theNextItemId]['next']
    imageList[theNextItemId]['next'] = theImageId
    imageList[theNextItemId]['up'] = imageList[theImageId]['up']
    imageList[theImageId]['up'] = theNextItemId
    //theImage 不是第一项
    if (theUpItemId != null) {
        imageList[theUpItemId]['next'] = theNextItemId
    }
    //下下一项的up修改
    if (theNextNextItemId != null) {
        imageList[theNextNextItemId]['up'] = theImageId
    }
    hideImageTools()
    showImageList(false)
}

