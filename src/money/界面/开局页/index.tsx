import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './index.css';

$(async () => {
  await waitGlobalInitialized('Mvu');

  const root = document.getElementById('app');
  if (!root) throw new Error('找不到 #app 容器');
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
