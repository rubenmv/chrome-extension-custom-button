// Called when the url of a tab changes.
function checkForValidUrl(tabId, changeInfo, tab) {
    // If the tabs url starts with "http://specificsite.com"...
    var pattern = /^(http|https):\/\/www\.youtube\.com\/watch.*/g;
    if (tab.url !== undefined && pattern.test(tab.url)) {
        // ... show the page action.
        chrome.pageAction.show(tabId);
    }
}

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);

chrome.pageAction.onClicked.addListener(function (tabId) {
    var tabUrl = tabId.url;
    // No need to check here, if the button exists the url is correct
    if (tabUrl !== undefined) {
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