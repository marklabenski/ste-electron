import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    currentFile: { content: '', path: '' },
    isFileSaving: false,
    showEncryptionModal: false,
  },
  mutations: {
    setCurrentFile(state, newFile) {
      // mutate state
      state.currentFile = newFile;
    },
    setShowEncryptionModal(state, show) {
      // mutate state
      state.showEncryptionModal = show;
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
    setShowEncryptionModal({ commit }, show) {
      commit('setShowEncryptionModal', show);
    },
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
