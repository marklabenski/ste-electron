export default [
  {
    path: '/',
    name: 'editor',
    component: require('components/EditorView'),
  },
  {
    path: '*',
    redirect: '/',
  },
];
