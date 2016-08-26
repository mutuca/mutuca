const {BrowserWindow, ipcMain} = require('electron');

let settingsWindow;

function createSettingsWindow() {
  var conf = {
    icon: "${__dirname}/../views/icons/fly.ico",
    autoHideMenuBar: true,
    width: 640,
    height: 480,
    webPreferences: {
        zoomFactor: mutucaApp.config.get('scale-factor')
    },
    frame: true,
    titleBarStyle: 'hidden',
    resizable: true,
    title: 'Settings',
    show: false
  };

  settingsWindow = new BrowserWindow(conf);
  settingsWindow.loadURL(`file://${__dirname}/../views/settings/settings.html`);

  settingsWindow.webContents.on('dom-ready', () => {
    settingsWindow.show();
  });

  settingsWindow.webContents.on('close', () => {
    settingsWindow = undefined;
  });
}

ipcMain.on('show-settings', createSettingsWindow);
ipcMain.on('settings-refresh-repositories', (event) => {
  let repositories = [];
  let getRepos = (err, res) => {
    if (err) {
      console.log('repositories: ' + err);
      event.sender.send('setttings-refresh-repositories-autocomplete', null);
    }

    repositories = repositories.concat(res);

    if (mutucaApp.github.hasNextPage(res)) {
      mutucaApp.github.getNextPage(res, getRepos);
    } else {
      event.sender.send('setttings-refresh-repositories-autocomplete', repositories);
    }
  }

  mutucaApp.github.repos.getAll({ per_page: '100' }, getRepos);
});

ipcMain.on('add-repository', (event, repository) => {
  let repositories = mutucaApp.config.get("repositories");
  if (repositories.indexOf(repository) >= 0) {
    return;
  }

  repositories.push(repository);
  mutucaApp.config.set("repositories", repositories);

  event.sender.send('update-repositories', repositories);
});

ipcMain.on('remove-repository', (event, repository) => {
  let repositories = mutucaApp.config.get("repositories");
  repositories.splice(repositories.indexOf(repository), 1);
  mutucaApp.config.set("repositories", repositories);
  event.sender.send('update-repositories', repositories);
});

ipcMain.on('select-repository', (event, repository) => {
  let split = repository.split("/");
  let owner = split[0];
  let repo = split[1];
  let context = {
    github: {
      repository: repo,
      owner: owner
    },
    repository: repository
  }

  mutucaApp.config.set("context", context);
});

ipcMain.on('repositories-ready', (event) => {
  mutucaApp.window.webContents.send('update-repositories', {
    repositories: mutucaApp.config.get('repositories'),
    context: mutucaApp.config.get('context')
  });
});

module.exports = createSettingsWindow;
