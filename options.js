/*global chrome, FileReader, window, document, console*/

var DEFAULT_ICON = "images/default-64.png",
	FILE_TYPES = ["image/jpeg", "image/png", "image/x-icon"],
	FILE_SIZE_LIMIT = 102400,
	ITEM_BYTES_LIMIT = chrome.storage.sync.QUOTA_BYTES_PER_ITEM,
	ICON_MAX_KEYS = chrome.storage.sync.QUOTA_BYTES / ITEM_BYTES_LIMIT - 3;

/**
 * Displays error on file field
 * @param {string} errorString
 */
function setFileError(errorString) {
	// Update status to let user know options were saved.
	var status = document.getElementById('statusIcon');
	status.textContent = errorString;
	window.setTimeout(function() {
		status.textContent = '';
	}, 5000);
}
/**
 * Read icon file and convert to base64.
 * Limits: 100KB and/or 128x128px
 * @param  {Object} evt Event containing the file
 */
function handleFileSelect(evt) {
	'use strict';
	var files = evt.target.files,
		file = files[0];
	if (files && file) {
		var preview = document.getElementById('iconImage');
		preview.setAttribute('src', DEFAULT_ICON);
		if (file.size > FILE_SIZE_LIMIT) {
			setFileError('File size limit exceeded (max 100KB)');
			evt.srcElement.value = '';
			return;
		} else if (FILE_TYPES.indexOf(file.type) === -1) {
			setFileError('Invalid file type (JPEG or PNG)');
			evt.srcElement.value = '';
			return;
		}
		var reader = new FileReader();
		reader.onload = function(readerEvt) {
			var binaryString = readerEvt.target.result;
			var base64String = 'data:image/png;base64,' + window.btoa(binaryString);
			preview.setAttribute('src', base64String);
		};
		reader.readAsBinaryString(file);
	}
}
/**
 * Validate options
 * @return {boolean} Returns true if success, false if fails
 */
function validateOptions() {
	var customUrl = document.getElementById('customUrl').value,
		domainRegex = document.getElementById('domain').value,
		notificationValue = document.getElementById('notification').checked,
		notificationTitle = document.getElementById('notificationTitle').value,
		notificationText = document.getElementById('notificationText').value,
		passedValidation = true;
	//More than enough
	if (customUrl.length > 1024) {
		passedValidation = false;
	}
	if (domainRegex.length > 1024) {
		passedValidation = false;
	}
	if (notificationValue === true && (notificationText.length > 256 || notificationTitle.length > 256)) {
		passedValidation = false;
	}
	return passedValidation;
}
// Saves options to chrome.storage.sync
/**
 * Saves options to chrome.storage.sync
 */
function saveOptions() {
	'use strict';
	var i = 0;
	// Get values from inputs
	var customUrl = document.getElementById('customUrl').value,
		mode = -1,
		domainRegex = document.getElementById('domain').value,
		onlyHostname = document.getElementById('onlyHostname').checked,
		iconSource = document.getElementById('iconImage').src,
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
	options.onlyHostname = onlyHostname;
	options.notification = {
		'show': notificationValue,
		'title': notificationTitle,
		'text': notificationText
	};
	//Icon keys cleanup
	for (i = 0; i < ICON_MAX_KEYS; i++) {
		options['icon' + i] = '';
	}
	//Split icon base64 string, maximum QUOTA_BYTES_PER_ITEM = 4096 bytes
	//maxLength = QUOTA_BYTES_PER_ITEM - 4 (key 'icon') - 4 quotes (on key and value)
	var maxLength = ITEM_BYTES_LIMIT - 'iconxx'.length - 4,
		//g = global match: finds all matches rather than stopping on the first one
		regex = new RegExp('.{1,' + maxLength + '}', 'g'),
		splitted = iconSource.match(regex),
		iconKeys = [];
	for (i = 0; i < ICON_MAX_KEYS && i < splitted.length; i++) {
		if (splitted[i] !== undefined) {
			options['icon' + i] = splitted[i];
		}
	}
	chrome.storage.sync.set(options, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Options saved';
		// Check for error
		if (chrome.runtime.lastError !== undefined) {
			console.error("An error ocurred saving options: " + chrome.runtime.lastError.string);
			console.error(chrome.runtime.lastError);
			status.textContent = 'An error ocurred saving options';
		}
		window.setTimeout(function() {
			status.textContent = '';
		}, 1800);
	});
}
/**
 * Restore user options on page load
 */
function restoreOptions() {
	'use strict';
	// Set defaults for localStorage get error
	var options = {};
	//Generate the keys for the icon
	options.customUrl = 'https://duckduckgo.com/';
	options.mode = 0;
	options.domain = ".*";
	options.onlyHostname = false;
	options.notification = {
		'show': false,
		'title': 'Curtom Button',
		'text': 'URL doesn\'t match'
	};
	// Icon cleanup
	for (var i = 0; i < ICON_MAX_KEYS; i++) {
		options['icon' + i] = '';
	}
	options.icon0 = DEFAULT_ICON;
	// Get the items from localStorage
	chrome.storage.sync.get(options, function(items) {
		// Check for error
		if (chrome.runtime.lastError !== undefined) {
			console.error("An error ocurred restoring options: " + chrome.runtime.lastError);
			return;
		}
		document.getElementById('customUrl').value = items.customUrl;
		document.getElementById('domain').value = items.domain;
		document.getElementById('onlyHostname').checked = items.onlyHostname;
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
/**
 * Reset to default domain, match anything
 */
function resetDomain() {
	'use strict';
	document.getElementById('domain').value = ".*";
}
/**
 * Reset to default icon
 */
function resetIcon() {
	'use strict';
	document.getElementById('iconImage').src = DEFAULT_ICON;
}
/**
 * Reset notification options values
 */
function resetNotification() {
	'use strict';
	document.getElementById('notificationTitle').value = 'Custom Button';
	document.getElementById('notificationText').value = 'URL doesn\'t match';
}
/**
 * Show/hide notification options
 */
function toggleNotificationOptions() {
	'use strict';
	var options = document.getElementById('notificationOptions');
	// First time we get display is empty
	if (options.style.display === '' || options.style.display === 'none') {
		options.style.display = 'block';
	} else {
		options.style.display = 'none';
	}
}
/**
 * Listeners
 */
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('iconFilePicker').addEventListener('change', handleFileSelect, false);
document.getElementById('notification').addEventListener('change', toggleNotificationOptions);
document.getElementById('domainRestore').addEventListener('click', resetDomain);
document.getElementById('notificationRestore').addEventListener('click', resetNotification);
document.getElementById('iconRestore').addEventListener('click', resetIcon);
if (window.File && window.FileReader && window.FileList && window.Blob) {
	document.getElementById('iconFilePicker').addEventListener('change', handleFileSelect, false);
} else {
	console.log('The File APIs are not fully supported in this browser.');
}