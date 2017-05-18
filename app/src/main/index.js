import { app, BrowserWindow } from 'electron';

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:${require('../../../config').port}`
  : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
  });

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // eslint-disable-next-line no-console
  console.log('mainWindow opened');
}

app.on('ready', createWindow);

ipcMain.on('file-open-dialog', (event) => {
  dialog.showOpenDialog({
    properties: ['openFile'],
  }, (filePaths) => {
    fs.readFile(filePaths[0], 'utf8', (err, data) => {
      if (err) throw err;
      const file = { content: data, path: filePaths[0] };
      event.sender.send('file-dialog-opened', file);
    });
  });
});

ipcMain.on('save-file', (event, file) => {
  fs.writeFile(file.path, file.content, 'utf8', (err) => {
    if (err) throw err;
    event.sender.send('file-saved', file.path);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
