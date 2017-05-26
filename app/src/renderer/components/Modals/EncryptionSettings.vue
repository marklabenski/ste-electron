<template>
  <div class="modal">
    <form class="modal-content">
      <div>
        <label for="enc.algorithm">Encryption Algorithm</label>
        <select name="enc.algorithm" v-model="encryptionSettings.algorithm" class="">
          <option value="DES" selected>DES</option>
          <option value="AES">AES</option>
        </select>
      </div>
      <div>
        <label for="enc.blockmode">Blockmode</label>
        <select name="enc.blockmode" v-model="encryptionSettings.blockmode" class="">
          <option value="ECB" selected>ECB</option>
        </select>
      </div>
      <div>
        <label for="enc.padding">Padding</label>
        <select name="enc.padding" v-model="encryptionSettings.padding" class="">
          <option value="NoPadding" selected>No Padding</option>
          <option value="ZeroBytePadding">Zero-Byte Padding</option>
        </select>
      </div>
      <div>
        <button class="encrypt-file" v-on:click="encryptFile($store, encryptionSettings)">Encrypt</button>
      </div>
    </form>
  </div>
</template>

<script>
  import fileService from '../../ste/file-service';

  export default {
    data() {
      return {
        encryptionSettings: {
          algorithm: '',
          blockmode: '',
          padding: '',
        },
      };
    },
    methods: {
      encryptFile: (store) => {
        store.dispatch('setFileIsSaving');
        const savedPath = store.state.currentFile.path;
        fileService.encryptFile(store.state.currentFile).then((encryptedFileContent) => {
          store.dispatch('unsetFileIsSaving');
          store.dispatch('setCurrentFile', { content: encryptedFileContent.secret, path: savedPath });
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
    top: 0;

    display: flex;
    justify-content: center;
    align-items: center;
    align-content: center;

    background: rgba(255, 255, 255, 0.6);
  }

  .modal-content {
    display: block;

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
