
var imageList = {}
var haveMargin = true
var theImage = null
var theOrientation = 1

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
    $(document).on('mouseover', '.content >.images > img', function () {
        thisTop = $(this).offset().top
        thisLeft = $(this).offset().left
        thisPT = ($(this).height() - 40) / 2
        thisPL = ($(this).width() - 120) / 2
        $('.content #image-tools').css('top', thisTop)
        $('.content #image-tools').css('left', thisLeft)
        $('.content #image-tools').css('padding-top', thisPT)
        $('.content #image-tools').css('padding-bottom', thisPT)
        $('.content #image-tools').css('padding-left', thisPL)
        $('.content #image-tools').css('padding-right', thisPL)
        theImage = this
        showImageTools()
    })
    $(document).on('mouseleave', '#image-tools', function () {
        hideImageTools()
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


    //横屏排版下
    $(document).on('mouseover', '.content2 >.images > img', function () {
        thisTop = $(this).offset().top
        thisLeft = $(this).offset().left
        thisPT = ($(this).height() - 40) / 2
        thisPL = ($(this).width() - 120) / 2
        $('.content2 #image-tools').css('top', thisTop)
        $('.content2 #image-tools').css('left', thisLeft)
        $('.content2 #image-tools').css('padding-top', thisPT)
        $('.content2 #image-tools').css('padding-bottom', thisPT)
        $('.content2 #image-tools').css('padding-left', thisPL)
        $('.content2 #image-tools').css('padding-right', thisPL)

        theImage = this
        showImageTools()
    })
    $(document).on('mouseleave', '#image-tools', function () {
        hideImageTools()
    })

    $(".content2").each(function (index, element) {
        element.onwheel = function (event) {
            if (event.wheelDeltaX != 0) {
                //触摸板操作
                return
            } else {
                //滚轮操作
                if (event.wheelDelta < 0) {
                    $('html').scrollLeft($('html').scrollLeft() + 100)
                } else {
                    $('html').scrollLeft($('html').scrollLeft() - 100)
                }
            }
        }
    })

    const dropwrapper = document;
    dropwrapper.addEventListener('drop', (e) => {
        e.preventDefault()
        const files = e.dataTransfer.files;

        if (files && files.length > 0) {
            //获取文件路径
            for (fileKey in files) {
                console.log(files[fileKey])
                if (files[fileKey].type != "image/jpeg" && files[fileKey].type != "image/jpeg"
                    && files[fileKey].type != "image/gif" && files[fileKey].type != "image/png"
                    && files[fileKey].type != "image/svg+xml" && files[fileKey].type != "application/x-bmp"
                    && files[fileKey].type != "image/webp"
                ) {
                    continue
                }
                const theImgPath = files[fileKey].path;
                if (theImgPath != undefined && theImgPath.length > 0) {
                    // console.log('path:', theImgPath);
                    appendImage(theImgPath)
                }
            }
            showImageList(true)
        }
    })
    dropwrapper.addEventListener('dragover', (e) => {
        e.preventDefault();
    })


    $('.picker').colpick({
        layout: 'hex',
        submit: 0,
        colorScheme: 'dark',
        onChange: function (hsb, hex, rgb, el, bySetColor) {
            // $(el).css('border-color', '#' + hex);
            $('.picker').css('border-color', '#' + hex);
            // Fill the text box just if the color was set using the picker, and not the colpickSetColor function.
            if (!bySetColor) {
                // $(el).val(hex);
                $('.picker').val(hex);
            }
            exchangeBgColor()
        }
    }).keyup(function () {
        // $(this).colpickSetColor(this.value);
        $('.picker').colpickSetColor(this.value);
    });
})

function showImageTools() {
    // $(theImage).css('opacity', 0.6)
    // $(theImage).css('filter', 'dropshadow(color=#666666,offx=3,offy=3,positive=2)')
    $('.content #image-tools').show()
    $('.content2 #image-tools').show()
}

function hideImageTools() {
    // $('.content .images img').css('opacity', 1)
    // $('.content .images img').css('filter', '')
    $('.content #image-tools').hide()

    // $('.content2 .images img').css('opacity', 1)
    // $('.content2 .images img').css('filter', '')
    $('.content2 #image-tools').hide()
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

    outputWidth()
    if (theOrientation == 2) {
        showImageList2(scrollTop)
        return
    }
    var st = $('.content .images').end().scrollTop()
    var content = ""
    // console.log(imageList)
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
    $(function () {
        if (scrollTop == true) {
            $('.content .images').end().scrollTop($('.content .images').height())
        } else {
            $('.content .images').end().scrollTop(st)
        }
    })

}

//切换边框配置
function exchangeMargin() {
    if (theOrientation == 2) {
        exchangeMargin2()
        return
    }
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
    var theColor = "#FFFFFF"
    if ($('.picker').val().length > 0){
        theColor = "#" + $('.picker').val()
    }
    $(".content .images").css('background', theColor);
    $(".content2 .images").css('background', theColor);
}

