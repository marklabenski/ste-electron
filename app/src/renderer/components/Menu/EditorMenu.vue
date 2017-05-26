<template>
  <nav>
    {{ $currentFile }}
    <button class="open-file" v-on:click="openFile($store)">Open</button>
    <button class="save-file" v-on:click="saveFile($store)">Save</button>
    <button class="encrypt-file" v-on:click="encryptFile($store)">Encrypt</button>
    <button class="decrypt-file" v-on:click="decryptFile($store)">Decrypt</button>
  </nav>
</template>

<script>
  import fileService from '../../ste/file-service';

  export default {
    methods: {
      openFile: (store) => {
        const updateStore = (file) => {
          store.dispatch('setCurrentFile', file);
        };

        fileService.fileDialog.open().then((file) => {
          updateStore(file);
        });
      },
      saveFile: (store) => {
        store.dispatch('setFileIsSaving');
        fileService.saveFile(store.state.currentFile).then((file) => {
          store.dispatch('unsetFileIsSaving');
          console.log('yay ', file, store);
        });
      },
      encryptFile: (store) => {
        store.dispatch('setFileIsSaving');
        const savedPath = store.state.currentFile.path;
        fileService.encryptFile(store.state.currentFile).then((encryptedFileContent) => {
          store.dispatch('unsetFileIsSaving');
          store.dispatch('setCurrentFile', { content: encryptedFileContent.secret, path: savedPath });
        });
      },
      decryptFile: (store) => {
        store.dispatch('setFileIsSaving');
        const savedPath = store.state.currentFile.path;
        fileService.decryptFile(store.state.currentFile).then((decryptedFileContent) => {
          store.dispatch('unsetFileIsSaving');
          store.dispatch('setCurrentFile', {
            content: decryptedFileContent.fileContent,
            path: savedPath,
          });
        });
      },
    },
  };
</script>

<style scoped>
  nav {
    width: 100vw;
    height: 40px;
    background: radial-gradient(
      ellipse at center,
      rgba(255, 255, 255, 1) 0%,
      rgba(229, 229, 229, .85) 100%
    );
    border-bottom: 2px solid rgba(20, 40, 20, 0.6);
    display: flex;
    position: fixed;
    left: 0;
    top: 0;
    align-items: left;
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
