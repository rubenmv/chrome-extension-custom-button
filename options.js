/*global chrome, FileReader, window, document, console*/

var FILE_SIZE_LIMIT = 50, //KB
    IMAGE_DIM_LIMIT = 128, //px, square
    // Icon is saved in base64, calculate storage limits and leave some bytes for the other items
    // QUOTA_BYTES = max bytes in sync storage
    // QUOTA_BYTES_PER_ITEM = max bytes per item(key:value + quotes)
    // QUOTA_BYTES / QUOTA_BYTES_PER_ITEM = max items to split the icon string
    // icon items = max keys - some keys for the rest
    ITEM_BYTES_LIMIT = chrome.storage.sync.QUOTA_BYTES_PER_ITEM, //for later use
    // We leave at least 3 free slots for the rest of items (3*QUOTA_BYTES_PER_ITEM is more than enough free bytes), no need to worry about items (slots) limit (is like 512)
    ICON_MAX_KEYS = (chrome.storage.sync.QUOTA_BYTES / ITEM_BYTES_LIMIT) - 3,
    defaultIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAk6QAAJOkBUCTn+AAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKhSURBVHic7ZqxaxRBFMZ/3yFYJNcFEfughYKKFjaKhUj+AxsVjGKXRlJb2kmwUZM0apO0NmKpSIooRrEwVnYhsZSkSJF7FrnFi9nbzOzu3VvMfPBg2bmd973fDTO7zMjMOMxqeRvwVgLgbcBbCYC3AW8lAN4GvFUJgKQJSTOSPkjalGQDiGVJtySprqL3yMyiAxgDFgEbYjwFVMZvYS0lih8HNoZcfBbP6oYQW3wLWHIqfiAQYgFMOxefxfO6ICjmY0jSKnAyp+kbMA/8Cu6sWFPApQN+Mwfct6pfcxH/fhvYYf+/8ar2iQkWevr/npMzi1kqjoSYZfAc+cvmk3jsUboKrPZpuwfMVlkiYwCcyLtpZh/LJg+Rma1TDOEuMFcWQlPfBLeyC0kjARAmKQmhqQC+9lyfh6CRMAnMx0JoKoCVnuuHWVEBEO4Aj6IyRczMN8iZieteAezvC9f7njwvgXZP+3H6rw6/gdFBrAJDk5l1gNvAZvfWTWBN0jtJC8AMsN7n8TZwLTTXkSpGBykz+ynpCvACOA2MApcDHz8amqeRIyCTmX0GLgAPgNfAWuijoTkaOwIymdk28Lgb+yQpr9jglaDRI2AYSgC8DXgrAfA24K0EwNuAtxIAbwPeSgC8DXgrAfA24K0EwNuAtxIAbwPeSgC8DXgrAfA24K0EwNuAt2IA5G5KSLpYk5doFeQO3UCJArACdHLuT0X0UbfycnfYu7tcqKYekjpIx9g9GXImp+2HmZ0K7ily27opx+SKYjqqphL79t4HJYtiCWgNDEAXgudR2aLYAMaj6yl5gsPjsHRRLAJjZWqJmgT/laQJ4Dq7e/hngZHSncVpC/gCfALemtmbsh1VAvA/KL0JehvwVgLgbcBbCYC3AW8degB/AF61RcU6E47HAAAAAElFTkSuQmCCa108ecd08c36a0062fb1687f7122400d';
