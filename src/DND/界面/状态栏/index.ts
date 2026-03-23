import { waitUntil } from 'async-wait-until';
import App from './App.vue';
import '../shared/theme.css';
import './global.css';

$(async () => {
  await waitGlobalInitialized('Mvu');
  await waitUntil(() => _.has(getVariables({ type: 'message' }), 'stat_data'));
  createApp(App).use(createPinia()).mount('#app');
});
