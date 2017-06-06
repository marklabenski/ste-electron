import Vue from 'vue';
import EditorMenu from 'renderer/components/Menu/EditorMenu';
import store from 'renderer/vuex/store';
import FileServicePlugin from 'renderer/ste/file-service';

const mockedFileContent = { content: 'mocked file content' };
const savedFile = { content: '' };
const mockedFileService = {
  install(Vue) {
    Vue.prototype.$fileService = this;
  },
  saveFile(file) {
    savedFile.content = file.content;
    return {
      then(cb) {
        cb(mockedFileContent);
      },
    };
  },
  encryptFile: {},
  decryptFile() {
    return {
      then(cb) {
        cb({ fileContent: ')H/TASGBD)/Tashjk' });
      },
    };
  },
  fileDialog: {
    open() {
      return {
        then(cb) {
          cb(mockedFileContent);
        },
      };
    },
  },
};

describe('EditorMenu.vue', () => {
  it('should render correct contents', () => {
    const vm = new Vue({
      store,
      ...EditorMenu,
    }).$mount();

    expect(vm.$el.tagName).to.have.string('NAV');
    expect(vm.$el.children.length).to.equal(4);
  });

  it('should open a file', () => {
    const vm = new Vue({
      store,
      ...EditorMenu,
    }).$mount();
    Vue.use(mockedFileService);
    vm.openFile();

    expect(store.state.currentFile.content).to.equal(mockedFileContent.content);
  });

  it('should save a file', () => {
    const vm = new Vue({
      store,
      ...EditorMenu,
    }).$mount();
    Vue.use(mockedFileService);

    store.state.currentFile = { content: 'yay, saved!' };
    vm.saveFile();

    expect(savedFile.content).to.equal('yay, saved!');
  });

  it('should decrypt file', () => {
    const vm = new Vue({
      store,
      ...EditorMenu,
    }).$mount();
    Vue.use(mockedFileService);

    vm.decryptFile(mockedFileContent);

    expect(store.state.currentFile.content).to.equal(')H/TASGBD)/Tashjk');
  });

  it('should show encrypt modal', () => {
    const vm = new Vue({
      store,
      ...EditorMenu,
    }).$mount();
    Vue.use(FileServicePlugin);

    vm.encryptFile();

    expect(store.state.showEncryptionModal).to.equal(true);
  });
});
