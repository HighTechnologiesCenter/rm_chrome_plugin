var parameter_names = [
    'limit', 
    'assigned_to', 
    'status', 
    'project',
    'author',
    'tracker', 
    'query_string',
    'watch_issues',
    'watch_project',
    'watch_author'
  ]

function save_options() {

  for(i in parameter_names){
    localStorage[parameter_names[i]] = document.getElementById(parameter_names[i]).value.trim();
  }
  info = document.getElementById('info')

  if (document.getElementById('hostname').value.trim()){
    localStorage['hostname'] = document.getElementById('hostname').value.trim();
  } else {
    info.innerHTML = "You must enter hostname"
    return
  };
  if (document.getElementById('apikey').value.trim()){
    localStorage['apikey'] = document.getElementById('apikey').value.trim();
  } else {
    info.innerHTML = "You must enter KEY"
    return
  };

  // Update status to let user know options were saved.

  info.innerHTML = "Options Saved";
  setTimeout(function() {
    info.innerHTML = "";
  }, 5000);
}
//------------------------------------------------------------
function restore_options() {
  var parameters = parameter_names
  parameters.push('hostname');
  parameters.push('apikey');

  for(i in parameters){
    document.getElementById(parameters[i]).value = localStorage[parameters[i]] || ''
  }

}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);