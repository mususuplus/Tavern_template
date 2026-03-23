import { waitUntil } from 'async-wait-until';
import RootApp from './RootApp.vue';
import '../shared/theme.css';
import './global.css';

declare function getCurrentMessageId(): number;

$(async () => {
  await waitGlobalInitialized('Mvu');
  const currentMessageId = getCurrentMessageId();

  if (currentMessageId !== 0) {
    await waitUntil(() => _.has(getVariables({ type: 'message' }), 'stat_data'));
  }

  createApp(RootApp).use(createPinia()).mount('#app');
});
