document.addEventListener('DOMContentLoaded', function() {
	var bgPage = chrome.extension.getBackgroundPage(),
		query = {
			active: true,
			lastFocusedWindow: true
		};
	// active: true returns current active tab in an array of length 1
	chrome.tabs.query(query, function(tabs) {
		var tabUrl = tabs[0].url;
		if (tabUrl !== undefined && bgPage.checkDomain(tabUrl)) {
			var newUrl = bgPage.readyUrl(tabUrl); // 0 is active tab
			document.getElementById('frameContent').src = newUrl;
		} else {
			bgPage.showNotification();
			window.close();
		}
	});
});