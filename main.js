const { app, BrowserWindow, Menu, shell } = require('electron');
const prompt = require('electron-prompt');

if (handleSquirrelEvent()) {
  return;
}

const createWindow = url => {
  const win = new BrowserWindow({
    show: false
  });

  if (url) {
    console.log(url);
    if (url) {
      let link = url.split("/").pop().split("?");
      console.log(link[0].replace(".html", "") + ".html?" + link[1]);
      win.loadFile(link[0].replace(".html", "") + ".html");
    }
  } else {
    win.loadFile('index.html');
  }
  
  win.maximize();

  const menu = [
    {
      label: 'File',
      submenu: [
        {
          label: "New",
          accelerator: "CmdOrCtrl+N",
          click: () => createWindow(null)
        },
        {
          label: "Open",
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            prompt({
              title: "Open",
              label: "Enter the calculator URL:",
              inputAttrs: {
                type: "url"
              }
            })
            .then(url => createWindow(url));
          }
        },
        {role: "close"}
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {role: "cut"},
        {role: "copy"},
        {role: "paste"},
        {role: "delete", accelerator: "Delete"},
        {role: "selectAll"}
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'minimize' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: "Go to Website",
          click: async () => {
            await shell.openExternal("https://ambcalc.com/");
          }
        },
        {
          label: 'Help Thread',
          click: async () => {
            await shell.openExternal('https://www.chiefdelphi.com/t/amb-robotics-calculator/414209?u=arimb');
          }
        },
        {
          label: 'Contact the Developer',
          click: async () => {
            await shell.openExternal('mailto:arimb1999@gmail.com');
          }
        }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

  win.show();
};

app.whenReady().then(() => {
  createWindow(null);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(null);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
}