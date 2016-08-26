const ipcRenderer = require('electron').ipcRenderer;

$('#navbar').load('../navbar.html', () => {
  $(".dropdown-button").dropdown();

  var actions = ["settings", "plugins"];
  $.each(actions, (index, action) => {
    $('#' + action).click((e) => {
      ipcRenderer.send('show-' + action);
      e.preventDefault();
    });
  });

  function pluginTick() {
    let updateFrequency = window.mutucaApp.config("updateFrequency").get();
    setInterval(ipcRenderer.send('plugin-tick'), updateFrequency * 60 * 1000);
  }

  $("#pluginTick").click(() => {
    ipcRenderer.send('plugin-tick');
  });

  ipcRenderer.send('repositories-ready');
  setInterval(ipcRenderer.send('plugin-tick'), 3000);
});

function selectRepository() {
  $("a[data-action='select-repository']").click((event) => {
    var repository = $(event.currentTarget).attr('data-key');
    ipcRenderer.send('select-repository', repository);
    $("#selected-repository").text(repository);
    ipcRenderer.send('plugin-tick');
  });
}

ipcRenderer.on('update-repositories', (event, response) => {
  let repoElements = [];
  $.each(response.repositories, (index) => {
    var repository = response.repositories[index];
    repoElements.push('<li><a href="#!" data-action="select-repository" data-key="'+repository+'">'+repository+'</a></li>');
  });

  $("#repositories").empty();
  $(repoElements.join("")).appendTo("#repositories");
  $(".dropdown-button").dropdown();
  selectRepository();
  $("#selected-repository").text(response.context.repository);
});
