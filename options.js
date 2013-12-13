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
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);