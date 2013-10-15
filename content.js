debugger;

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

chrome.extension.onMessage.addListener(function(message,sender,sendResponse){
  if(message.action == "replaceWithSynonym")
	
    alert(message.synonym);
});


