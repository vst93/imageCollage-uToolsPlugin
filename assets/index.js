var imageListFirstItemId = null
var imageListLastItemId = null
var imageList = {

}

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
            console.log(payloadVal.path)
            if (payloadVal.isDirectory == true) {
                return true;
            }
            theId = createGuid()
            // theId = payloadVal.name
            console.log(theId)
            theUpItemId = imageListLastItemId
            imageList[theId] = {
                "id": theId,
                "path": payloadVal.path,
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
            console.log("end")
        });
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



function makeCollage() {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");

    var cw = 0;
    var ch = 0;
    for (imageListKey in imageList) {
        theImageWH = window.getImageWH(imageList[imageListKey]["path"])
        if(cw==0){
            cw = theImageWH.w
        }
        var img = document.getElementById(imageListKey);
        ctx.drawImage(img, 0, theImageWH.w, theImageWH.h);
    }
    console.log(ctx.toDataURL())
}



