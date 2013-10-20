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
	var url = 'http://words.bighugelabs.com/api/2/9755426f30f005e29bf88afb5186720c/' + word + '/json';
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
				if (results.adjective != undefined) {
					if (results.adjective.syn != undefined) {
						results.adjective.syn.forEach(function(synonym) {
							synonyms.push(synonym);
						});
					}
					else if (results.adjective.usr != undefined) {
						results.adjective.usr.forEach(function(synonym) {
							synonyms.push(synonym);
						});
					}
					
					if (results.adjective.ant != undefined) {
						results.adjective.ant.forEach(function(antonym) {
							antonyms.push(antonym);
						});
					}
				}
				if (results.noun != undefined) {
					if (results.noun.syn != undefined) {
						results.noun.syn.forEach(function(synonym) {
							synonyms.push(synonym);
						});
					}
					else if (results.noun.usr != undefined) {
						results.noun.usr.forEach(function(synonym) {
							synonyms.push(synonym);
						});
					}
					
					if (results.noun.ant != undefined) {
						results.noun.ant.forEach(function(antonym) {
							antonyms.push(antonym);
						});
					}
				}
				if (results.verb != undefined) {
					if (results.verb.syn != undefined) {
						results.verb.syn.forEach(function(synonym) {
							synonyms.push(synonym);
						});
					}
					else if (results.verb.usr != undefined) {
						results.verb.usr.forEach(function(synonym) {
							synonyms.push(synonym);
						});
					}
					
					if (results.verb.ant != undefined) {
						results.verb.ant.forEach(function(antonym) {
							antonyms.push(antonym);
						});
					}
				}
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
                title: "Finding synonyms for " + msg.selection + "...(re-click)",
                contexts: ['selection'],
                onclick: cm_clickHandler
            };

            cmid = chrome.contextMenus.create(options, function(pid) {
				var synonyms = find_synonyms(msg.selection);
			});
			
        }
    }
});
