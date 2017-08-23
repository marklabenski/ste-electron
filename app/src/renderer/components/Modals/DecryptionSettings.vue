<template>
  <div class="modal" v-show="showModal">
    <button class="close" v-on:click="closeModal">x</button>
    <div class="modal-content">
      <div class="input-group" v-show="showPasswordField">
        <label for="enc.key">Password</label>
        <input name="enc.padding" required type="password" v-model="secretKey">
      </div>
      <div class="input-group" v-show="showPrivateKeyField">
        <label for="enc.privkey">Private Key</label>
        <textarea name="enc.privkey" required v-model="privateKey"></textarea>
      </div>
      <div>
        <div class="hint" v-show="wrongKey">
          Wrong password!
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
  import { mapActions } from 'vuex';

  export default {
    data() {
      return {
        secretKey: '',
        wrongKey: false,
        isPbe: false,
        isRsa: false,
        privateKey: '',
      };
    },
    computed: {
      showPrivateKeyField() {
        if (/^RSA/g.test(this.$store.state.currentFile.algorithm)) {
          this.$data.isRsa = true;
        } else {
          this.$data.isRsa = false;
        }

        return this.$data.isRsa;
      },
      showPasswordField() {
        if (/^PBE/g.test(this.$store.state.currentFile.algorithm)) {
          this.$data.isPbe = true;
        } else {
          this.$data.isPbe = false;
        }

        return this.$data.isPbe;
      },
      showModal() {
        return this.$store.state.showDecryptionModal;
      },
    },
    methods: {
      closeModal() {
        this.setShowDecryptionModal(false);
        // this.$store.dispatch('setShowDecryptionModal', false);
      },
      decryptFile() {
        const encSettings = this.$store.state.currentFile.encryptionSettings;
        const algo = this.$store.state.currentFile.algorithm;

        const encOptions = {
          // fileName: savedPath,
          method: 'decrypt',
          algorithm: algo,
        };

        if (/^PBE/g.test(algo)) {
          encOptions.options = {
            password: this.$data.secretKey,
            salt: 'STEsecretSALT',
            iterationCount: encSettings.iterationCount,
          };
        } else if (/^RSA/g.test(algo)) {
          encOptions.options = {
            privateKey: this.$data.privateKey,
          };
        } else {
          encOptions.options = {
            key: encSettings.key,
            keyLength: encSettings.keyLength,
            padding: encSettings.padding,
            blockMode: encSettings.blockMode,
          };
        }

        const hashOptions = this.$store.state.currentFile.hashOptions;

        this.setFileIsSaving();

        this.$fileService.decryptFile(
          this.$store.state.currentFile,
          encOptions,
          hashOptions)
        .then((decryptedFile) => {
          this.unsetFileIsSaving();
          this.setCurrentFile({
            content: decryptedFile.content,
            type: 'plain',
            path: decryptedFile.path,
          });
          // this.$store.dispatch('setCurrentFile', );
          this.setShowDecryptionModal();
          // this.$store.dispatch('setShowDecryptionModal', false);
        })
        .catch(() => {
          this.$data.wrongKey = true;
        });
      },
      ...mapActions([
        'isFileSaving',
        'setCurrentFile',
        'setShowDecryptionModal',
        'setFileIsSaving',
        'unsetFileIsSaving',
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
