/* GLOBALS */
var customUrlGlobal,
    domainGlobal,
    notificationGlobal;

function initOptions() {
    function dataRetrieved(items) {
        // Check for error
        if (chrome.runtime.lastError !== undefined) {
            console.log("An error ocurred initializing options: " + chrome.runtime.lastError.string);
            return;
        }
        // Initialize
        customUrlGlobal = items.customUrl;
        domainGlobal = items.domain;
        notificationGlobal = items.notification;
    }

    // Get the items from storage (asynchronous)
    chrome.storage.sync.get({
        // Sets some default values before retrieving data
        customUrl: '',
        domain: ".*",
        notification: false
    }, dataRetrieved);
}

// "OnLoad" listener to set the default options
document.addEventListener('DOMContentLoaded', initOptions);

chrome.browserAction.onClicked.addListener(function (tabId) {
    "use strict";

    var tabUrl = tabId.url,
        domainRegExp = new RegExp(domainGlobal);

    // Check if the active tab url matches the allowed domains for the button to activate
    if (tabUrl !== undefined && domainRegExp.test(tabUrl)) {
        // Replace %url with tab url
        window.open(customUrlGlobal.replace('%url', tabUrl));
    } else if (notificationGlobal === true) {
        var options = {
            type: "basic",
            title: "Custom Button",
            message: "URL not valid",
            iconUrl: "icons/icon-128.png"
        };
        // No video alert
        chrome.notifications.create("", options, function () {});
    }
});

//  ^(http|https)://*/*
// Settings changes
chrome.storage.onChanged.addListener(function (changes, namespace) {
    "use strict";
    var key, storageChange;

    for (key in changes) {
        if (changes.hasOwnProperty(key)) {
            storageChange = changes[key];
            if (key === 'customUrl') {
                customUrlGlobal = storageChange.newValue;
            } else if (key === 'notification') {
                notificationGlobal = storageChange.newValue;
            } else if (key === 'domain') {
                domainGlobal = storageChange.newValue;
            }

            /*
            console.log('Storage key %s in namespace %s changed. Old value was %s, new value is %s.',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);
            */
        }
    }
});