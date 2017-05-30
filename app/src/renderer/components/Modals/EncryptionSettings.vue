<template>
  <div class="modal" v-show="showModal">
    <div class="modal-content">
      <div>
        <label for="enc.algorithm">Encryption Algorithm</label>
        <select name="enc.algorithm" v-model="encryptionSettings.algorithm" class="">
          <option value="DES" selected="selected">DES</option>
          <option value="AES">AES</option>
        </select>
      </div>
      <div>
        <label for="enc.blockmode">Blockmode</label>
        <select name="enc.blockmode" v-model="encryptionSettings.blockmode" class="">
          <option value="ECB" selected="selected">ECB</option>
          <option value="CBC">CBC</option>
        </select>
      </div>
      <div>
        <label for="enc.padding">Padding</label>
        <select name="enc.padding" v-model="encryptionSettings.padding" class="">
          <option value="NoPadding" selected="selected">No Padding</option>
          <option value="ZeroBytePadding">Zero-Byte Padding</option>
          <option value="PKCS7Padding">PKCS7Padding</option>
        </select>
      </div>
      <div>
        <button class="encrypt-file" v-on:click="encryptFile">Encrypt</button>
      </div>
    </div>
  </div>
</template>

<script>
  import fileService from '../../ste/file-service';

  export default {
    data() {
      return {
        encryptionSettings: {
          algorithm: 'DES',
          blockmode: 'ECB',
          padding: 'ZeroBytePadding',
        },
      };
    },
    computed: {
      showModal() {
        return this.$store.state.showEncryptionModal;
      },
    },
    methods: {
      encryptFile() {
        const savedPath = this.$store.state.currentFile.path;

        const algo = this.$data.encryptionSettings.algorithm;
        const block = this.$data.encryptionSettings.blockmode;
        const pad = this.$data.encryptionSettings.padding;
        const cipherSuiteString = `${algo}/${block}/${pad}`;

        const encSettings = {
          fileName: savedPath,
          cipherSuite: cipherSuiteString,
          key: '12345678',
          keySuite: this.$data.encryptionSettings.algorithm,
        };

        this.$store.dispatch('setFileIsSaving');

        fileService.encryptFile(this.$store.state.currentFile, encSettings)
        .then((encryptedFileContent) => {
          /* eslint-disable */
          debugger;
          /* eslint-enable */

          this.$store.dispatch('unsetFileIsSaving');
          this.$store.dispatch('setCurrentFile',
            { content: encryptedFileContent.secret, path: savedPath });

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
    height: 600px;
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
