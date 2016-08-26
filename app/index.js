/**
 * Mutuca - The Definitive Developer Dashboard
 * Copyright (c) 2016 Leonardo Eloy
 */
require('electron-debug')();

const app = require('electron').app,
      MutucaApplication = require('./mutuca');

let mutucaApp;

app.on("ready", () => {
  mutucaApp = new MutucaApplication();

  global.mutucaApp = mutucaApp;
  global.app = app;
  app.mutucaApp = mutucaApp;

	mutucaApp.run();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
    if (mutucaApp.window == null) {
        mutucaApp.createWindow();
    }
});
