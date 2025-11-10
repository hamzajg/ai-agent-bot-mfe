import React from 'react';
import ReactDOM from 'react-dom/client';
import AIAgentBot from './AIAgentBot';
import '@shared/styles/index.css';

ReactDOM.createRoot(document.getElementById('widget-root')!).render(
  <React.StrictMode>
    <AIAgentBot />
  </React.StrictMode>,
);