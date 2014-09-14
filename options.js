// Saves options to chrome.storage
function saveOptions() {
    "use strict";

    var customUrl = document.getElementById('customUrl').value,
        domainRegex = document.getElementById('domain').value,
        notificationValue = document.getElementById('notification').checked;

    chrome.storage.sync.set({
        'customUrl': customUrl,
        'domain': domainRegex,
        'notification': notificationValue
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
        notification: false
    }, function (items) {
        document.getElementById('customUrl').value = items.customUrl;
        document.getElementById('domain').value = items.domain;
        document.getElementById('notification').checked = items.notification;
    });
}


function restoreDomain() {
    "use strict";
    document.getElementById('domain').value = ".*";
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('domainRestore').addEventListener('click', restoreDomain);