//Read icon file
//Limits: 100KB and/or 128x128px
var handleFileSelect = function (evt) {
    "use strict";
    var files = evt.target.files,
        file = files[0];
    if (files && file) {
        var reader = new FileReader();
        reader.onload = function (readerEvt) {
            var binaryString = readerEvt.target.result;
            var base64String = 'data:image/png;base64,' + window.btoa(binaryString);
            document.getElementById('iconImage').setAttribute('src', base64String);
        };
        reader.readAsBinaryString(file);
    }
};
//Options validation
function validateOptions() {
    var customUrl = document.getElementById('customUrl').value,
        domainRegex = document.getElementById('domain').value,
        notificationValue = document.getElementById('notification').checked,
        notificationTitle = document.getElementById('notificationTitle').value,
        notificationText = document.getElementById('notificationText').value,
        passedValidation = true;
    //More than enough
    if (customUrl.length > ITEM_BYTES_LIMIT / 2) {
        passedValidation = false;
    }
    if (notificationValue === true && (notificationText.length > 256 || notificationTitle.length > 256)) {
        passedValidation = false;
    }
    if (domainRegex.length > ITEM_BYTES_LIMIT / 2) {
        passedValidation = false;
    }
    return passedValidation;
}
document.getElementById('iconFilePicker').addEventListener('change', handleFileSelect, false);
var iconChange = false;
// Saves options to chrome.storage
function saveOptions() {
    "use strict";
    var i = 0;
    // Get values from inputs
    var customUrl = document.getElementById('customUrl').value,
        mode = -1,
        domainRegex = document.getElementById('domain').value,
        iconSource = document.getElementById('iconImage').src, //BASE64 or url
        notificationValue = document.getElementById('notification').checked,
        notificationTitle = document.getElementById('notificationTitle').value,
        notificationText = document.getElementById('notificationText').value,
        modes = document.getElementsByName('mode');
    //window mode
    for (i = 0; i < modes.length; i++) {
        if (modes[i].checked) {
            mode = i;
            break;
        }
    }
    // Validate new data
    if (validateOptions() !== true) {
        return;
    }
    // Set the options object
    var options = {};
    //Generate the keys for the icon
    options.customUrl = customUrl;
    options.mode = mode;
    options.domain = domainRegex;
    options.notification = {
        'show': notificationValue,
        'title': notificationTitle,
        'text': notificationText
    };
    //Icon keys cleanup
    for (i = 0; i < ICON_MAX_KEYS; i++) {
        options['icon' + i] = '';
    }
    console.log(ICON_MAX_KEYS);
    //Split icon base64 string, maximum QUOTA_BYTES_PER_ITEM = 4096 bytes
    //maxLength = QUOTA_BYTES_PER_ITEM - 4 (key 'icon') - 4 quotes (on key and value)
    var maxLength = ITEM_BYTES_LIMIT - 'iconxx'.length - 4,
        //g = global match: finds all matches rather than stopping on the first one
        regex = new RegExp('.{1,' + maxLength + '}', 'g'),
        splitted = iconSource.match(regex),
        iconKeys = [];
    console.log(splitted);
    for (i = 0; i < ICON_MAX_KEYS && i < splitted.length; i++) {
        if (splitted[i] !== undefined) {
            options['icon' + i] = splitted[i];
        }
    }
    chrome.storage.sync.set(options, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved';
        // Check for error
        if (chrome.runtime.lastError !== undefined) {
            console.error("An error ocurred saving options: " + chrome.runtime.lastError.string);
            console.error(chrome.runtime.lastError);
            status.textContent = 'An error ocurred saving options';
        }
        window.setTimeout(function () {
            status.textContent = '';
        }, 1800);
    });
}
//Restore user options on page load
function restoreOptions() {
    "use strict";
    /*  *************
	Set defaults for localStorage get error
		 ************* */
    var options = {};
    //Generate the keys for the icon
    options.customUrl = '';
    options.mode = 0;
    options.domain = ".*";
    options.notification = {
        'show': false,
        'title': 'Curtom Button',
        'text': 'URL doesn\'t match'
    };
    //icon cleanup
    for (var i = 0; i < ICON_MAX_KEYS; i++) {
        options['icon' + i] = '';
    }
    options.icon0 = defaultIcon;
    /*  *************
	Get the items from localStorage
		 ************* */
    chrome.storage.sync.get(options, function (items) {
        // Check for error
        if (chrome.runtime.lastError !== undefined) {
            console.error("An error ocurred restoring options: " + chrome.runtime.lastError);
            return;
        }
        document.getElementById('customUrl').value = items.customUrl;
        document.getElementById('domain').value = items.domain;
        document.getElementsByName('mode')[items.mode].checked = true;
        var iconString = '';
        //Get icon parts and join them
        for (var i = 0; i < ICON_MAX_KEYS; i++) {
            iconString += items['icon' + i];
        }
        document.getElementById('iconImage').src = iconString;
        document.getElementById('notification').checked = items.notification.show;
        document.getElementById('notificationTitle').value = items.notification.title;
        document.getElementById('notificationText').value = items.notification.text;
        if (items.notification.show === true) {
            document.getElementById('notificationOptions').style.display = 'block';
        }
    });
}
//Reset to default domain, match anything
function resetDomain() {
    "use strict";
    document.getElementById('domain').value = ".*";
}
//Reset to default icon
function resetIcon() {
    "use strict";
    document.getElementById('iconImage').src = defaultIcon;
}
//Reset notification options values
function resetNotification() {
    "use strict";
    document.getElementById('notificationTitle').value = 'Custom Button';
    document.getElementById('notificationText').value = 'URL doesn\'t match';
}
//Show/hide notification options
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
//Listener ftw
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('notification').addEventListener('change', toggleNotificationOptions);
document.getElementById('domainRestore').addEventListener('click', resetDomain);
document.getElementById('notificationRestore').addEventListener('click', resetNotification);
document.getElementById('iconRestore').addEventListener('click', resetIcon);
if (window.File && window.FileReader && window.FileList && window.Blob) {
    document.getElementById('iconFilePicker').addEventListener('change', handleFileSelect, false);
} else {
    console.log('The File APIs are not fully supported in this browser.');
}