//切换横竖排版
function exchangeOrientation() {
    if (theOrientation == 1) {
        theOrientation = 2
        $('.content').hide()
        $('.content2').show()
    } else {
        theOrientation = 1
        $('.content2').hide()
        $('.content').show()
    }

    showImageList()
}

//刷新开关对应的状态
function refreshCheckBoxStatus(idName, theVal) {
    // console.log(theOrientation)
    // console.log(window[theVal])
    if (window[theVal] == true) {
        $("#" + idName).prop("checked", true);
        $("#" + idName + "2").prop("checked", true);
    } else {
        $("#" + idName).prop("checked", false);
        $("#" + idName + "2").prop("checked", false);
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
    if (theOrientation == 2) {
        makeCollage2()
        return
    }
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

    if ($("#outputWidth").val()>0){
        imageCommonW = Number($("#outputWidth").val())
        cw = imageCommonW
    }


    var theItemid = imageListFirstItemId
    while (theItemid != null && imageList[theItemid] != undefined) {
        theImageListItem = imageList[theItemid]
        try {
            theImageWH = window.getImageWH(imageList[theItemid]["path"])
        } catch (err) {
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

    //背景色
    var theColor = "#FFFFFF"
    if ($('.picker').val().length > 0) {
        theColor = "#" + $('.picker').val()
    }
    ctx.fillStyle = theColor

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
        // console.log('HHH22', theImageWH)
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
    // console.log(imagePath)
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




//渲染图片列表
function showImageList2(scrollTopSta) {
    var sl = $('html').scrollLeft()
    // console.log(sl)

    var content = ""
    // console.log(imageList)
    if (Object.keys(imageList).length == 0) {
        $(".content2 .images").html('')
        $(".content2 .images").css('padding', '0');
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
    (function (cb) {
        $(".content2 .images").html(content)
        exchangeMargin()
        cb
    })(function () {
        // console.log($('.content2 .images').width())
        // console.log(scrollTopSta)
        $(function () {
            if (scrollTopSta == true) {
                $('html').scrollLeft($('.content2 .images').width())
            } else {
                $('html').scrollLeft(sl)
            }
        })

    }())

}


//合成图片-横屏
function makeCollage2() {
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
    var imageCommonH = 0

    if ($("#outputHight").val() > 0) {
        imageCommonH = Number($("#outputHight").val())
        ch = imageCommonH
    }

    var theItemid = imageListFirstItemId
    while (theItemid != null && imageList[theItemid] != undefined) {
        theImageListItem = imageList[theItemid]
        try {
            theImageWH = window.getImageWH(imageList[theItemid]["path"])
        } catch (err) {
            $("#loadingToast").hide()
            return
        }
        if (ch == 0) {
            ch = theImageWH.h
            imageCommonH = theImageWH.h
        }
        theW = theImageWH.w * ch / theImageWH.h
        cw += theW
        theItemid = theImageListItem.next
    }

    //添加间隙
    if (haveMargin == true) {
        ch += ch / 100 * 2
        cw += ch / 100 * (Object.keys(imageList).length + 1)
    }

    var c = document.getElementById("myCanvas");
    document.getElementById("myCanvas").width = cw;
    document.getElementById("myCanvas").height = ch;
    var ctx = c.getContext("2d");


    //背景色
    var theColor = "#FFFFFF"
    if ($('.picker').val().length > 0) {
        theColor = "#" + $('.picker').val()
    }
    ctx.fillStyle = theColor

    ctx.fillRect(0, 0, cw, ch);
    var theY = 0
    var theX = 0

    if (haveMargin == true) {
        theY = imageCommonH / 100
    }

    var theItemid = imageListFirstItemId
    while (theItemid != null && imageList[theItemid] != undefined) {
        theImageListItem = imageList[theItemid]
        if (haveMargin == true) {
            theX += imageCommonH / 100
        }
        theImageWH = window.getImageWH(imageList[theItemid]["path"])
        // console.log('HHH22', theImageWH)
        var img = document.getElementById(theItemid);
        theW = theImageWH.w * imageCommonH / theImageWH.h

        ctx.drawImage(img, theX, theY, theW, imageCommonH);
        theX += theW
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


//切换边框
function exchangeMargin2() {
    if (haveMargin == true) {
        $(".content2 .images").css('padding', '5px');
        $(".content2 .images img").css('margin-right', '5px');
    } else {
        $(".content2 .images").css('padding', '0');
        $(".content2 .images img").css('margin-right', '0');
    }
    $(".content2 .images img").last().css("margin-right", "0")
}


//计算首图宽度
function outputWidth() {
    var imageListFirstItemId = null
    for (imageListKey in imageList) {
        theImageListItem = imageList[imageListKey]
        if (theImageListItem.up == null) {
            imageListFirstItemId = imageListKey
            break
        }
    }
    var theW = ''
    var theH = ''
    if (imageListFirstItemId != null) {
        var theImageWH = window.getImageWH(imageList[imageListFirstItemId]["path"])
        theW = theImageWH.w
        theH = theImageWH.h
    }
    $("#outputWidth").val(theW)
    $("#outputHight").val(theH)
}