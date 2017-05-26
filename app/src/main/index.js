import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import fs from 'fs';
/* eslint-disable */
import { spawn } from 'child_process';
import socketIO from 'socket.io';
import { inspect } from 'util';

const javaProcess = spawn('java', [ '-jar', 'app/java/ste-0.1-jar-with-dependencies.jar' ]);

javaProcess.on('message', (m, socket) => {
  console.log('message', m);
});
javaProcess.stdout.on('data', (data) => {
  console.log('data', data.toString());
});
javaProcess.on('stdout', (err) => {
  console.log('stdout', err);
});
javaProcess.on('stderr', (err) => {
  console.log('err', err);
});
javaProcess.on('error', (err) => {
  console.log('err', err);
});
javaProcess.on('exit', (code) => {
  console.log(`Child exited with code ${code}`);
});

const io = new socketIO(41414);
let connectedJavaSocket = null;

io.on('connection', function(socket){
  connectedJavaSocket = socket;
  // socket.on('file.encrypted', function(obj){
  //   console.log('file encrypted', inspect(obj));
  //
  //   socket.emit('file.decrypt', {
  //     "encryptionSettings": {
  //       "fileName": "test.txt",
  //       "cipherSuite": "DES/ECB/ZeroBytePadding",
  //       "key": "12345678",
  //       "keySuite": "DES"
  //     }, "secret": obj.secret});
  // });
  //
  // socket.on('file.decrypted', function(obj) {
  //   console.log('file decrypted', inspect(obj));
  // });
  //
  // console.log('socket connection to java proces established');
  //
  // socket.emit('file.encrypt', {
  //   "encryptionSettings": {
  //     "fileName": "test.txt",
  //     "cipherSuite": "DES/ECB/ZeroBytePadding",
  //     "key": "12345678",
  //     "keySuite": "DES"
  //    }, "fileContent": "hallo"});
  // socket.emit('file.encrypt', { encryptionSettings: "hallo", fileContent: 'jhasdjh'});
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

ipcMain.on('encrypt-file', (event, file) => {
  const fileContent = file.content;
  connectedJavaSocket.emit('file.encrypt', {
    encryptionSettings: {
      fileName: 'test.txt',
      cipherSuite: 'DES/ECB/ZeroBytePadding',
      key: '12345678',
      keySuite: 'DES',
    }, fileContent });
  connectedJavaSocket.on('file.encrypted', (obj) => {
    event.sender.send('file-encrypted', obj);
  });
});

ipcMain.on('decrypt-file', (event, file) => {
  const secret = file.content;
  connectedJavaSocket.emit('file.decrypt', {
    encryptionSettings: {
      fileName: 'test.txt',
      cipherSuite: 'DES/ECB/ZeroBytePadding',
      key: '12345678',
      keySuite: 'DES',
    }, secret });
  connectedJavaSocket.on('file.decrypted', (obj) => {
    event.sender.send('file-decrypted', obj);
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
