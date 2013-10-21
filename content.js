/**
* Instant Thesaurus
* Jeremy Sutton, 2013
* Chrome Extension - Right-click thesaurus
**/

function clearMenu() {
	chrome.extension.sendMessage({
		request: 'clearContextMenu'
	});
}

var current = null;
document.addEventListener('mouseup', function(e) {
	if (e.button == 0) {
		var selection = window.getSelection().toString().trim();
		if ( selection.length > 2 && selection.length < 30 && ((selection.split(" ").length - 1) < 2) ) {
			if (selection == current)
				return;
			current = selection;
			chrome.extension.sendMessage({
				request: 'updateContextMenu',
				selection: selection
			});
		}
		else {
			clearMenu();
			current = null;
		}
	}
}, true);


