<template>
  <div class="modal" v-show="showModal">
    <button class="close" v-on:click="closeModal">x</button>
    <div class="modal-content">
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
          <option value="ECB" selected="selected">ECB</option>
          <option value="CTS">CTS</option>
          <option value="CBC">CBC</option>
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
        <label for="enc.key">Key</label>
        <input name="enc.padding" pattern=".{8,}" required type="text" v-on:input="checkKeyLength" v-model="encryptionSettings.key">
      </div>
      <div>
        <div class="hint" v-show="!isKeyLengthOk">
          Wrong key length for the current encryption algorithm!
        </div>
        <div class="hint" v-show="!isContentLengthSupportedForAlgorithm">
          Wrong block size to support no padding!
        </div>
        <button
          class="encrypt-file"
          v-bind:disabled="!isKeyLengthOk || !isContentLengthSupportedForAlgorithm"
          v-on:click="encryptFile">
          Encrypt
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  const lengthInUtf8Bytes = (str) => {
    // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
    const m = encodeURIComponent(str).match(/%[89ABab]/g);
    return str.length + (m ? m.length : 0);
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
          blockmode: 'ECB',
          padding: 'ZeroBytePadding',
          key: '',
        },
        isKeyLengthOk: false,
        isContentLengthSupportedForAlgorithm: true,
      };
    },
    computed: {
      showModal() {
        return this.$store.state.showEncryptionModal;
      },
    },
    methods: {
      closeModal() {
        this.$store.dispatch('setShowEncryptionModal', false);
      },
      checkFileContentLength() {
        const allowedBlockSize = getAllowedBlockSizeForAlgorithm(
          this.$data.encryptionSettings.algorithm
        );
        const fileContentLength = lengthInUtf8Bytes(this.$store.state.currentFile.content.toString());
        const isContentLengthSupported = fileContentLength % allowedBlockSize === 0;
        const isPaddingOff = this.$data.encryptionSettings.padding === 'NoPadding';

        if (!isContentLengthSupported && isPaddingOff) {
          this.isContentLengthSupportedForAlgorithm = false;
        }
      },
      checkKeyLength() {
        const allowedKeyLengths = getAllowedKeyLengthsForAlgorithm(
          this.$data.encryptionSettings.algorithm
        );
        this.$data.isKeyLengthOk = allowedKeyLengths.reduce((acc, allowedLength) => {
          const currentKeyLength = lengthInUtf8Bytes(this.$data.encryptionSettings.key);
          return acc || currentKeyLength === allowedLength;
        }, false);
      },
      encryptFile() {
        const savedPath = this.$store.state.currentFile.path;

        const algo = this.$data.encryptionSettings.algorithm;
        const block = this.$data.encryptionSettings.blockmode;
        const pad = this.$data.encryptionSettings.padding;
        const cipherSuiteString = `${algo}/${block}/${pad}`;

        const encSettings = {
          fileName: savedPath,
          cipherSuite: cipherSuiteString,
          key: this.$data.encryptionSettings.key,
          keySuite: this.$data.encryptionSettings.algorithm,
        };

        this.$store.dispatch('setFileIsSaving');

        this.$fileService.encryptFile(this.$store.state.currentFile, encSettings)
        .then((encryptedFileContent) => {
          this.$store.dispatch('unsetFileIsSaving');
          this.$store.dispatch('setCurrentFile', {
            content: encryptedFileContent.secret,
            path: savedPath,
            type: 'encrypted',
            encryptionSettings: encSettings,
          });

          this.$store.dispatch('setShowEncryptionModal', false);
        });
      },
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
