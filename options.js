// Saves options to chrome.storage
function saveOptions() {
    "use strict";

    var customUrl = document.getElementById('customUrl').value,
        domainRegex = document.getElementById('domain').value,
        notificationValue = document.getElementById('notification').checked,
        notificationTitle = document.getElementById('notificationTitle').value,
        notificationText = document.getElementById('notificationText').value;

    chrome.storage.sync.set({
        'customUrl': customUrl,
        'domain': domainRegex,
        'notification': {
            'show': notificationValue,
            'title': notificationTitle,
            'text': notificationText
        }
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

function restoreOptions() {
    "use strict";
    // Set defaults
    chrome.storage.sync.get({
        customUrl: '',
        domain: ".*", // Use default domain regex to match anything on http/s
        notification: {
            'show': false,
            'title': 'Custom Button',
            'text': 'URL doesn\'t match'
        }
    }, function (items) {
        document.getElementById('customUrl').value = items.customUrl;
        document.getElementById('domain').value = items.domain;
        document.getElementById('notification').checked = items.notification.show;
        document.getElementById('notificationTitle').value = items.notification.title;
        document.getElementById('notificationText').value = items.notification.text;

        if (items.notification.show === true) {
            document.getElementById('notificationOptions').style.display = 'block';
        }
    });
}


function restoreDomain() {
    "use strict";
    document.getElementById('domain').value = ".*";
}

function toggleNotificationOptions() {
    "use strict";
    var options = document.getElementById('notificationOptions');
    // First time we get display is empty
    if (options.style.display === '' || options.style.display === 'none') {
        options.style.display = 'block';
    } else {
        options.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('notification').addEventListener('change', toggleNotificationOptions);
document.getElementById('domainRestore').addEventListener('click', restoreDomain);