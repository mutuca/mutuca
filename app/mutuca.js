/**
 * Mutuca - The Definitive Developer Dashboard
 * Copyright (c) 2016 Leonardo Eloy
 */

const applicationName = 'mutuca',
      {BrowserWindow, ipcMain} = require('electron'),
      Config = require('electron-config'),
      MutucaSettings = require('./settings'),
      Plugins = require('./plugins'),
      PluginManager = require('./plugin-manager'),
      GitHubApi = require('github');

class MutucaApplication {
  constructor() {
    this.window = null;
    this.config = null;
    this.pluginManager = null;
    this.github = null;

    this.defaultConfig = {
      'debug': false,
      'width': 1280,
      'height': 1024,
      'scale-factor': 1.0,
      'githubUser': '',
      'githubToken': '',
      'githubProtocol': 'https',
      'githubBaseUrl': 'api.github.com',
      'githubApiPath': '',
      'pluginIndexUrl': 'https://raw.githubusercontent.com/mutuca/plugins/master/plugins.json',
      'updateFrequency': 2,
      'completeSettings': false,
      'plugins.installed': {},
      'proxyHost': '',
      'proxyPort': '',
      'proxyEnabled': false,
      'repositories': [],
      'context': {}
    };
  }

  run() {
    this.pluginManager = new PluginManager();
    this.config = new Config(this.defaultConfig);
    this.window = this._createWindow();

    this._setupGitHub();

    app.setName(applicationName);
  }

  _setupGitHub() {
    let apiConfig = {
      protocol: this.config.get('githubProtocol'),
      host: this.config.get('githubBaseUrl'),
      pathPrefix: this.config.get('githubApiPath'),
      debug: this.config.get("debug")
    };

    if (this.config.get('proxyEnabled')) {
      apiConfig['proxy'] = {
        host: this.config.get('proxyHost'),
        port: this.config.get('proxyPort')
      };
    }

    this.github = new GitHubApi(apiConfig);
    this.github.authenticate({
      type: "oauth",
      token: this.config.get('githubToken')
    });
  }

  pluginTick() {

  }

  _createWindow() {
    var conf = {
      icon: "${__dirname}/../views/icons/fly.ico",
      autoHideMenuBar: true,
      width: mutucaApp.config.get('width'),
      height: mutucaApp.config.get('height'),
      webPreferences: {
          zoomFactor: mutucaApp.config.get('scale-factor')
      },
      frame: false,
      titleBarStyle: 'hidden',
      resizable: true,
      skipTaskbar: false,
    };

    if (mutucaApp.config.get('x') !== null) {
      conf.x = mutucaApp.config.get('x');
      conf.y = mutucaApp.config.get('y');
    }

    let newWindow = new BrowserWindow(conf);
    this._registerEvents(newWindow);
    newWindow.loadURL(`file://${__dirname}/../views/main/index.html`);

    if (mutucaApp.config.get('debug')) {
      newWindow.webContents.openDevTools();
    }

    if (!mutucaApp.config.get('completeSettings')) {
      //MutucaSettings();
    }

    return newWindow;
  }

  _registerEvents(newWindow) {
    newWindow.on('resize', (e, cmd) => {
      let bounds = global.mutucaApp.window.getBounds();
      global.mutucaApp.config.set('width', bounds.width);
      global.mutucaApp.config.set('height', bounds.height);
      global.mutucaApp.config.set('x', bounds.x);
      global.mutucaApp.config.set('y', bounds.y);
    });
  }
}

module.exports = MutucaApplication;
