<h1>Custom Button</h1>
=============

<b>Custom Button</b> is a simple Chrome extension where you can customize a button, set an URL, change the icon and some other stuff.

Just go to options and set the url and the window mode on activation.
You can also set a regular expresion to match a certain domain and activate notifications when the match fails.

Options
=======
<h2>URL</h2>
Set the url you want to launch. For example:
https://www.youtube.com/feed/subscriptions
Add %url anywhere in the string and it will be replaced by the active tab url. For example:
http://en.savefrom.net/%url
Choose the opening method. For example, you could set the url to chrome://extensions and then set it to open on a popup window. This way your button will open the extensions page on a separate popup window, pretty cool!