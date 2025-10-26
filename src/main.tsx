import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

const rawBase = import.meta.env.VITE_PUBLIC_BASE?.trim();
const normalizedBase =
  rawBase && rawBase !== '/' && rawBase !== './'
    ? rawBase.replace(/^\//, '').replace(/\/$/, '')
    : undefined;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter basename={normalizedBase ? `/${normalizedBase}` : undefined}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </StrictMode>
);
