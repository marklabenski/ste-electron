<template>
  <div class="modal" v-show="showModal">
    <button class="close" v-on:click="closeModal">x</button>
    <div class="modal-content">
      <div class="input-group">
        <label for="enc.key">Key</label>
        <input name="enc.padding" pattern=".{8,}" required type="text" v-model="secretKey">
      </div>
      <div>
        <div class="hint" v-show="wrongKey">
          Wrong key!
        </div>
        <button
          class="decrypt-file"
          v-on:click="decryptFile">
          Decrypt
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        secretKey: '',
        wrongKey: false,
      };
    },
    computed: {
      showModal() {
        return this.$store.state.showDecryptionModal;
      },
    },
    methods: {
      closeModal() {
        this.$store.dispatch('setShowDecryptionModal', false);
      },
      decryptFile() {
        const encSettings = this.$store.state.currentFile.encryptionSettings;
        encSettings.key = this.$data.secretKey;

        this.$store.dispatch('setFileIsSaving');

        this.$fileService.decryptFile(
          this.$store.state.currentFile,
          encSettings)
        .then((decryptedFile) => {
          this.$store.dispatch('unsetFileIsSaving');
          this.$store.dispatch('setCurrentFile', {
            content: decryptedFile.content,
            type: 'plain',
            path: decryptedFile.path,
          });

          this.$store.dispatch('setShowDecryptionModal', false);
        })
        .catch(() => {
          this.$data.wrongKey = true;
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
