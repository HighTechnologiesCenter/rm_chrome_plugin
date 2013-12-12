function save_options() {
  var url = document.getElementById("url").value.trim();
  var key = document.getElementById("key").value.trim();
  var limit = document.getElementById("limit").value.trim();
  var assigned_to_id = document.getElementById("assigned_to_id").value.trim();
  var status_id = document.getElementById("status_id").value.trim();
  var project_id = document.getElementById("project_id").value.trim();

  var status = document.getElementById("info");
  result = ''

  if (url){
    result += url+'/issues.json'
  } else {
    status.innerHTML = "You must enter URL"
    return
  };
  if (key){
    result += '?key='+key
  } else {
    status.innerHTML = "You must enter KEY"
    return
  };
  if (limit){
    result += '&limit='+limit
  };
  if (assigned_to_id){
    result += '&assigned_to_id='+assigned_to_id
  };
  if (status_id){
    result += '&status_id='+status_id
  };
  if (project_id){
    result += '&project_id='+project_id
  };

  result += '&sort=updated_on:desc'
  localStorage["url"] = result;

  // Update status to let user know options were saved.
  status.innerHTML = "Options Saved.<br>"+result;
  setTimeout(function() {
    status.innerHTML = "";
  }, 5000);
}
//------------------------------------------------------------
function restore_options() {
  var rm_url = localStorage["url"];
  if (!rm_url) {
    return;
  }

  var url = document.getElementById("url");
  var fields = {
    'key':document.getElementById("key"),
    'limit':document.getElementById("limit"),
    'assigned_to_id':document.getElementById("assigned_to_id"),
    'status_id':document.getElementById("status_id"),
    'project_id': document.getElementById("project_id")
  };


  var head = rm_url.split('/issues.json?')[0];
  var splited_tail = rm_url.split('?')[1].split('&');

  for (i=0, l=splited_tail.length; i<l; i++){
    var key = splited_tail[i].split('=')[0];
    var value = splited_tail[i].split('=')[1]; 
    if (fields[key]){
      fields[key]['value']  = value
    };
  };
  url['value'] = head

  var permission_urls = chrome.app.getDetails().permissions
  var datalist = document.getElementById('redmine_servers')
  for(i=0, l=permission_urls.length, url=permission_urls[0]; i<l; i++, url=permission_urls[i]){
    if (url.match('http://')){
      var elmnt = document.createElement('option')
      elmnt.value = url.slice(0, url.length-1)
      datalist.appendChild(elmnt)
    }
  }
  //----------------------------
  document.getElementById('show_projects').onclick = function(){
    var request_get = {};
    request_get.url = head+'/projects.json?key='+fields.key.value+'&limit=100';
    request_get.dataType = "json";
    request_get.success = function(json){
      var right = document.getElementById('right');
      right.innerHTML = ''
      for(var i=0, project=json.projects[0],l=json.projects.length; i<l;i++, project=json.projects[i]){
        right.innerHTML+= project.name+' - '+project.id.toString()+'<br>'
      }
    };
    $.ajax(request_get)
  }
  //document.getElementById('show_status').onclick = function(){getId('projec')}
  document.getElementById('show_name').onclick = function(){
    var request_get = {};
    request_get.url = head+'/users.json?key='+fields.key.value+'&limit=100';
    request_get.dataType = "json";
    request_get.success = function(json){
      var right = document.getElementById('right');
      right.innerHTML = ''
      for(var i=0, user=json.users[0],l=json.users.length; i<l;i++, user=json.users[i]){
        var name = document.createElement('name')
        var name_id = document.createElement('nameid')
        name.innerHTML = user.lastname+' '+user.firstname
        name_id.innerHTML = user.id.toString()
        right.appendChild(name)
        right.appendChild(name_id)

      }
    };
    $.ajax(request_get)
  }

}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);