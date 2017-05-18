import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import fs from 'fs';
/* eslint-disable */
import { spawn } from 'child_process';

// const bat = spawn('pwd');
const bat = spawn('java', [ '-jar', 'app/java/ste-0.1-jar-with-dependencies.jar' ]);

bat.stdout.on('data', (data) => {
  console.log('stdout', data.toString());
});

bat.stderr.on('data', (data) => {
  console.log('stderr', data.toString());
});

bat.on('message', (m, socket) => {
  console.log('message', m);
});

bat.on('error', (err) => {
  console.log('err', err);
});
bat.on('exit', (code) => {
  console.log(`Child exited with code ${code}`);
});
/* eslint-enable */

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
