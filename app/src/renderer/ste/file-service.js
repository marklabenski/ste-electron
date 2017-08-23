import { Base64 } from 'js-base64';

import { ipcRenderer } from 'electron';

const getHashLengthInHex = (hashOptions) => {
  let hashLength = 0;
  if (hashOptions.algorithm === 'MD5') {
    hashLength = 32;
  } else if (hashOptions.algorithm === 'SHA1') {
    hashLength = 40;
  } else if (hashOptions.algorithm === 'SHA2') {
    hashLength = hashOptions.options.hashLength / 4;
  }
  return hashLength;
};

const fileService = {
  saveFile: (file) => {
    console.log(file);
    return new Promise((resolve) => {
      if (file.type === 'encrypted'
        && !/^(PBE)|(RSA)!/.test(file.algorithm)) {
        const encryptionKeyFile = {
          key: file.encryptionSettings.key,
          keySuite: file.encryptionSettings.keySuite,
        };
        // remove key from file
        delete file.encryptionSettings.key;
        ipcRenderer.send('save-file-and-key-file', {
          file,
          keyFile: encryptionKeyFile,
        });
        ipcRenderer.once('file-and-key-file-saved', (event, filePath) => {
          resolve(filePath);
        });
      } else {
        ipcRenderer.send('save-file', file);
        ipcRenderer.once('file-saved', (event, filePath) => {
          resolve(filePath);
        });
      }
    });
  },
  generateKeys: (algorithm, keyLength) => new Promise((resolve) => {
    const methodSettings = {
      algorithm,
      method: 'generateKeyPair',
      options: {
        keyLength: keyLength.toString(),
      },
    };
    ipcRenderer.send('crypt.exec-algorithm', methodSettings);
    ipcRenderer.once('crypt.exec-algorithm', (event, obj) => resolve(obj.return));
  }),
  encryptFile: (file, encryptionSettings, hashOptions) => {
    console.log(file);

    return new Promise((resolve) => {
      console.log(encryptionSettings);
      hashOptions.parameters = [
        { input: file.content },
      ];
      ipcRenderer.send('crypt.exec-algorithm', hashOptions);
      ipcRenderer.once('crypt.exec-algorithm', (event, obj) => {
        const hashValue = Base64.decode(obj.return);
        encryptionSettings.parameters = [
          { plainText: file.content + hashValue },
        ];
        if (encryptionSettings.options.password) {
          encryptionSettings.options.password = Base64.encode(encryptionSettings.options.password);
        }

        ipcRenderer.send('crypt.exec-algorithm', encryptionSettings);
        ipcRenderer.once('crypt.exec-algorithm', (event, obj) => resolve(obj));
      });
    });
  },
  decryptFile: (file, encOptions, hashOptions) => {
    const decryptFile = function encryptFile(resolveFn, rejectFn, keyFile) {
      if (keyFile) {
        encOptions.options.key = keyFile.key;
      }
      // cryptOptions.options = file.encryptionSettings.settings;
      encOptions.method = 'decrypt';
      encOptions.parameters = [
          { cipherText: file.content },
      ];
      if (encOptions.options.password) {
        encOptions.options.password = Base64.encode(encOptions.options.password);
      }
      console.log(encOptions);

      ipcRenderer.send('crypt.exec-algorithm', encOptions);
      ipcRenderer.once('crypt.exec-algorithm', (event, obj) => {
        console.log(Date.now(), 'first', obj);
        const plainTextPlusHash = obj.return;
        const hashLength = getHashLengthInHex(hashOptions);

        if (!obj.return) {
          rejectFn('error decrypting content');
        }

        const plainText = plainTextPlusHash
          .substr(0, plainTextPlusHash.length - hashLength);
        const decryptedHashValue = plainTextPlusHash
          .substr(plainTextPlusHash.length - hashLength, hashLength);

        hashOptions.parameters = [
          { input: plainText },
        ];

        ipcRenderer.send('crypt.exec-algorithm', hashOptions);
        ipcRenderer.once('crypt.exec-algorithm', (event, hashObj) => {
          console.log(Date.now(), 'second', hashObj);

          const calculatedHashValue = Base64.decode(hashObj.return);
          if (decryptedHashValue === calculatedHashValue) {
            file.content = plainText;
            resolveFn(file);
          } else {
            rejectFn('plainText corrupted or decryption failed');
          }
        });
      });

      ipcRenderer.once('wrong-key', (event, obj) => {
        rejectFn();
        console.log(event, obj);
      });
    };

    return new Promise((resolve, reject) => {
      if (/^DES|^AES/g.test(encOptions.algorithm)
        && !encOptions.options.key) {
        const keyFilePath = `${file.path}.key`;
        ipcRenderer.send('open-key-file', keyFilePath);
        ipcRenderer.once('key-file-opened', (event, keyFile) => {
          decryptFile(resolve, reject, keyFile);
        });
        ipcRenderer.once('key-file-not-selected', () => {
          reject();
        });
      } else {
        decryptFile(resolve, reject);
      }
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
