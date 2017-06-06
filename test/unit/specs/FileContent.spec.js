import Vue from 'vue';
import FileContent from 'renderer/components/Editor/FileContent';
import store from 'renderer/vuex/store';

describe('FileContent.vue', () => {
  it('should render correct contents', () => {
    const newStore = Object.assign({}, store);
    const vm = new Vue({
      store: newStore,
      ...FileContent,
    }).$mount();
    // <div class="editor-window">
    expect(vm.$el.tagName).to.have.string('TEXTAREA');
  });

  it('should change the fileContent of the Vuex store', () => {
    const newFileContent = Object.assign({}, FileContent);
    const vm = new Vue({
      store,
      ...newFileContent,
    }).$mount();
    vm.$el.value = 'hallo';
    vm.changeFileContent();

    expect(store.state.currentFile.content).to.have.string(vm.$el.value);
  });

  it('computed: fileContent', () => {
    const Ctor = Vue.extend(FileContent);
    const vm = new Ctor({ store }).$mount();
    vm.$el.value = 'test';
    vm.changeFileContent();

    expect(vm.fileContent).to.equal('test');
  });
});
