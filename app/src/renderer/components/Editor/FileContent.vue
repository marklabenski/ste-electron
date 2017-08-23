<template>
  <textarea
    v-bind:class="{ disabled: isTextAreaDisabled }"
    v-bind:disabled="isTextAreaDisabled"
    v-model="fileContent"></textarea>
</template>

<script>
  import { mapGetters } from 'vuex';

  export default {
    methods: {
      changeFileContent() {
        /* eslint-disable */
        this.$store.dispatch('changeFileContent', this.$el.value);
        /* eslint-enable */
      },
    },
    computed: {
      isTextAreaDisabled() {
        return (this.isFileSaving || this.isFileEncrypted)
          && this.$store.state.currentFile.type !== 'new';
      },
      fileContent: {
        get() {
          return this.$store.state.currentFile.content;
        },
        set(value) {
          this.$store.commit('changeFileContent', value);
        },
      },
      ...mapGetters([
        'isFileSaving',
        'isFileEncrypted',
      ]),
    },
  };
</script>

<style scoped>
  textarea {
    background: none;
    z-index: 10;
    border: none;
    width: 100vw;
    height: 100vh;
    -webkit-appearance: none;
    display: block;
    align-items: left;
    text-align: left;
    font-family: monospace;
    font-size: 14px;
    color: #000;
    padding: 46px 6px 6px 6px;
  }

  textarea.disabled {
    opacity: 0.2;
  }

  p { line-height: 24px; }
</style>
