import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './AppRouter';
import { CartProvider, ToastProvider } from './contexts';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </ToastProvider>
  </StrictMode>
);
