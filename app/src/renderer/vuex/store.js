import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    currentFile: { content: '', path: '' },
    isFileSaving: false,
  },
  mutations: {
    setCurrentFile(state, newFile) {
      // mutate state
      state.currentFile = newFile;
    },
    setFileIsSaving(state, isSaving) {
      state.isFileSaving = isSaving;
      console.log(state.isFileSaving);
    },
    changeFileContent(state, newFileContent) {
      state.currentFile.content = newFileContent;
    },
  },
  actions: {
    setCurrentFile({ commit }, newFile) {
      commit('setCurrentFile', newFile);
    },
    setFileIsSaving({ commit }) {
      commit('setFileIsSaving', true);
    },
    unsetFileIsSaving({ commit }) {
      commit('setFileIsSaving', false);
    },
    changeFileContent({ commit }, newFileContent) {
      commit('changeFileContent', newFileContent);
    },
  },
  strict: process.env.NODE_ENV !== 'production',
});
