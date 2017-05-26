<template>
  <div class="editor-window">
    <editor-menu></editor-menu>
    <file-content></file-content>
    <encryption-settings></encryption-settings>
  </div>
</template>

<script>
  import FileContent from './Editor/FileContent';
  import EditorMenu from './Menu/EditorMenu';
  import EncryptionSettings from './Modals/EncryptionSettings';
  export default {
    components: {
      EditorMenu,
      FileContent,
      EncryptionSettings,
    },
    name: 'editor',
  };
</script>

<style scoped>
  .editor-window {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: left;
    justify-content: center;
    text-align: center;
  }

  img {
    margin-top: -25px;
    width: 450px;
  }
</style>
