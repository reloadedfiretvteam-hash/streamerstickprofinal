import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CartProvider } from './components/CartProvider';
import AppRouter from './AppRouter';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <AppRouter />
    </CartProvider>
  </StrictMode>
);
