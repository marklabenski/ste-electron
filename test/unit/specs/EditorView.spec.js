import Vue from 'vue';
import EditorView from 'renderer/components/EditorView';
import store from 'renderer/vuex/store';

describe('EditorView.vue', () => {
  it('should render correct contents', () => {
    const vm = new Vue({
      store,
      el: document.createElement('div'),
      render: h => h(EditorView),
    }).$mount();
    // <div class="editor-window">
    expect(vm.$el.classList.contains('editor-window')).to.be.true;
  });
});
