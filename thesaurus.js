

// ID to manage the context menu entry
var cmid;
var submenus = [];

function copyTextToClipboard(text) {
  var copyFrom = document.createElement("textarea");
  copyFrom.textContent = text;
  var body = document.getElementsByTagName('body')[0];
  body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand('copy');
  body.removeChild(copyFrom);
}


function find_synonyms(word) {
	var xhr = new XMLHttpRequest();
	var url = 'http://words.bighugelabs.com/api/2/9755426f30f005e29bf88afb5186720c/' + word + '/json';
	var results;
	var synonyms = [];
	
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var suboptions;
			results = JSON.parse(xhr.responseText);
			if (results.adjective != undefined) {
				if (results.adjective.syn != undefined) {
					results.adjective.syn.forEach(function(synonym) {
						synonyms.push(synonym);
					});
				}
				else if (results.adjective.rel != undefined) {
					results.adjective.rel.forEach(function(synonym) {
						synonyms.push(synonym);
					});
				}
			}
			if (results.noun != undefined) {
				if (results.noun.syn != undefined) {
					results.noun.syn.forEach(function(synonym) {
						synonyms.push(synonym);
					});
				}
				else if (results.noun.rel != undefined) {
					results.noun.rel.forEach(function(synonym) {
						synonyms.push(synonym);
					});
				}
			}
			if (results.verb != undefined) {
				if (results.verb.syn != undefined) {
					results.verb.syn.forEach(function(synonym) {
						synonyms.push(synonym);
					});
				}
				else if (results.verb.rel != undefined) {
					results.verb.rel.forEach(function(synonym) {
						synonyms.push(synonym);
					});
				}
			}
			
			var smid; 
			synonyms.forEach(function(syn) {
				suboptions = {
					title: syn,
					parentId: cmid,
					contexts: ['selection'],
					onclick: function(info, tab) {
						copyTextToClipboard(syn);
					}
				};
				smid = chrome.contextMenus.create(suboptions);
			});
		}
	};
	
	xhr.send();
};


var cm_clickHandler = function(clickData, tab) {
    //alert('Selected ' + clickData.selectionText + ' in ' + tab.url);
	var synonyms = find_synonyms(clickData.selectionText);
	//alert(synonyms);

};

chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.request === 'updateContextMenu') {
		if (msg.selection == '') {
			return false;
		}
		
        var type = 'Synonyms for '+msg.selection;
        if (type == '') {
            // Remove the context menu entry
            if (cmid != null) {
                chrome.contextMenus.remove(cmid);
                cmid = null; // Invalidate entry now to avoid race conditions
            } // else: No contextmenu ID, so nothing to remove
        } else { // Add/update context menu entry
            chrome.contextMenus.removeAll();

            var options = {
                title: "Find synonyms for " + msg.selection,
                contexts: ['selection'],
                onclick: cm_clickHandler
            };

            cmid = chrome.contextMenus.create(options, function(pid) {
				var synonyms = find_synonyms(msg.selection);
			});
			
        }
    }
});
