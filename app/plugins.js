const {BrowserWindow, ipcMain} = require('electron');

let pluginsWindow;

function createPluginsWindow() {
  var conf = {
    icon: "${__dirname}/../views/icons/fly.ico",
    autoHideMenuBar: true,
    width: 640,
    height: 480,
    webPreferences: {
        zoomFactor: app.mutucaApp.config.get('scale-factor')
    },
    frame: true,
    titleBarStyle: 'hidden',
    resizable: true,
    title: 'Plugins',
    show: false
  };

  pluginsWindow = new BrowserWindow(conf);
  pluginsWindow.loadURL(`file://${__dirname}/../views/plugins/plugins.html`);

  pluginsWindow.webContents.on('dom-ready', () => {
    pluginsWindow.show();
  });

  pluginsWindow.webContents.on('close', () => {
    pluginsWindow = undefined;
  });
}

ipcMain.on('show-plugins', createPluginsWindow);
module.exports = createPluginsWindow;
