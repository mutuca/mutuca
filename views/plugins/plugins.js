window.mutucaApp = require('electron').remote.app.mutucaApp;

function addOrRefreshPluginCard(plugin, action) {
  var actions = [];
  if (action === 'installed') {
    actions.push('<a href="#" data-action="update" data-key="'+ plugin.name + '">Update</a>');
    actions.push('<a href="#" data-action="remove" data-key="'+ plugin.name + '">Remove</a>');
  } else if (action === 'removed') {
    actions.push('<a href="#" data-action="install" data-key="'+ plugin.name + '">Install</a>');
  }

  let element = $("#plugins div[data-key='" + plugin.name + "']");
  let hasPluginRendered = (element.length == 1);

  // update or add card
  if (!hasPluginRendered) {
    let card = '<div data-key="' + plugin.name + '" class="col s12">' +
              '<div class="card hoverable">' +
                '<div class="card-content">' +
                  '<span class="card-title">' + plugin.displayName + '</span>' +
                  '<p>' + plugin.description + '</p>' +
                  '<p><a href="' + plugin.repository +'" target="_blank">Repository</a></p>' +
                  '<p>' + plugin.version + ' - ' + plugin.license + '</p>' +
                '</div>' +
                '<div class="card-action">' +
                  actions.join("") +
                '</div>' +
              '</div>' +
            '</div>';
    $("<div/>", { html: card }).appendTo("#plugins");
  } else {
    $("#plugins div[data-key='" + plugin.name + "'] .card-action").empty().append($("<div/>", { html: actions }));
  }
}

function updateCardActions() {
  var actions = ['install', 'remove', 'update'];
  $.each(actions, (i, action) => {
    $("#plugins a[data-action='" + action + "']").each((index, item) => {
      $(item).off("click").click((event) => {
        $('#plugin-modal').openModal();
        var pluginName = item.attributes['data-key'].value;

        ipcRenderer.send(action + '-plugin', pluginName);
        event.preventDefault();
      });
    });
  });
}

var actions = ['installed', 'removed', 'updated'];
$.each(actions, (index, action) => {
  ipcRenderer.on('plugin-' + action, (event, result) => {
    $('#plugin-modal').closeModal();
    var msg = "<i>" + result.plugin.displayName + "</i>&nbsp;successfully "+ action + ".";
    if (!result.result) {
      msg = "<i>" + result.plugin.displayName + "</i>&nbsp;: operation failed.";
    }

    addOrRefreshPluginCard(result.plugin, action);
    updateCardActions();

    Materialize.toast(msg, 3000);
  });
});


$(document).ready(() => {
  var installedPlugins = window.mutucaApp.config.get('plugins.installed');
  $.getJSON(window.mutucaApp.config.get('pluginIndexUrl'), (data) => {
    $.each(data.plugins, (key, plugin) => {
      addOrRefreshPluginCard(plugin, (plugin.name in installedPlugins) ? 'installed' : 'removed');
      ipcRenderer.send('available-plugin', plugin);
    });

    updateCardActions();
    $('.progress').hide();
  });

  $('#close').click(() => window.close());
});
