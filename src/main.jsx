import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/geist-sans/400.css'
import '@fontsource/geist-sans/500.css'
import '@fontsource/geist-mono/400.css'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { authClient } from './lib/neonClient.js'
import { NeonAuthUIProvider } from '@neondatabase/auth-ui'
import { Toaster } from 'sonner'

const AppProviders = ({ children }) => {
  const content = (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  )

  if (!authClient) {
    return content
  }

  return (
    <NeonAuthUIProvider authClient={authClient} redirectTo="/">
      {content}
    </NeonAuthUIProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders>
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
    </AppProviders>
  </StrictMode>,
)
