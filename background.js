//http://developer.chrome.com/extensions/declare_permissions.html
// Make button on Notification clickable  
chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex){
	chrome.tabs.create({url: localStorage['hostname']+'/issues/'+notificationId})
}
)
// notification for errors
function alertNotification(message){
	var notification = webkitNotifications.createNotification('','Warning',message);
	notification.show();
	setTimeout(function(){notification.cancel()}, 5000)
}

//notification for issue
function showNotification(issue){
// http://developer.chrome.com/extensions/notifications.html
	var opt = {}
	opt.type = "basic"
	opt.title = '#'+issue.id+' '+issue.subject.toString()+'('+issue.project['name']+')'
	opt.buttons = [{title:'Open',iconUrl:''}]
//		icon from manifest.json
	opt.iconUrl = chrome.app.getDetails().icons[48]

    opt.message = 'Author: '+issue.author['name']
    opt.message += '\nStatus: '+issue.status['name']
   	opt.message += (issue.assigned_to) ? '\nAssigned: '+issue.assigned_to['name'] : ''
    opt.message += '\nUpdated: '+ new Date(issue.updated_on).toLocaleString()	

	chrome.notifications.create(
		issue.id.toString(), 
		opt ,
		function(){}
	) 
}
//=================== filter =======================
function isContainWordsFrom(comma_separated_words, filtering_value){
	if ( comma_separated_words ){
		words = comma_separated_words.toLowerCase().split(',');
		return words.some(function(word){
			return (filtering_value.toLowerCase().search(word.trim()) > -1 && word.trim().length>0);
		})
	}
	return true
}

function isShow(issue){
	// Watch
	var watchers = {
		'watch_issues':issue.id.toString(),
		'watch_project':issue.project.name,
		'watch_author':issue.author.name
	}

	for (watch in  watchers){
		if( localStorage[watch]&&isContainWordsFrom(localStorage[watch], watchers[watch]) ){
			return true
		}
	}

	// Filter
	var filters = {
		'project':  issue.project.name,
	   	'tracker':  issue.tracker.name,
		'status':   issue.status.name,
		'author':   issue.author.name,
		'assigned_to': (issue.assigned_to) ? issue.assigned_to.name : ''
	};

	for (filter_name in filters){
		if(!isContainWordsFrom(localStorage[filter_name], filters[filter_name])){
			return false
		}
	}
	return true
}

//============================================================
// Download new issues and execute function show .
function downloadIssuesAnd(show){
	if (!localStorage["hostname"] || !localStorage["key"]) {
		//alertNotification('You must fill URL field in settings');
		return
	};

	var request_get = {};
    request_get.url = urlFromlocalStorage(localStorage);
    request_get.dataType = "json";
    request_get.success = function(json){ show(json.issues) };
    
    httpGet(request_get);
}
//============================================================
var issues = new Object()
issues.all = []
issues.redmine_url = urlFromlocalStorage(localStorage)

//============================================================
// Check that object a is in list of issues
issues.isNotContains = function(a){
	for (var i = 0, l = this.all.length; i < l; i++){
		if (a.id == this.all[i].id && a.updated_on==this.all[i].updated_on){
			return false
		}
	};
	return true;
}
issues.updateFrom = function(downloaded_issues){
	var result = []
	//Checking for basic settings change
	if (this.redmine_url != urlFromlocalStorage(localStorage) || this.all.length == 0){
		this.redmine_url = urlFromlocalStorage(localStorage);
		this.all = downloaded_issues;
		return result
	}

	for (var i = 0, l = downloaded_issues.length; i < l; i++){
		if ( this.isNotContains(downloaded_issues[i]) ){
			result.push(downloaded_issues[i])
		}
	}
	
	this.all = downloaded_issues;
	return result
}
//=============================================================
function showNewFiltred(downloaded_issues){ 
	issues.updateFrom(downloaded_issues).filter(isShow).map(showNotification) 
}

downloadIssuesAnd(showNewFiltred)
setInterval(function(){ downloadIssuesAnd(showNewFiltred) },60000);

//============================================================
function urlFromlocalStorage(localStorage){
	var out = localStorage['hostname']+'/issues.json?sort=updated_on:desc';
	out += (localStorage['limit']) ? '&limit='+localStorage['limit'] : '';
	if (localStorage['query_string']){out+= '&'+localStorage['query_string']};
	return out
}
//http://xmlhttprequest.ru/
//http://learn.javascript.ru/json
function httpGet(request){
	var xmlhttp = new XMLHttpRequest()
	
	//xmlhttp.open("GET",request.url,true);
	xmlhttp.open("GET",request.url,true)
	xmlhttp.setRequestHeader('X-Redmine-API-Key', localStorage['apikey'])
	xmlhttp.send(null);
	xmlhttp.onreadystatechange = function(){
		if (xmlhttp.readyState != 4){ return }

		if(xmlhttp.status == 200) {
			try{
				json = JSON.parse(xmlhttp.responseText);
			}catch(err){
				alertNotification("Error description: " + err.message)	
			}
			if (json){ request.success(json) }
		}else{
			alertNotification("Can't connect to server.\nStatus: " + xmlhttp.status.toString() + ' ('+xmlhttp.statusText+')')
		}


	}
}