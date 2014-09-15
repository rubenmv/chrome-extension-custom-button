var handleFileSelect = function (evt) {
    "use strict";
    var files = evt.target.files,
        file = files[0];

    if (files && file) {
        var reader = new FileReader();

        reader.onload = function (readerEvt) {
            var binaryString = readerEvt.target.result;
            document.getElementById('iconImage')
                .setAttribute('src', 'data:image/png;base64,' + window.btoa(binaryString));
        };
        reader.readAsBinaryString(file);
    }
};

if (window.File && window.FileReader && window.FileList && window.Blob) {
    document.getElementById('iconFilePicker').addEventListener('change', handleFileSelect, false);
} else {
    console.log('The File APIs are not fully supported in this browser.');
}

// Saves options to chrome.storage
function saveOptions() {
    "use strict";

    var customUrl = document.getElementById('customUrl').value,
        domainRegex = document.getElementById('domain').value,
        iconB64 = document.getElementById('iconImage').src, //BASE64
        notificationValue = document.getElementById('notification').checked,
        notificationTitle = document.getElementById('notificationTitle').value,
        notificationText = document.getElementById('notificationText').value;

    console.log(iconB64);
    chrome.storage.sync.set({
        'customUrl': customUrl,
        'domain': domainRegex,
        'icon': iconB64,
        'notification': {
            'show': notificationValue,
            'title': notificationTitle,
            'text': notificationText
        }
    }, function () {
        // Check for error
        if (chrome.runtime.lastError !== undefined) {
            console.error("An error ocurred saving options: " + chrome.runtime.lastError.string);
            return;
        }
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
        domain: ".*", // Use default domain regex to match anything
        //Base64(icons/default-32.png)
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAABVpJREFUWIW1l3FsnHUZxz/Pc9cr27q1mDmKyh/GRBnCcPfCGNP2FegAoeu12iJBthg2spGoCX8Q1BiNQaMBMjASHRUdEJeFDGN7HQyFzV07Shd2dzOwGhkEEhLKUIH1NqC9u+fxj7Z47+ytt4rPX/e77/f9Pp97f+/v93tPiNSPNAgPPwrWA/oEJ875ejbbW2SWSrZ0Xu34IwDEuDm/v3/vbL4wDM864Y27TPwaQXfmMv3fBHxG10pzEB5uBb4BmgC6WDx23WyhAK7+M1WaVWnG+Gk1X8HP7kCkXdE6gQ1B2PnFSj0CUC77W5V0jrxZLRizxopRU1VQt4oMMy3zVlWAwwfSoyL0gD1myPrc/vTBqgA1Vn4oPWj4LWCPuUv38wf6XqrUZb7BK1vWvayqnwEw5+/5wf7z55MTrxx84UvdH4/FSm1gzYb+Q0z25ob+ODZfSIBLWlLnldXbBJY6OpaIlZ8+uG/gWAQgDMN4gcafCBO3Tz2AguIYXkq2dPx6fNHkHS8/9dTEmTQOgvaFLIzd72obFVUAwSmVmQxaU79okHe/n8lkSgrICRp3CHKnGQXc73WXzeb8HPiXqHy78WR9X09PT6zW5mEYxq0hthvlVkzHzP0ujE0495hRQLij4E07AeJB2Hkj+A3AaKKOKw/uS394e1av7r6nmJj4M6rXvnKsuBHorQWgQNO3FK4Af476+q/kn9l1fEa7NLxuq8E+Ee1OtqZuUnfbDODit1TODcDIyONvG7H10/qWWu+AO1vAzFXXZyuaAzyfefJNMd0EIGJb1EWSZhyrtuTyg31/A44qdnEt07Bi7dpFKnwO9MXcX/pemc1zaKh/2Ix/YppUjDqF0hy/aBJUjxxhToCGkwsUwObIZEqPq4odQfnkytbO5bO5LmlJnSdiyx17aXR01+RcAMPD6YJhr4NddNmV686ZNTPsulCVZuAFRXgYQKX8YBC0L6w0XnBBT8Khl6ll9PBczWdK0e2K1hVL+mAYhpG9JgjaF5bdtgG4sD3ewPi2cW+6UUVbbBG5IOy430SOivNp54PvgF5kkF/C+H21AhQT790d+2DBV1UlNU7TwWSY+qXAa+DnO367wmfN/MASPd4rAKtWXbukdFbidyLytVPDHN+TmEjcPDLy+Nsz361e3f2xYn3xBeATAIa9buiKv2b6353xrLi8a1k8bjtEaZuFcVd90TcOD6cLkbMgaEltRtlW0f3O7GD/3RFPa8cGE3lAYXEk0uw4Grstm+nbGfGHHT8Aues/kdyay/Q/NDOOnIYokX3AJXp0JltTNyHyiBoJ3O81oc2ENnfuQ1kAviMIO3oiGf91pEfHcWqsNWs6Fk8IDxhWBLk6P5gerJD3JlvW7Xb4E8ivgqD9iWx293u15Orclql6v05TwNni+tv8UKQ5ALmhgX2iPKrKUhr0+lpzawZQbDmAiM/67geAM63J5z9yAHPKAO6SqGoSpjWfaxc8c4AYHJr+2HUaWxeA4YdO45kfgJ9s3uPwqgjdyTC16VQ9GXbeJtABHF3C+DO15ta8CrLZ3mIQdm4w86dV+c3KMHWD4num6Lge/CrD3hfYkMlkPvopAMhm+g6I2hXAqMJakK0gWxG5ysxfjLmHuczAyJlk1nwHZmq6wYXBl9etcdOLAdQ5nB9KP0fFf4r/G8B0eXb/wLPAs/O8/n8GYFXY9akS9mN3M/H4D+f7+j5vgLKXHhLRa0QUF1sGpOaTE3kI3T3yAili75zm2qUf+oxl1UzCqZnlSGYEIDe4MoP77zEm3P0PFM59smqwyHcNGwPeQPleNd/xBZNphzTGBMb27P6B4Ur93zwtNAQpY/WdAAAAAElFTkSuQmCC',
        notification: {
            'show': false,
            'title': 'Custom Button',
            'text': 'URL doesn\'t match'
        }
    }, function (items) {
        // Check for error
        if (chrome.runtime.lastError !== undefined) {
            console.error("An error ocurred restoring options: " + chrome.runtime.lastError);
            return;
        }

        document.getElementById('customUrl').value = items.customUrl;
        document.getElementById('domain').value = items.domain;
        document.getElementById('iconImage').src = items.icon;
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

function restoreIcon() {
    "use strict";
    document.getElementById('iconImage').src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAABVpJREFUWIW1l3FsnHUZxz/Pc9cr27q1mDmKyh/GRBnCcPfCGNP2FegAoeu12iJBthg2spGoCX8Q1BiNQaMBMjASHRUdEJeFDGN7HQyFzV07Shd2dzOwGhkEEhLKUIH1NqC9u+fxj7Z47+ytt4rPX/e77/f9Pp97f+/v93tPiNSPNAgPPwrWA/oEJ875ejbbW2SWSrZ0Xu34IwDEuDm/v3/vbL4wDM864Y27TPwaQXfmMv3fBHxG10pzEB5uBb4BmgC6WDx23WyhAK7+M1WaVWnG+Gk1X8HP7kCkXdE6gQ1B2PnFSj0CUC77W5V0jrxZLRizxopRU1VQt4oMMy3zVlWAwwfSoyL0gD1myPrc/vTBqgA1Vn4oPWj4LWCPuUv38wf6XqrUZb7BK1vWvayqnwEw5+/5wf7z55MTrxx84UvdH4/FSm1gzYb+Q0z25ob+ODZfSIBLWlLnldXbBJY6OpaIlZ8+uG/gWAQgDMN4gcafCBO3Tz2AguIYXkq2dPx6fNHkHS8/9dTEmTQOgvaFLIzd72obFVUAwSmVmQxaU79okHe/n8lkSgrICRp3CHKnGQXc73WXzeb8HPiXqHy78WR9X09PT6zW5mEYxq0hthvlVkzHzP0ujE0495hRQLij4E07AeJB2Hkj+A3AaKKOKw/uS394e1av7r6nmJj4M6rXvnKsuBHorQWgQNO3FK4Af476+q/kn9l1fEa7NLxuq8E+Ee1OtqZuUnfbDODit1TODcDIyONvG7H10/qWWu+AO1vAzFXXZyuaAzyfefJNMd0EIGJb1EWSZhyrtuTyg31/A44qdnEt07Bi7dpFKnwO9MXcX/pemc1zaKh/2Ix/YppUjDqF0hy/aBJUjxxhToCGkwsUwObIZEqPq4odQfnkytbO5bO5LmlJnSdiyx17aXR01+RcAMPD6YJhr4NddNmV686ZNTPsulCVZuAFRXgYQKX8YBC0L6w0XnBBT8Khl6ll9PBczWdK0e2K1hVL+mAYhpG9JgjaF5bdtgG4sD3ewPi2cW+6UUVbbBG5IOy430SOivNp54PvgF5kkF/C+H21AhQT790d+2DBV1UlNU7TwWSY+qXAa+DnO367wmfN/MASPd4rAKtWXbukdFbidyLytVPDHN+TmEjcPDLy+Nsz361e3f2xYn3xBeATAIa9buiKv2b6353xrLi8a1k8bjtEaZuFcVd90TcOD6cLkbMgaEltRtlW0f3O7GD/3RFPa8cGE3lAYXEk0uw4Grstm+nbGfGHHT8Aues/kdyay/Q/NDOOnIYokX3AJXp0JltTNyHyiBoJ3O81oc2ENnfuQ1kAviMIO3oiGf91pEfHcWqsNWs6Fk8IDxhWBLk6P5gerJD3JlvW7Xb4E8ivgqD9iWx293u15Orclql6v05TwNni+tv8UKQ5ALmhgX2iPKrKUhr0+lpzawZQbDmAiM/67geAM63J5z9yAHPKAO6SqGoSpjWfaxc8c4AYHJr+2HUaWxeA4YdO45kfgJ9s3uPwqgjdyTC16VQ9GXbeJtABHF3C+DO15ta8CrLZ3mIQdm4w86dV+c3KMHWD4num6Lge/CrD3hfYkMlkPvopAMhm+g6I2hXAqMJakK0gWxG5ysxfjLmHuczAyJlk1nwHZmq6wYXBl9etcdOLAdQ5nB9KP0fFf4r/G8B0eXb/wLPAs/O8/n8GYFXY9akS9mN3M/H4D+f7+j5vgLKXHhLRa0QUF1sGpOaTE3kI3T3yAili75zm2qUf+oxl1UzCqZnlSGYEIDe4MoP77zEm3P0PFM59smqwyHcNGwPeQPleNd/xBZNphzTGBMb27P6B4Ur93zwtNAQpY/WdAAAAAElFTkSuQmCC';
}

function restoreNotification() {
    "use strict";
    document.getElementById('notificationTitle').value = 'Custom Button';
    document.getElementById('notificationText').value = 'URL doesn\'t match';
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
document.getElementById('notificationRestore').addEventListener('click', restoreNotification);
document.getElementById('iconRestore').addEventListener('click', restoreIcon);