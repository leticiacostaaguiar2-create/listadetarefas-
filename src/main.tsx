import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for PWA offline caching
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Nova versão do FocoTask disponível.');
  },
  onOfflineReady() {
    console.log('FocoTask pronto para uso offline.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
