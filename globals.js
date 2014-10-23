var DEFAULT_ICON = 'images/default-64.png',
	DEFAULT_URL = 'https://duckduckgo.com/',
	FILE_TYPES = ['image/jpeg', 'image/png', 'image/x-icon'],
	FILE_SIZE_LIMIT = 102400, //Bytes, 100KB (1KB = 1024B)
	IMAGE_DIM_LIMIT = 128, //px, square
	// Icon is saved in base64, calculate storage limits and leave some bytes for the other items
	// QUOTA_BYTES = max bytes in sync storage
	// QUOTA_BYTES_PER_ITEM = max bytes per item(key:value + quotes)
	// QUOTA_BYTES / QUOTA_BYTES_PER_ITEM = max items to split the icon string
	// icon items = max keys - some keys for the rest
	ITEM_BYTES_LIMIT = chrome.storage.sync.QUOTA_BYTES_PER_ITEM, //for later use
	// We leave at least 3 free slots for the rest of items (3*QUOTA_BYTES_PER_ITEM is more than enough free bytes), no need to worry about items (slots) limit (is like 512)
	ICON_MAX_KEYS = (chrome.storage.sync.QUOTA_BYTES / ITEM_BYTES_LIMIT) - 3;