<template>
  <div>
    <editor-menu></editor-menu>
    <file-content></file-content>
  </div>
</template>

<script>
  import FileContent from './Editor/FileContent';
  import EditorMenu from './Menu/EditorMenu';
  export default {
    components: {
      EditorMenu,
      FileContent,
    },
    name: 'editor',
  };
</script>

<style scoped>
  img {
    margin-top: -25px;
    width: 450px;
  }
</style>
