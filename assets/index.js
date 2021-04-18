var imageListFirstItemId = null
var imageListLastItemId = null
var imageList = {}
var haveMargin = true
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
            callback();
        })(showImageList)
    }
});


$(function () {
    $(document).on('mouseenter', '.content >.images > img', function () {
        thisTop = $(this).offset().top+$(this).height()/2-20
        thisLeft = $(this).offset().left+190
        
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

})

function showImageTools(){
    $(theImage).css('opacity',0.6)
    $(theImage).css('filter','dropshadow(color=#666666,offx=3,offy=3,positive=2)')
    $('#image-tools').show()
}

function hideImageTools(){
    $('.content .images img').css('opacity',1)
    $('.content .images img').css('filter','')
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
function showImageList() {
    content = ""
    for (imageListKey in imageList) {
        theImageListItem = imageList[imageListKey]
        content += '<img src="' + theImageListItem.path + '" id="' + theImageListItem.id + '"></img>'
    }
    $(".content .images").html(content)
    exchangeMargin()
    $('.content .images').end().scrollTop($('.content .images').height())
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
    imageListFirstItemId = null
    imageListLastItemId = null
    showImageList()
}

//合成图片
function makeCollage() {
    if (Object.keys(imageList).length == 0) {
        showToast('warnToast', "未添加图片")
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
    showToast("toast", "保存成功")
    window.saveImage(imageFile, imgDataUrl)
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
    showImageList()
}

//加入图片
function appendImage(imagePath) {
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


