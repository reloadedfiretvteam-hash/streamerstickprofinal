import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './AppRouter';
import { CartProvider } from './components/CartProvider';
import { GoogleAdsTag } from './components/GoogleAdsTag';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <GoogleAdsTag />
      <AppRouter />
    </CartProvider>
  </StrictMode>
);
