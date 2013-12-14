function save_options() {
  var url = document.getElementById("url").value.trim();
  var key = document.getElementById("key").value.trim();
  var limit = document.getElementById("limit").value.trim();
  var assigned_to = document.getElementById("assigned_to").value.trim();
  var status_id = document.getElementById("status").value.trim();
  var project_id = document.getElementById("project").value.trim();
  var author = document.getElementById("author").value.trim();
  var tracker = document.getElementById("tracker").value.trim();

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
  localStorage["assigned_to"] = assigned_to
  localStorage["status"] = status_id
  localStorage["project"] = project_id
  localStorage["author"] = author
  localStorage["tracker"] = tracker

  result += '&status_id=*&sort=updated_on:desc'
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
  
  var head = rm_url.split('/issues.json?')[0];
  var splited_tail = rm_url.split('?')[1].split('&');
  var param_from_url = {}
  for (i in splited_tail){
    param_from_url[splited_tail[i].split('=')[0]] = splited_tail[i].split('=')[1]
  }
  document.getElementById("key").value = param_from_url["key"] || ''
  document.getElementById("limit").value = param_from_url["limit"] || ''

  document.getElementById("url").value = head
  document.getElementById("assigned_to").value = localStorage["assigned_to"]||''
  document.getElementById("status").value = localStorage["status"]||''
  document.getElementById("project").value = localStorage["project"]||''
  document.getElementById("author").value = localStorage["author"]||''
  document.getElementById("tracker").value = localStorage["tracker"]||''

}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);