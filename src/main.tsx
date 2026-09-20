import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely suppress window.fetch property assignment errors caused by external scripts or extensions
window.addEventListener('error', (event) => {
  if (event.message && (event.message.includes('fetch') || event.message.includes('getter'))) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.message || String(event.reason || '');
  if (reason.includes('fetch') || reason.includes('getter')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
