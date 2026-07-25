import React from 'react';
import { createRoot } from 'react-dom/client';

import { MvuProvider } from '../主界面/MvuContext';
import App from './App';
import './index.css';

async function waitForCurrentStatData(timeout = 3000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    if (_.has(getVariables({ type: 'message', message_id: getLastMessageId() }), 'stat_data')) return;
    await new Promise(resolve => setTimeout(resolve, 80));
  }
  throw new Error('等待 stat_data 超时');
}

$(async () => {
  await waitGlobalInitialized('Mvu');
  try {
    await waitForCurrentStatData();
  } catch {
    console.info('[Aisela status 2.0] 当前楼层尚无 stat_data，等待开局仪式或使用 schema 默认档案。');
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
