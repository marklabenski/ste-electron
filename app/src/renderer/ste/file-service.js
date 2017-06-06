import { ipcRenderer } from 'electron';

const fileService = {
  saveFile: (file) => {
    console.log(file);
    return new Promise((resolve) => {
      ipcRenderer.send('save-file', file);
      ipcRenderer.on('file-saved', (event, filePath) => {
        resolve(filePath);
        console.log(event, file);
      });
    });
  },
  encryptFile: (file, encryptionSettings) => {
    console.log(file);
    return new Promise((resolve) => {
      ipcRenderer.send('encrypt-file', { file, encryptionSettings });
      ipcRenderer.on('file-encrypted', (event, obj) => {
        resolve(obj);
        console.log(event, obj);
      });
    });
  },
  decryptFile: (file) => {
    console.log(file);
    return new Promise((resolve) => {
      ipcRenderer.send('decrypt-file', file);
      ipcRenderer.on('file-decrypted', (event, obj) => {
        resolve(obj);
        console.log(event, obj);
      });
    });
  },
  fileDialog: {
    open: () => {
      console.log('send stuff');
      return new Promise((resolve) => {
        ipcRenderer.send('file-open-dialog');
        ipcRenderer.on('file-dialog-opened', (event, file) => {
          resolve(file);
          console.log(event, file);
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
