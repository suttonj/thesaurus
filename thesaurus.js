/**
* Instant Thesaurus
* Jeremy Sutton, 2013
* Chrome Extension - Right-click thesaurus
**/

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
	var params = "key=1HXDg3ab8spFFE0ILgZW&word=" + word + "&language=en_US&output=json";
	var url = "http://thesaurus.altervista.org/thesaurus/v1?" + params;
	var results;
	var synonyms = [], antonyms = [];

	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var suboptions;
			//update loading placeholder
			suboptions = {
				title: "Synonyms for " + word,
				contexts: ['selection']
			};
			chrome.contextMenus.update(cmid, suboptions);
				
			try {
				results = JSON.parse(xhr.responseText);
				results.response.forEach(function(list) {
					list.list.synonyms.split("|").forEach(function(syn) {
						synonyms.push(syn);
					});
				});
			}
			catch (err) {
				suboptions = {
					title: "No synonyms found.",
					contexts: ['selection']
				};
				chrome.contextMenus.update(cmid, suboptions);
				return;
			}
			
			if (synonyms.length == 0 && antonyms.length == 0){
				suboptions = {
					title: "No synonyms found.",
					contexts: ['selection']
				};
				chrome.contextMenus.update(cmid, suboptions);
				return;
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
			
			if (antonyms.length > 0) {
				suboptions = {
					type: "separator",
					title: "antonyms",
					parentId: cmid,
					contexts: ['selection']
				};
				smid = chrome.contextMenus.create(suboptions);
				
				antonyms.forEach(function(ant) {
					suboptions = {
						title: ant,
						parentId: cmid,
						contexts: ['selection'],
						onclick: function(info, tab) {
							copyTextToClipboard(ant);
						}
					};
					smid = chrome.contextMenus.create(suboptions);
					
				});
			}
		}
	};
	
	xhr.send();
};


var cm_clickHandler = function(clickData, tab) {
	var synonyms = find_synonyms(clickData.selectionText);
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
                title: "Finding synonyms for " + msg.selection + "...(re-click)",
                contexts: ['selection'],
                onclick: cm_clickHandler
            };

            cmid = chrome.contextMenus.create(options, function(pid) {
				var synonyms = find_synonyms(msg.selection);
			});
			
        }
    }
	else if (msg.request == 'clearContextMenu') {
		if (cmid != null) {
            chrome.contextMenus.remove(cmid);
			cmid = null;
        }
	}
});
