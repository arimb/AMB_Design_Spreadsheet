const { app, BrowserWindow } = require('electron');

const createWindow = () => {
  const win = new BrowserWindow({show: false});

  win.loadFile('index.html');
  win.maximize();
  win.show();
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});