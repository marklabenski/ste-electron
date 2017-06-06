<template>
  <nav>
    <button class="new-file" v-bind:disabled="isNewButtonDisabled" v-on:click="newFile">New</button>
    <button class="open-file" v-bind:disabled="isNewButtonDisabled" v-on:click="openFile">Open</button>
    <button class="save-file" v-on:click="saveFile">Save</button>
    <button class="encrypt-file" v-bind:disabled="isFileEmpty || isFileEncrypted" v-on:click="encryptFile">Encrypt</button>
    <button class="decrypt-file" v-bind:disabled="!isFileEncrypted" v-on:click="decryptFile">Decrypt</button>
  </nav>
</template>

<script>
  export default {
    computed: {
      isFileEncrypted() {
        return this.$store.state.currentFile.type === 'encrypted';
      },
      isFileEmpty() {
        return this.$store.state.currentFile.content === '';
      },
      isNewButtonDisabled() {
        return this.$store.state.isFileDirty;
      },
    },
    methods: {
      newFile() {
        this.$store.dispatch('setCurrentFile', {
          content: '',
          type: 'new',
        });
      },
      openFile() {
        this.$root.$fileService.fileDialog.open()
        .then((file) => {
          let currentFile = {
            ...file,
            type: 'plain',
          };
          if (file.type === 'encrypted') {
            currentFile = file;
          }
          this.$store.dispatch('setCurrentFile', currentFile);
        })
        .catch(() => {
          // file open dialog was canceled
        });
      },
      saveFile() {
        this.$store.dispatch('setFileIsSaving');
        this.$fileService.saveFile(this.$store.state.currentFile).then(() => {
          this.$store.dispatch('unsetFileIsSaving');
          this.$store.dispatch('setFileDirty', false);
        });
      },
      encryptFile() {
        this.$store.dispatch('setShowEncryptionModal', true);
      },
      decryptFile() {
        this.$store.dispatch('setShowDecryptionModal', true);
        // const savedPath = this.$store.state.currentFile.path;
        // this.$fileService.decryptFile(this.$store.state.currentFile)
        // .then((decryptedFileContent) => {
        //   this.$store.dispatch('unsetFileIsSaving');
        //   this.$store.dispatch('setCurrentFile', {
        //     content: decryptedFileContent.fileContent,
        //     path: savedPath,
        //     type: 'plain',
        //   });
        // });
      },
    },
  };
</script>

<style scoped>
  nav {
    width: 100vw;
    height: 40px;
    z-index: 100;

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
