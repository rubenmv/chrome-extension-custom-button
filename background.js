/*global chrome, console, document*/

var DEFAULT_URL = "https://duckduckgo.com/",
	ITEM_BYTES_LIMIT = chrome.storage.sync.QUOTA_BYTES_PER_ITEM,
	ICON_MAX_KEYS = chrome.storage.sync.QUOTA_BYTES / ITEM_BYTES_LIMIT - 3,
	DEBUG_MODE = false;


function log(message) {
	if (message && DEBUG_MODE === true) {
		console.log(message);
	}
}

// Modes "enum"
var ModeEnum = {
	TAB_CURRENT: 0,
	TAB_NEW: 1,
	WINDOW: 2,
	POPUP_WINDOW: 3,
	POPUP_BUTTON: 4
};
// background.js globals
var initialized,
	domainRegExp,
	onlyHostnameGlobal,
	customUrlGlobal,
	domainGlobal,
	modeGlobal,
	notificationGlobal = {
		'id': 'supermegacoolid',
		'show': '',
		'title': '',
		'text': '',
		'icon': ''
	};

	
// workaround to avoid worker from being inactive on browser start
chrome.runtime.onStartup.addListener( () => {
	console.log(`onStartup()`);
});

/**
 * Initialize variables from storage settings
 */
function initOptions() {
	'use strict';
	
	log("initOptions");
	
	var cadena = '';
	//sync.get callback, data received
	function dataRetrieved(items) {
		// Check for error
		if (chrome.runtime.lastError !== undefined) {
			log("An error ocurred initializing options: " + chrome.runtime.lastError.string);
			return;
		}
		// Initialize
		customUrlGlobal = items.customUrl;
		domainGlobal = items.domain;
		domainRegExp = new RegExp(domainGlobal);
		onlyHostnameGlobal = items.onlyHostname;
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
		chrome.action.setIcon({
			path: iconString
		});
		if (modeGlobal === ModeEnum.POPUP_BUTTON) {
			chrome.action.setPopup({
				popup: 'popup.html'
			});
		} else {
			chrome.action.setPopup({
				popup: ''
			});
		}
		initialized = true;
		log("initOptions finished");
	}
	// Set defaults
	var options = {};
	//Generate the keys for the icon
	options.customUrl = DEFAULT_URL;
	options.mode = ModeEnum.TAB_CURRENT;
	options.domain = ".*";
	options.onlyHostname = false;
	options.notification = {
		'show': false,
		'title': 'Custom Button',
		'text': 'URL doesn\'t match'
	};
	for (var i = 0; i < ICON_MAX_KEYS; i++) {
		//Clear the rest, in case the new icon is smaller
		options['icon' + i] = '';
	}
	options.icon0 = 'images/default-64.png';
	// Get the items from storage (asynchronous)
	chrome.storage.sync.get(options, dataRetrieved);
}
// 
/**
 * Replaces %url with the current tabUrl
 * @param  {string} url
 * @return {string}		[URL replaced with active tab URL]
 */
function prepareUrl(url) {
	var finalUrl = "";
	if (onlyHostnameGlobal === true) {
		var newUrl = new URL(url);
		url = newUrl.protocol + "//" + newUrl.hostname;
	}
	finalUrl = customUrlGlobal.replace('%url', url);
	return finalUrl;
}
/**
 * Check if domain is valid
 * @param  {string} url
 * @return {boolean}
 */
function checkDomain(url) {
	log("checkDomain: " + url);
	if(!url) return false;
	return domainRegExp.test(url);
}
/**
 * Show notification if active
 */
function showNotification() {
	if (notificationGlobal.show === true) {
		var options = {
			type: "basic",
			title: notificationGlobal.title,
			message: notificationGlobal.text,
			iconUrl: notificationGlobal.icon
		};
		// No video alert
		chrome.notifications.clear(notificationGlobal.id, function () {
			chrome.notifications.create(notificationGlobal.id, options, function () { });
		});
	}
}
/**
 * On button clicked, check, replace and go to url
 * @param  {int} tabId ID from the active tab
 */
chrome.action.onClicked.addListener(tabId => {
	'use strict';
	
	if(!initialized){
		initOptions();
	}
	
	var tabUrl = tabId.url;
	log("tabId: " + tabId + ", tabId.url: " + tabUrl);
	if(!tabUrl) return;
	// Check if the active tab url matches the allowed domains for the button to activate
	if (tabUrl && checkDomain(tabUrl)) {
		// Replace %url with tab url
		var newUrl = prepareUrl(tabUrl);
		switch (modeGlobal) {
			case ModeEnum.TAB_CURRENT: //current tab
				chrome.tabs.update({
					url: newUrl
				});
				break;
			case ModeEnum.TAB_NEW: //new tab
				chrome.tabs.create({
					url: newUrl
				});
				break;
			case ModeEnum.WINDOW: //new window
				chrome.windows.create({
					url: newUrl,
					type: 'normal' //normal
				});
				break;
			case ModeEnum.POPUP_WINDOW: //popup as new window
				chrome.windows.create({
					'url': newUrl,
					'type': 'popup' //popup
				});
				break;
			// case ModeEnum.POPUP_BUTTON: // Nothing to do here
		}
	} else {
		showNotification();
	}
});
/**
 * On settings/storage change, update variables
 * @param  {Object} changes   Contains properties changed
 * @param  {string} namespace No use
 */
chrome.storage.onChanged.addListener(function (changes, namespace) {
	'use strict';
	var key, storageChange, newValue, fullIcon = '';
	for (key in changes) {
		if (changes.hasOwnProperty(key)) {
			storageChange = changes[key];
			newValue = storageChange.newValue;
			if (key === 'customUrl') {
				customUrlGlobal = newValue;
			} else if (key === 'mode') {
				if (newValue !== ModeEnum.POPUP_BUTTON) {
					chrome.action.setPopup({
						popup: ''
					}); // Disable popup
				} else {
					chrome.action.setPopup({
						popup: 'popup.html'
					});
				}
				modeGlobal = newValue;
			} else if (key === 'notification') {
				notificationGlobal.show = newValue.show;
				notificationGlobal.title = newValue.title;
				notificationGlobal.text = newValue.text;
			} else if (key === 'domain') {
				domainGlobal = storageChange.newValue;
				domainRegExp = new RegExp(domainGlobal);
			} else if (key === 'onlyHostname') {
				onlyHostnameGlobal = storageChange.newValue;
			} else if (key.match(/^icon[0-9]{1,2}$/) !== null) { //if is icon key, add
				fullIcon += newValue;
			}
		}
	}
	if (fullIcon !== '') {
		notificationGlobal.icon = fullIcon;
		chrome.action.setIcon({
			path: fullIcon
		});
	}
});

initOptions();


// Offscreen keepalive
async function createOffscreen() {
await chrome.offscreen.createDocument({
	url: 'offscreen.html',
	reasons: ['BLOBS'],
	justification: 'keep service worker running',
}).catch(() => {});
}
chrome.runtime.onStartup.addListener(createOffscreen);
self.onmessage = e => {}; // keepAlive
createOffscreen();
