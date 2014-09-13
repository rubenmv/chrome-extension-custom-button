chrome.browserAction.onClicked.addListener(function (tabId) {
    var tabUrl = tabId.url;
    var pattern = /^(http|https):\/\/www\.youtube\.com\/watch.*/g;
    if (tabUrl !== undefined && pattern.test(tabUrl)) {
        // Youtube video url
        window.open('http://savefrom.net/?url=' + encodeURIComponent(tabUrl));
    } else {
        var options = {
            type: "basic",
            title: "Youtube Download",
            message: "No Youtube video found!",
            iconUrl: "icons/icon-128.png"
        };
        // No video alert
        chrome.notifications.create("", options, function () {});
    }
});