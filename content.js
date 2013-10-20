/**
* Instant Thesaurus
* Jeremy Sutton, 2013
* Chrome Extension - Right-click thesaurus
**/

var current = null;
document.addEventListener('mouseup', function(e) {
	if (e.button == 0) {
		var selection = window.getSelection().toString().trim();
		if (selection.length > 2) {
			if (selection == current)
				return;
			current = selection;	
			chrome.extension.sendMessage({
				request: 'updateContextMenu',
				selection: selection
			});
		}
	}
}, true);


