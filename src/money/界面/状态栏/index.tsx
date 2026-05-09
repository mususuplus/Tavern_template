import { waitUntil } from 'async-wait-until';
import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './index.css';

$(async () => {
  await waitGlobalInitialized('Mvu');
  try {
    await waitUntil(() => _.has(getVariables({ type: 'message', message_id: getCurrentMessageId() }), 'stat_data'), {
      timeout: 2400,
    });
  } catch {
    console.info('[money status] 当前楼层暂无 stat_data，显示初始化面板。');
  }

  const root = document.getElementById('app');
  if (!root) throw new Error('找不到 #app 容器');
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
