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

ipcMain.on('encrypt-file', (event, { file, encryptionSettings }) => {
  const fileContent = file.content;

  connectedJavaSocket.emit('file.encrypt', {
    encryptionSettings,
    fileContent,
  });
  connectedJavaSocket.on('file.encrypted', (obj) => {
    event.sender.send('file-encrypted', obj);
  });
});


ipcMain.on('decrypt-file', (event, file) => {
  const secret = file.content;
  connectedJavaSocket.emit('file.decrypt', {
    encryptionSettings: file.encryptionSettings,
    secret,
  });
  connectedJavaSocket.on('file.decrypted', (obj) => {
    event.sender.send('file-decrypted', obj);
  });
  connectedJavaSocket.on('wrong-key', (obj) => {
    event.sender.send('wrong-key', obj);
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
