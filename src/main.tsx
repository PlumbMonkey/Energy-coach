// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Register basic PWA service worker (safe no-op in dev)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
)

