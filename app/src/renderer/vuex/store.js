import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // type can be "encrypted" or "plain",
    // encryptionSettings only apply on type "encrypted"
    currentFile: { content: '', path: '', type: 'plain', encryptionSettings: {} },
    isFileSaving: false,
    showEncryptionModal: false,
    showDecryptionModal: false,
    showKeyGenerateModal: false,
    isFileDirty: false,
  },
  mutations: {
    setCurrentFile(state, newFile) {
      // mutate state
      state.currentFile = newFile;
      state.isFileDirty = true;
    },
    setShowEncryptionModal(state, show) {
      // mutate state
      state.showEncryptionModal = show;
    },
    setShowDecryptionModal(state, show) {
      // mutate state
      state.showDecryptionModal = show;
    },
    setShowKeyGenerateModal(state, show) {
      // mutate state
      state.showKeyGenerateModal = show;
    },
    setFileIsSaving(state, isSaving) {
      state.isFileSaving = isSaving;
    },
    changeFileContent(state, newFileContent) {
      state.currentFile.content = newFileContent;
      state.isFileDirty = true;
      if (state.currentFile.type !== 'encrypted') {
        state.currentFile.type = 'plain';
      }
    },
    setFileDirty(state, dirtyState) {
      state.isFileDirty = dirtyState;
    },
  },
  getters: {
    fileContent(state) {
      return state.currentFile.content;
    },
    isFileSaving(state) {
      return state.isFileSaving;
    },
    isFileEncrypted(state) {
      return state.currentFile.type === 'encrypted';
    },
  },
  actions: {
    setShowEncryptionModal({ commit }, show) {
      commit('setShowEncryptionModal', show);
    },
    setShowDecryptionModal({ commit }, show) {
      commit('setShowDecryptionModal', show);
    },
    setShowKeyGenerateModal({ commit }, show) {
      commit('setShowKeyGenerateModal', show);
    },
    setCurrentFile({ commit }, newFile) {
      commit('setCurrentFile', newFile);
    },
    setFileIsSaving({ commit }) {
      commit('setFileIsSaving', true);
    },
    setFileDirty({ commit }, dirtyState) {
      commit('setFileDirty', dirtyState);
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
