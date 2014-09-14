chrome.browserAction.onClicked.addListener(function (tabId) {
    "use strict";

    function dataRetrieved(items) {
        // Check for error
        if (chrome.runtime.lastError !== undefined) {
            console.log("An error ocurred retrieveing options: " + chrome.runtime.lastError.string);
            return;
        }

        var customUrl = items.command, // Custom url by the user
            pattern = new RegExp(items.domain), // Regexp where the button should work
            notification = items.notification,
            tabUrl = tabId.url; // Current tab url

        // Check if the active tab url matches the allowed domains for the button to activate
        if (tabUrl !== undefined && pattern.test(tabUrl)) {
            // Replace %url with tab url
            customUrl = customUrl.replace('%url', tabUrl);
            window.open(customUrl);
        } else if (notification === true) {
            var options = {
                type: "basic",
                title: "Custom Button",
                message: "URL not valid",
                iconUrl: "icons/icon-128.png"
            };
            // No video alert
            chrome.notifications.create("", options, function () {});
        }
    }

    // Get the items from storage (asynchronous)
    chrome.storage.sync.get({
        // Sets some default values before retrieving data
        command: '',
        domain: ".*",
        notification: false
    }, dataRetrieved);
});

//  ^(http|https)://*/*
// Settings changes
chrome.storage.onChanged.addListener(function (changes, namespace) {
    "use strict";
    var key, storageChange;

    for (key in changes) {
        if (changes.hasOwnProperty(key)) {
            storageChange = changes[key];

            console.log('Storage key %s in namespace %s changed. Old value was %s, new value is %s.',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);

        }
    }
});