import { waitUntil } from 'async-wait-until';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { MvuProvider } from '../主界面/MvuContext';
import App from './App';
import './index.css';

$(async () => {
  await waitGlobalInitialized('Mvu');
  try {
    await waitUntil(() => _.has(getVariables({ type: 'message', message_id: getLastMessageId() }), 'stat_data'), {
      timeout: 3000,
    });
  } catch {
    console.info('[Aisela status] 当前楼层尚无 stat_data，使用默认状态展示。');
  }

  const root = document.getElementById('app');
  if (!root) throw new Error('找不到 #app 容器');
  createRoot(root).render(
    <React.StrictMode>
      <MvuProvider>
        <App />
      </MvuProvider>
    </React.StrictMode>,
  );
});
