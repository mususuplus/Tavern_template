import App from './App.vue';
import './global.css';

$(async () => {
  createApp(App).use(createPinia()).mount('#app');
});
