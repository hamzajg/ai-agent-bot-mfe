import React from 'react';
import ReactDOM from 'react-dom/client';
import LandingApp from './LandingApp';
import '@shared/styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LandingApp />
  </React.StrictMode>,
);