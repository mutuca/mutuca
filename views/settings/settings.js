$(document).ready(() => {
  const {ipcRenderer} = require('electron');
  window.mutucaApp = require('electron').remote.app.mutucaApp;

  var fields = ['proxyHost', 'proxyPort', 'proxyEnabled', 'pluginIndexUrl', 'githubUser',
                'githubBaseUrl', 'githubApiPath', 'githubToken', 'updateFrequency', 'githubProtocol'];

  $.each(fields, (i) => {
    let field = fields[i];
    $("#" + field).val(window.mutucaApp.config.get(field));
  });

  $('#cancel').click(() => {
    window.close();
  });

  $('#save').click(() => {
    $.each(fields, (i) => {
      let field = fields[i];
      window.mutucaApp.config.set(field, $("#" + field).val());
    });

    window.close();
  });

  $('#refreshRepositories').click(() => {
    Materialize.toast('Loading repositories...', 2000);
    ipcRenderer.send('settings-refresh-repositories');
  });

  $('#refreshRepositories').click();

  function addRepository(repository) {
    let repoElement = '<li id="repository-' +  repository + '" class="collection-item">' +
                      '<div>' + repository + '<a data-action="remove-repository" data-key="' + repository + '" href="#!" class="secondary-content">' +
                      '<i class="material-icons">delete</i></a></div></li>';
    $(repoElement).appendTo("#added-repositories");
  }

  function bindRepositories() {
    $("a[data-action='remove-repository']").off('click').click((event) => {
      var repository = $(event.currentTarget).attr('data-key');
      ipcRenderer.send('remove-repository', repository);
      $(event.currentTarget).parent().parent().remove();
      Materialize.toast("Removed '" + repository + "'.", 2000);
    });
  }

  let repositories = window.mutucaApp.config.get("repositories");
  $.each(repositories, (i) => {
    addRepository(repositories[i]);
  });
  bindRepositories();

  $('#addRepository').click((event, item) => {
    var repository = $("#autocomplete-input").val();
    if (repository == "") {
      Materialize.toast('Select a repository to add.', 2000);
      return;
    }

    addRepository(repository);
    bindRepositories();
    $("#autocomplete-input").val("");
    ipcRenderer.send('add-repository', repository);
    Materialize.toast("Added '" + repository + "'.", 2000);
  });

  ipcRenderer.on('setttings-refresh-repositories-autocomplete', (event, repositories) => {
    if (repositories == null) {
      Materialize.toast('Error loading GitHub repositories.', 2000);
      return;
    }

    let data = {};
    $.each(repositories, (index, repository) => {
      let repositoryName = repository.owner.login + '/' + repository.name;
      data[repositoryName] = null;
    });

    $('input.autocomplete').autocomplete({ data: data });
    Materialize.toast('Finished loading repositories.', 2000);
  });

  $(document).ready(function(){
    $('ul.tabs').tabs();
  });
});
