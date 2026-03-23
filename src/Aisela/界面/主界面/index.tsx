import { waitUntil } from 'async-wait-until';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { MvuProvider } from './MvuContext';
import './index.css';

$(async () => {
  await waitGlobalInitialized('Mvu');
  // 等待当前楼层存在 MVU 变量 stat_data（如已有存档/定制化数据）。若超时（例如在新楼层或首次加载），仍继续渲染，由 MvuProvider 用默认数据兜底
  try {
    await waitUntil(() => _.has(getVariables({ type: 'message' }), 'stat_data'), { timeout: 15_000 });
  } catch {
    console.info('[Aisela] 当前楼层尚无 stat_data，使用默认数据渲染');
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
