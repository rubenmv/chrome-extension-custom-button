/* GLOBALS */
var customUrlGlobal,
    domainGlobal,
    modeGlobal,
    notificationGlobal = {
        'show': '',
        'title': '',
        'text': '',
        'icon': ''
    };

function initOptions() {
    "use strict";

    function dataRetrieved(items) {
        // Check for error
        if (chrome.runtime.lastError !== undefined) {
            console.log("An error ocurred initializing options: " + chrome.runtime.lastError.string);
            return;
        }
        // Initialize
        customUrlGlobal = items.customUrl;
        domainGlobal = items.domain;
        modeGlobal = items.mode;
        notificationGlobal.show = items.notification.show;
        notificationGlobal.title = items.notification.title;
        notificationGlobal.text = items.notification.text;
        notificationGlobal.icon = items.icon;
    }

    // Get the items from storage (asynchronous)
    chrome.storage.sync.get({
        // Sets some default values before retrieving data
        customUrl: '',
        mode: 0,
        domain: ".*",
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAABVpJREFUWIW1l3FsnHUZxz/Pc9cr27q1mDmKyh/GRBnCcPfCGNP2FegAoeu12iJBthg2spGoCX8Q1BiNQaMBMjASHRUdEJeFDGN7HQyFzV07Shd2dzOwGhkEEhLKUIH1NqC9u+fxj7Z47+ytt4rPX/e77/f9Pp97f+/v93tPiNSPNAgPPwrWA/oEJ875ejbbW2SWSrZ0Xu34IwDEuDm/v3/vbL4wDM864Y27TPwaQXfmMv3fBHxG10pzEB5uBb4BmgC6WDx23WyhAK7+M1WaVWnG+Gk1X8HP7kCkXdE6gQ1B2PnFSj0CUC77W5V0jrxZLRizxopRU1VQt4oMMy3zVlWAwwfSoyL0gD1myPrc/vTBqgA1Vn4oPWj4LWCPuUv38wf6XqrUZb7BK1vWvayqnwEw5+/5wf7z55MTrxx84UvdH4/FSm1gzYb+Q0z25ob+ODZfSIBLWlLnldXbBJY6OpaIlZ8+uG/gWAQgDMN4gcafCBO3Tz2AguIYXkq2dPx6fNHkHS8/9dTEmTQOgvaFLIzd72obFVUAwSmVmQxaU79okHe/n8lkSgrICRp3CHKnGQXc73WXzeb8HPiXqHy78WR9X09PT6zW5mEYxq0hthvlVkzHzP0ujE0495hRQLij4E07AeJB2Hkj+A3AaKKOKw/uS394e1av7r6nmJj4M6rXvnKsuBHorQWgQNO3FK4Af476+q/kn9l1fEa7NLxuq8E+Ee1OtqZuUnfbDODit1TODcDIyONvG7H10/qWWu+AO1vAzFXXZyuaAzyfefJNMd0EIGJb1EWSZhyrtuTyg31/A44qdnEt07Bi7dpFKnwO9MXcX/pemc1zaKh/2Ix/YppUjDqF0hy/aBJUjxxhToCGkwsUwObIZEqPq4odQfnkytbO5bO5LmlJnSdiyx17aXR01+RcAMPD6YJhr4NddNmV686ZNTPsulCVZuAFRXgYQKX8YBC0L6w0XnBBT8Khl6ll9PBczWdK0e2K1hVL+mAYhpG9JgjaF5bdtgG4sD3ewPi2cW+6UUVbbBG5IOy430SOivNp54PvgF5kkF/C+H21AhQT790d+2DBV1UlNU7TwWSY+qXAa+DnO367wmfN/MASPd4rAKtWXbukdFbidyLytVPDHN+TmEjcPDLy+Nsz361e3f2xYn3xBeATAIa9buiKv2b6353xrLi8a1k8bjtEaZuFcVd90TcOD6cLkbMgaEltRtlW0f3O7GD/3RFPa8cGE3lAYXEk0uw4Grstm+nbGfGHHT8Aues/kdyay/Q/NDOOnIYokX3AJXp0JltTNyHyiBoJ3O81oc2ENnfuQ1kAviMIO3oiGf91pEfHcWqsNWs6Fk8IDxhWBLk6P5gerJD3JlvW7Xb4E8ivgqD9iWx293u15Orclql6v05TwNni+tv8UKQ5ALmhgX2iPKrKUhr0+lpzawZQbDmAiM/67geAM63J5z9yAHPKAO6SqGoSpjWfaxc8c4AYHJr+2HUaWxeA4YdO45kfgJ9s3uPwqgjdyTC16VQ9GXbeJtABHF3C+DO15ta8CrLZ3mIQdm4w86dV+c3KMHWD4num6Lge/CrD3hfYkMlkPvopAMhm+g6I2hXAqMJakK0gWxG5ysxfjLmHuczAyJlk1nwHZmq6wYXBl9etcdOLAdQ5nB9KP0fFf4r/G8B0eXb/wLPAs/O8/n8GYFXY9akS9mN3M/H4D+f7+j5vgLKXHhLRa0QUF1sGpOaTE3kI3T3yAili75zm2qUf+oxl1UzCqZnlSGYEIDe4MoP77zEm3P0PFM59smqwyHcNGwPeQPleNd/xBZNphzTGBMb27P6B4Ur93zwtNAQpY/WdAAAAAElFTkSuQmCC',
        notification: {
            'show': false,
            'title': 'Custom Button',
            'text': 'URL doesn\'t match'
        }
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
        var newUrl = customUrlGlobal.replace('%url', tabUrl);

        switch (modeGlobal) {
        case 0: //current tab
            chrome.tabs.update({
                'url': newUrl
            });
            break;
        case 1: //new tab
            chrome.tabs.create({
                'url': newUrl
            });
            break;
        case 2: //new window
            chrome.windows.create({
                'url': newUrl,
                'type': 'normal' //normal
            });
            break;
        case 3: //popup
            chrome.windows.create({
                'url': newUrl,
                'type': 'popup' //popup
            });
            break;
        }

    } else if (notificationGlobal.show === true) {
        var options = {
            type: "basic",
            title: notificationGlobal.title,
            message: notificationGlobal.text,
            iconUrl: notificationGlobal.icon
        };
        // No video alert
        chrome.notifications.create("", options, function () {});
    }
});

//  ^(http|https)://*/*
// Settings changes
chrome.storage.onChanged.addListener(function (changes, namespace) {
    "use strict";
    var key, storageChange, newValue;

    for (key in changes) {
        if (changes.hasOwnProperty(key)) {
            storageChange = changes[key];
            newValue = storageChange.newValue;
            if (key === 'customUrl') {
                customUrlGlobal = newValue;
            } else if (key === 'mode') {
                modeGlobal = newValue;
            } else if (key === 'notification') {
                notificationGlobal.show = newValue.show;
                notificationGlobal.title = newValue.title;
                notificationGlobal.text = newValue.text;
            } else if (key === 'domain') {
                domainGlobal = storageChange.newValue;
            } else if (key === 'icon') {
                notificationGlobal.icon = newValue;
                chrome.browserAction.setIcon({
                    path: newValue
                });
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