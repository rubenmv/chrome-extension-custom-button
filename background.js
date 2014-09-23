/*global chrome, console, document*/

var ICON_MAX_KEYS = 14;
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
	//sync.get callback, data received
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
		//Get icon parts and join them
		var iconString = '';
		for (var i = 0; i < ICON_MAX_KEYS; i++) {
			iconString += items['icon' + i];
		}
		notificationGlobal.icon = iconString;
		chrome.browserAction.setIcon({
			path: iconString
		});
	}


	// Set defaults
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
	for (var i = 0; i < ICON_MAX_KEYS; i++) {
		//Clear the rest, in case the new icon is smaller
		options['icon' + i] = '';
	}
	options.icon0 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAk6QAAJOkBUCTn+AAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKhSURBVHic7ZqxaxRBFMZ/3yFYJNcFEfughYKKFjaKhUj+AxsVjGKXRlJb2kmwUZM0apO0NmKpSIooRrEwVnYhsZSkSJF7FrnFi9nbzOzu3VvMfPBg2bmd973fDTO7zMjMOMxqeRvwVgLgbcBbCYC3AW8lAN4GvFUJgKQJSTOSPkjalGQDiGVJtySprqL3yMyiAxgDFgEbYjwFVMZvYS0lih8HNoZcfBbP6oYQW3wLWHIqfiAQYgFMOxefxfO6ICjmY0jSKnAyp+kbMA/8Cu6sWFPApQN+Mwfct6pfcxH/fhvYYf+/8ar2iQkWevr/npMzi1kqjoSYZfAc+cvmk3jsUboKrPZpuwfMVlkiYwCcyLtpZh/LJg+Rma1TDOEuMFcWQlPfBLeyC0kjARAmKQmhqQC+9lyfh6CRMAnMx0JoKoCVnuuHWVEBEO4Aj6IyRczMN8iZieteAezvC9f7njwvgXZP+3H6rw6/gdFBrAJDk5l1gNvAZvfWTWBN0jtJC8AMsN7n8TZwLTTXkSpGBykz+ynpCvACOA2MApcDHz8amqeRIyCTmX0GLgAPgNfAWuijoTkaOwIymdk28Lgb+yQpr9jglaDRI2AYSgC8DXgrAfA24K0EwNuAtxIAbwPeSgC8DXgrAfA24K0EwNuAtxIAbwPeSgC8DXgrAfA24K0EwNuAt2IA5G5KSLpYk5doFeQO3UCJArACdHLuT0X0UbfycnfYu7tcqKYekjpIx9g9GXImp+2HmZ0K7ily27opx+SKYjqqphL79t4HJYtiCWgNDEAXgudR2aLYAMaj6yl5gsPjsHRRLAJjZWqJmgT/laQJ4Dq7e/hngZHSncVpC/gCfALemtmbsh1VAvA/KL0JehvwVgLgbcBbCYC3AW8degB/AF61RcU6E47HAAAAAElFTkSuQmCCa108ecd08c36a0062fb1687f7122400d';
	// Get the items from storage (asynchronous)
	chrome.storage.sync.get(options, dataRetrieved);
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
// Settings changes
chrome.storage.onChanged.addListener(function (changes, namespace) {
	"use strict";
	var key, storageChange, newValue, fullIcon = '';
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
			} else if (key.match(/^icon[0-9]{1,2}$/) !== null) { //if is icon key, add
				fullIcon += newValue;
			}
		}
	}
	if (fullIcon !== '') {
		notificationGlobal.icon = fullIcon;
		chrome.browserAction.setIcon({
			path: fullIcon
		});
	}
});