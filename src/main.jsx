import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/geist-sans/400.css'
import '@fontsource/geist-sans/500.css'
import '@fontsource/geist-mono/400.css'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '9999px',
          fontFamily: 'var(--font-sans)',
        }
      }} />
      <App />
    </CartProvider>
  </StrictMode>,
)
