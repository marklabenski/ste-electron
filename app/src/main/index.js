import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import fs from 'fs';
/* eslint-disable */
import { spawn } from 'child_process';
import socketIO from 'socket.io';
import { inspect } from 'util';

if (process.env.NODE_ENV !== 'development') {
  const jarPath = 'asar:' + __dirname + './app/java/ste-0.1-jar-with-dependencies.jar';
  const javaProcess = spawn('java', [ '-jar', jarPath ]);

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
}

const io = new socketIO(41414);
let connectedJavaSocket = null;

io.on('connection', function(socket){
  connectedJavaSocket = socket;
  connectedJavaSocket.emit('info.list-algorithms', {});

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
    if (!filePaths) {
      event.sender.send('file-dialog-canceled');
      return;
    }
    fs.readFile(filePaths[0], 'utf8', (err, data) => {
      if (err) throw err;
      let fileTransferObj = { content: data, path: filePaths[0] };
      if (data[0] === '{' && /encrypted/g.test(data)) {
        fileTransferObj = JSON.parse(data);
      }

      event.sender.send('encrypted-file-opened', fileTransferObj);
    });
  });
});

ipcMain.on('save-file-dialog', (event) => {
  dialog.showOpenDialog({
    // 'defaultPath': event.,
  }, (filename) => {
    fs.writeFile(filename, event.fileContent, (err) => {
      if (err) throw err;
      event.sender.send('file-saved', event.fileContent);
    });
  });
});

ipcMain.on('save-file', (event, file) => {
  let fileToSave = file.content;
  if (file.type === 'encrypted') {
    fileToSave = JSON.stringify(file);
  }

  fs.writeFile(file.path, fileToSave, 'utf8', (err) => {
    if (err) throw err;
    event.sender.send('file-saved', file.path);
  });
});

ipcMain.on('open-key-file', (event, filePath) => {
  const readKeyFileData = function openKeyFile(keyFilePath) {
    fs.readFile(keyFilePath, 'utf8', (err, data) => {
      if (err) throw err;
      let keyFileData = '';
      if (data[0] === '{') {
        keyFileData = JSON.parse(data);
      } else {
        throw err;
      }
      event.sender.send('key-file-opened', keyFileData);
    });
  };
  fs.access(filePath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
    if (err) {
      dialog.showOpenDialog({
        properties: ['openFile'],
      }, (filePaths) => {
        if (!filePaths) {
          event.sender.send('key-file-not-selected');
          return;
        }
        readKeyFileData(filePaths[0]);
      });
    } else {
      readKeyFileData(filePath);
    }
  });
});

ipcMain.on('save-file-and-key-file', (event, files) => {
  const fileToSave = JSON.stringify(files.file);
  const keyFileToSave = JSON.stringify(files.keyFile);
  const keyFilePath = `${files.file.path}.key`;

  fs.writeFile(files.file.path, fileToSave, 'utf8', (err) => {
    if (err) throw err;

    fs.writeFile(keyFilePath, keyFileToSave, 'utf8', (err) => {
      if (err) throw err;
      event.sender.send('file-and-key-file-saved', {
        filePath: files.file.path,
        keyFilePath,
      });
    });
  });
});

ipcMain.on('crypt.exec-algorithm', (event, encryptionSettings) => {
  // const fileContent = file.content;

  console.log(encryptionSettings);

  connectedJavaSocket.emit('crypt.exec-algorithm', encryptionSettings);
  connectedJavaSocket.once('crypt.exec-algorithm', (obj) => {
    event.sender.send('crypt.exec-algorithm', obj);
  });
});

ipcMain.on('info.list-algorithms', (event) => {
  connectedJavaSocket.emit('info.list-algorithms', {});
  connectedJavaSocket.on('info.list-algorithms', (obj) => {
    console.log(obj);
    event.sender.send('info.list-algorithms', obj);
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
