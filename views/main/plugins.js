ipcRenderer.on('plugins-loaded', (event, pluginObjects) => {
  let pluginContainer = $("#plugin-container");
  let rows = [], pluginsToLoad = [];
  let currentRowSize = 0, currentRow = 0, i;
  while (pluginObjects.length > 0) {
    rows[currentRow] = [];
    let localPluginObjects = pluginObjects;
    for (i in localPluginObjects) {
      var plugin = pluginObjects[i];
      if ((currentRowSize + plugin.cardSize) > 12) {
        continue;
      }

      rows[currentRow].push("<div class='col s" + plugin.cardSize + "' id='" + plugin.pluginName + "'></div>");
      pluginsToLoad.push({ plugin: plugin.pluginName, path: plugin.cardPath });
      localPluginObjects.splice(i, 1);
      pluginObjects = localPluginObjects;
    }
  }

  $.each(rows, (index) => {
    let rowDiv = "<div class='row'>" + rows[index].join("") + "</div>";
    pluginContainer.append($(rowDiv));
  });

  $.each(pluginsToLoad, (index, pluginToLoad) => {
    $("#" + pluginToLoad.plugin).load(pluginToLoad.path);
  });
});

$(document).ready(() => ipcRenderer.send('ready-to-plugins'));
