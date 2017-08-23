<template>
  <div class="modal" v-show="showModal">
    <button class="close" v-on:click="closeModal">x</button>
    <div class="modal-content">
      <div class="input-group">
        <label for="enc.type">Encryption Type</label>
        <select name="enc.type" v-model="encType" class="">
          <option value="symmetric" selected="selected">Symmetric</option>
          <option value="pbe">Password based</option>
          <option value="asymmetric">Asymmetric</option>
        </select>
      </div>
      <div v-show="encType === 'pbe'">
        <div class="input-group">
          <label for="enc.pbealgorithm">Algorithm</label>
          <select name="enc.pbealgorithm" v-model="encryptionSettings.pbeAlgorithm" class="">
            <option value="PBEWithSHA1And128BitAES_CBC_BC" selected="selected">PBEWithSHAAnd128BitAES_CBC_BC</option>
            <option value="PBEWithMD5AndDES">PBEWithMD5AndDES</option>
            <option value="PBEWithSHAAnd40BitRC4">PBEWithSHAAnd40BitRC4</option>
          </select>
        </div>
        <div class="input-group">
          <label for="enc.password">Password</label>
          <input name="end.password" type="password" v-model="encryptionSettings.password">
        </div>
        <div class="input-group">
          <label for="enc.iterations">Iterations</label>
          <input name="end.iterations" type="number" v-model="encryptionSettings.iterationCount">
        </div>
      </div>
      <div v-show="encType === 'asymmetric'">
        <div class="input-group">
          <label for="enc.asymAlgorithm">Algorithm</label>
          <select name="enc.asymAlgorithm" v-model="encryptionSettings.asymAlgorithm" class="">
            <option value="RSA" selected="selected">RSA</option>
          </select>
        </div>
        <div class="input-group">
          <label for="enc.publickey">Public Key</label>
          <textarea name="enc.publickey" v-model="encryptionSettings.publicKey" class=""></textarea>
        </div>
      </div>
      <div v-show="encType === 'symmetric'">
        <div class="input-group">
          <label for="enc.algorithm">Encryption Algorithm</label>
          <select name="enc.algorithm" v-model="encryptionSettings.algorithm" v-on:change="checkKeyLength" class="">
            <option value="DES" selected="selected">DES</option>
            <option value="AES">AES</option>
          </select>
        </div>
        <div class="input-group">
          <label for="enc.blockmode">Blockmode</label>
          <select name="enc.blockmode" v-model="encryptionSettings.blockmode" class="">
            <option
              v-for="(blockMode, index) in getAllowedBlockModes"
              :value="blockMode">{{ blockMode }}</option>
          </select>
        </div>
        <div class="input-group">
          <label for="enc.padding">Padding</label>
          <select name="enc.padding" v-model="encryptionSettings.padding" v-on:change="checkFileContentLength" class="">
            <option value="NoPadding" selected="selected">No Padding</option>
            <option value="ZeroBytePadding">Zero-Byte Padding</option>
            <option value="PKCS7Padding">PKCS7Padding</option>
          </select>
        </div>
        <div class="input-group">
          <label for="enc.keylength">Key Length</label>
          <select name="enc.keylength" v-model="encryptionSettings.keyLength" class="">
            <option
              v-for="(keyLength, index) in getAllowedKeyLengths"
              :value="keyLength * 8">{{ keyLength * 8 }} bit</option>
          </select>
        </div>
        <div class="input-group">
          <label for="enc.separateFile">Store key in seperate file next to the encrypted file?</label>
          <input type="checkbox" name="enc.seperateFile" v-model="generalSettings.keyFile"></checkbox>
        </div>
      </div>
      <div class="input-group">
        <label for="enc.hash">Hash mode for content approval</label>
        <select name="enc.hash" v-model="encryptionSettings.hash" class="">
          <option value="MD5">MD5</option>
          <option value="SHA1">SHA-1</option>
          <option value="SHA224">SHA-224</option>
          <option value="SHA256" selected="selected">SHA-256</option>
          <option value="SHA384">SHA-384</option>
          <option value="SHA512">SHA-512</option>
        </select>
      </div>

      <div>
        <div class="hint" v-show="!isContentLengthSupportedForAlgorithm">
          Wrong block size to support no padding!
        </div>
        <button
          class="encrypt-file"
          v-bind:disabled="!isContentLengthSupportedForAlgorithm"
          v-on:click="encryptFile">
          Encrypt
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapActions } from 'vuex';

  const lengthInUtf8Bytes = (str) => {
    // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
    const m = encodeURIComponent(str).match(/%[89ABab]/g);
    return str.length + (m ? m.length : 0);
  };

  const getAllowedBlockmodesForAlgorithm = (algorithm) => {
    const allowedBlockModes = [];
    if (algorithm === 'DES') {
      allowedBlockModes.push('ECB');
      allowedBlockModes.push('CBC');
      allowedBlockModes.push('OFB');
      allowedBlockModes.push('CTS');
    } else if (algorithm === 'AES') {
      allowedBlockModes.push('ECB');
      allowedBlockModes.push('CBC');
      allowedBlockModes.push('OFB');
      allowedBlockModes.push('CTS');
      allowedBlockModes.push('GCM');
    }
    return allowedBlockModes;
  };

  const getAllowedKeyLengthsForAlgorithm = (algorithm) => {
    let allowedLengths = [];
    if (algorithm === 'DES') {
      allowedLengths = [8];
    } else if (algorithm === 'AES') {
      allowedLengths = [16, 24, 32];
    }
    return allowedLengths;
  };

  const getAllowedBlockSizeForAlgorithm = (algorithm) => {
    let allowedBlockSize = 0;
    if (algorithm === 'DES') {
      allowedBlockSize = 8;
    } else if (algorithm === 'AES') {
      allowedBlockSize = 16;
    }
    return allowedBlockSize;
  };

  export default {
    data() {
      return {
        encryptionSettings: {
          algorithm: 'DES',
          pbeAlgorithm: 'PBEWithSHA1And128BitAES_CBC_BC',
          asymAlgorithm: 'RSA',
          blockmode: 'ECB',
          padding: 'ZeroBytePadding',
          keyLength: '64',
          hash: 'SHA256',
          password: '',
          iterationCount: 1024,
          publicKey: '',
        },
        encType: 'symmetric',
        generalSettings: {
          keyFile: true,
        },
        isContentLengthSupportedForAlgorithm: true,
      };
    },
    computed: {
      showModal() {
        return this.$store.state.showEncryptionModal;
      },
      getAllowedKeyLengths() {
        return getAllowedKeyLengthsForAlgorithm(this.$data.encryptionSettings.algorithm);
      },
      getAllowedBlockModes() {
        return getAllowedBlockmodesForAlgorithm(this.$data.encryptionSettings.algorithm);
      },
    },
    methods: {
      closeModal() {
        this.$store.dispatch('setShowEncryptionModal', false);
      },
      checkFileContentLength() {
        const allowedBlockSize = getAllowedBlockSizeForAlgorithm(
          this.$data.encryptionSettings.algorithm,
        );
        const fileContentLength = lengthInUtf8Bytes(this.$store.state.currentFile.content.toString());
        const isContentLengthSupported = fileContentLength % allowedBlockSize === 0;
        const isPaddingOff = this.$data.encryptionSettings.padding === 'NoPadding';

        if (!isContentLengthSupported && isPaddingOff) {
          this.isContentLengthSupportedForAlgorithm = false;
        } else {
          this.isContentLengthSupportedForAlgorithm = true;
        }
      },
      checkKeyLength() {
        const allowedKeyLengths = getAllowedKeyLengthsForAlgorithm(
          this.$data.encryptionSettings.algorithm,
        );
        this.$data.encryptionSettings.keyLength = allowedKeyLengths[0] * 8;
      },
      encryptFile() {
        const savedPath = this.$store.state.currentFile.path;

        const algo = this.$data.encryptionSettings.algorithm;
        const pbeAlgo = this.$data.encryptionSettings.pbeAlgorithm;
        const asymAlgo = this.$data.encryptionSettings.asymAlgorithm;

        const block = this.$data.encryptionSettings.blockmode;
        const pad = this.$data.encryptionSettings.padding;
        const password = this.$data.encryptionSettings.password;
        const publicKey = this.$data.encryptionSettings.publicKey;

        const encSettings = {
          fileName: savedPath,
          method: 'encrypt',

        };
        if (this.$data.encType === 'symmetric') {
          encSettings.algorithm = algo;
          encSettings.options = {
            keyLength: this.$data.encryptionSettings.keyLength.toString(),
            padding: pad,
            blockMode: block,
          };
        } else if (this.$data.encType === 'pbe') {
          encSettings.algorithm = pbeAlgo;
          encSettings.options = {
            password,
            salt: 'STEsecretSALT',
            iterationCount: this.$data.encryptionSettings.iterationCount.toString(),
          };
        } else if (this.$data.encType === 'asymmetric') {
          encSettings.algorithm = asymAlgo;
          encSettings.options = {
            publicKey,
          };
        }

        const hashAlgo = this.$data.encryptionSettings.hash;
        const hashOptions = {
          algorithm: hashAlgo,
          method: 'hash',
          options: {
            iterationCount: '1',
          },
        };

        if (/^(SHA2)|(SHA5)/g.test(hashAlgo)) {
          hashOptions.algorithm = 'SHA2';
          hashOptions.options.hashLength = hashAlgo.substr(3, 3);
        }

        this.$store.dispatch('setFileIsSaving');

        this.$fileService.encryptFile(this.$store.state.currentFile, encSettings, hashOptions)
        .then((encryptedFileContent) => {
          this.$store.dispatch('unsetFileIsSaving');

          if (hashOptions.parameters) delete hashOptions.parameters;
          if (encryptedFileContent.settings.password) delete encryptedFileContent.settings.password;
          if (encryptedFileContent.settings.salt) delete encryptedFileContent.settings.salt;
          this.$store.dispatch('setCurrentFile', {
            content: encryptedFileContent.return,
            path: savedPath,
            type: 'encrypted',
            algorithm: encSettings.algorithm,
            encryptionSettings: encryptedFileContent.settings,
            hashOptions,
          });

          this.$store.dispatch('setShowEncryptionModal', false);
        });
      },
      ...mapActions([
        'isFileSaving',
        'isFileEncrypted',
      ]),
    },
  };
</script>

<style scoped>
  div.modal {
    position: fixed;
    width: 100vw;
    height: 100vh;

    z-index: 1000;

    left: 0;

    display: flex;
    justify-content: center;
    align-items: center;
    align-content: center;

    background: rgba(255, 255, 255, 0.6);
  }

  .modal-content {
    display: block;
    top: 200px;
    padding: 30px;
    position:absolute;

    width: 400px;
    height: auto;

    background: radial-gradient(
      ellipse at center,
      rgba(255, 255, 255, 1) 0%,
      rgba(229, 229, 229, .85) 100%
    );

    text-align: left;
  }

  .input-group {
    display: flex;
    justify-content: space-between;

    padding: 3px;
  }

  .close {
    position: absolute;
    display: block;

    top: 174px;
    margin-left: -215px;
    width: 28px;
    padding: 0;
    height: 25px;
  }

  .hint {
    padding: 5px;
    margin: 2px;
    border: 1px solid red;
  }

  button {
    width: auto;
    text-transform: uppercase;
    display: inline-block;
    padding-left: 20px;
    padding-right: 20px;
    height: 100%;
  }
</style>
