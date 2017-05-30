<template>
  <textarea v-on:keyup="changeFile" v-bind:class="{ disabled: isFileSaving }" v-bind:disabled="fileSaving">
    {{ fileContent }}
  </textarea>
</template>

<script>
  export default {
    data() {
      return {
        fileSaving: false,
      };
    },
    methods: {
      changeFile() {
        this.$store.dispatch('changeFileContent', this.$el.value);
      },
    },
    computed: {
      fileContent() {
        return this.$store.state.currentFile.content;
      },
      isFileSaving() {
        return this.$store.state.isFileSaving;
      },
    },
  };
</script>

<style scoped>
  textarea {
    background: none;
    border: none;
    width: 100vw;
    height: 100vh;
    -webkit-appearance: none;
    display: block;
    padding-top: 40px;
    align-items: left;
    text-align: left;
    font-family: monospace;
    color: #000;
  }

  textarea.disabled {
    opacity: 0.2;
  }

  p { line-height: 24px; }
</style>
