const {ipcMain} = require('electron'),
      npmi = require('npmi');

class PluginManager {
  constructor() {
    this.availablePlugins = {};

    ipcMain.on('install-plugin', (event, pluginName) => {
      this.install(event, pluginName);
    });

    ipcMain.on('remove-plugin', (event, pluginName) => {
      var plugin = this.remove(pluginName);
      event.sender.send('plugin-removed', { plugin: plugin, result: true });
    });

    ipcMain.on('update-plugin', (event, pluginName) => {
      this.update(event, pluginName);
    });

    ipcMain.on('available-plugin', (event, plugin) => {
      this.availablePlugins[plugin.name] = plugin;
    });

    ipcMain.on('plugin-loaded', (event, plugin) => {
      console.log('loaded ' + plugin);
    });

    ipcMain.on('ready-to-plugins', (event) => {
      var objects = this.getCardPlugins();
      event.sender.send('plugins-loaded', objects);
    });
  }

  install(event, pluginName) {
    var plugin = this.availablePlugins[pluginName];
    var options = {
      name: pluginName,
      version: plugin.version,
      path: '.'
    };

    npmi(options, (err, result) => {
      if (err) {
        console.log(err.message);
      }

      var installedPlugins = this.getInstalledPlugins();
      installedPlugins[pluginName] = plugin;
      app.mutucaApp.config.set("plugins.installed", installedPlugins);
      event.sender.send('plugin-installed', { plugin: plugin, result: !err });
    });
  }

  update(event, pluginName) {
    var plugin = this.availablePlugins[pluginName];
    var options = {
      name: pluginName,
      version: plugin.version,
      path: '.',
      forceInstall: true
    };

    npmi(options, (err, result) => {
      if (err) {
        console.log(err.message);
      }

      var installedPlugins = this.getInstalledPlugins();
      installedPlugins[pluginName] = plugin;
      app.mutucaApp.config.set("plugins.installed", installedPlugins);
      event.sender.send('plugin-updated', { plugin: plugin, result: !err });
    });
  }

  remove(pluginName) {
    var installedPlugins = this.getInstalledPlugins();
    var plugin = installedPlugins[pluginName];
    delete installedPlugins[pluginName];
    app.mutucaApp.config.set("plugins.installed", installedPlugins);

    return plugin;
  }

  getInstalledPlugins() {
    return app.mutucaApp.config.get("plugins.installed");
  }

  getCardPlugins() {
    let objects = [], plugin;
    let plugins = this.getInstalledPlugins();
    for (plugin in plugins) {
      let objectClass = require(plugin);
      let instance = new objectClass();
      if (instance.pluginType() !== 'card') {
        continue;
      }

      let pluginObject = {
        cardSize: instance.cardSize(),
        cardPath: instance.cardPath(),
        pluginName: instance.pluginName(),
        version: instance.version(),
        toString: instance.toString(),
        pluginType: instance.pluginType(),
        instance: instance
      }

      objects.push(pluginObject);
    }

    return objects;
  }
}

module.exports = PluginManager;
