import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ROUTER_MODE } from './config';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/pages.css';

const Router = ROUTER_MODE === 'hash' ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </Router>
  </StrictMode>,
);
