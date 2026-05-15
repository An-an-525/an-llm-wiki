import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker } from './registerServiceWorker'
import { runtimeConfig } from './lib/runtime'

const runtime = runtimeConfig()
document.documentElement.dataset.platform = runtime.platform

function applyRuntimeSafeArea() {
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    window.matchMedia?.('(display-mode: window-controls-overlay)').matches

  document.documentElement.dataset.displayMode = standalone ? 'standalone' : 'browser'

  if (runtime.platform === 'android' && standalone) {
    document.documentElement.classList.add('android-standalone')
    return
  }

  document.documentElement.classList.remove('android-standalone')
}

applyRuntimeSafeArea()
window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', applyRuntimeSafeArea)
window.matchMedia?.('(display-mode: window-controls-overlay)').addEventListener?.('change', applyRuntimeSafeArea)

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <App />
  </HashRouter>,
)

registerServiceWorker()
