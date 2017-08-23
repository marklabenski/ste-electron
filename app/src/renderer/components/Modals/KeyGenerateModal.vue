<template>
  <div class="modal" v-show="showModal">
    <button class="close" v-on:click="closeModal">x</button>
    <div class="modal-content">
      Generate RSA keypair
      <div class="input-group">
        <label for="enc.keylength">Key Length</label>
        <select name="enc.keylength" v-model="keyLength" class="">
          <option value="1024" selected="selected">1024</option>
          <option value="4096">4096</option>
        </select>
      </div>
      <div>
        <button
          class="generate-keys"
          v-on:click="generateKeys">
          Generate Keys
        </button>
      </div>
      <div v-show="keysGenerated">
        <div class="input-group">
          <label for="enc.publickey">Public Key</label>
          <textarea name="enc.publickey" v-model="publicKey" :disabled="publicKey === ''"></textarea>
        </div>
        <div class="input-group">
          <label for="enc.privkey">Private Key</label>
          <textarea name="enc.privkey" v-model="privateKey" :disabled="privateKey === ''"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapActions } from 'vuex';

  export default {
    data() {
      return {
        publicKey: '',
        privateKey: '',
        keysGenerated: false,
        keyLength: '1024',
      };
    },
    computed: {
      showModal() {
        return this.$store.state.showKeyGenerateModal;
      },
    },
    methods: {
      closeModal() {
        this.setShowKeyGenerateModal(false);
        // this.$store.dispatch('setShowDecryptionModal', false);
      },
      generateKeys() {
        this.$fileService.generateKeys('RSAKeyPair', this.$data.keyLength)
        .then((generatedKeys) => {
          // generated
          const keyPair = generatedKeys.split('|');
          this.publicKey = keyPair[0];
          this.privateKey = keyPair[1];
          this.keysGenerated = true;
        });
      },
      ...mapActions([
        'setShowKeyGenerateModal',
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
