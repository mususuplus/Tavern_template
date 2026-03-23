import App from './App.vue';
import '../shared/theme.css';
import './global.css';

$(async () => {
  await waitGlobalInitialized('Mvu');
  createApp(App).use(createPinia()).mount('#app');
});
