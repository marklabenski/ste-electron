import { ipcRenderer } from 'electron';

const fileService = {
  saveFile: (file) => {
    console.log(file);
    return new Promise((resolve) => {
      ipcRenderer.send('save-file', file);

      ipcRenderer.once('file-saved', (event, filePath) => {
        resolve(filePath);
      });
    });
  },
  encryptFile: (file, encryptionSettings) => {
    console.log(file);
    return new Promise((resolve) => {
      ipcRenderer.send('encrypt-file', { file, encryptionSettings });
      ipcRenderer.once('file-encrypted', (event, obj) => {
        resolve(obj);
        console.log(event, obj);
      });
    });
  },
  decryptFile: (file) => {
    console.log(file);
    return new Promise((resolve, reject) => {
      ipcRenderer.send('decrypt-file', file);
      ipcRenderer.once('file-decrypted', (event, obj) => {
        file.content = obj.fileContent;
        resolve(file);
        console.log(event, obj);
      });
      ipcRenderer.once('wrong-key', (event, obj) => {
        reject();
        console.log(event, obj);
      });
    });
  },
  fileDialog: {
    open: () => {
      console.log('send stuff');
      return new Promise((resolve, reject) => {
        ipcRenderer.send('file-open-dialog');
        ipcRenderer.once('file-dialog-canceled', () => {
          reject('canceled');
          ipcRenderer.removeAllListeners('file-opened');
          ipcRenderer.removeAllListeners('encrypted-file-opened');
        });
        ipcRenderer.once('file-opened', (event, file) => {
          resolve(file);
          ipcRenderer.removeAllListeners('file-dialog-canceled');
          ipcRenderer.removeAllListeners('encrypted-file-opened');
        });
        ipcRenderer.once('encrypted-file-opened', (event, file) => {
          resolve(file);
          ipcRenderer.removeAllListeners('file-dialog-canceled');
          ipcRenderer.removeAllListeners('file-opened');
        });
      });
    },
  },
};
export default {
  install(Vue) {
    Vue.prototype.$fileService = fileService;
  },
};
