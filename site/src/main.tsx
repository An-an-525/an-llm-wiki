import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker } from './registerServiceWorker'
import { runtimeConfig } from './lib/runtime'

function applyRuntimeSafeArea() {
  const runtime = runtimeConfig()
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    window.matchMedia?.('(display-mode: window-controls-overlay)').matches

  document.documentElement.dataset.platform = runtime.platform
  document.documentElement.dataset.displayMode = standalone ? 'standalone' : 'browser'

  if (runtime.platform === 'android') {
    document.documentElement.classList.add('android-standalone')
    document.documentElement.classList.remove('desktop-standalone', 'ios-standalone')
    return
  }

  document.documentElement.classList.remove('android-standalone')
  document.documentElement.classList.toggle('desktop-standalone', runtime.platform === 'desktop')
  document.documentElement.classList.toggle('ios-standalone', runtime.platform === 'ios')
}

applyRuntimeSafeArea()
window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', applyRuntimeSafeArea)
window.matchMedia?.('(display-mode: window-controls-overlay)').addEventListener?.('change', applyRuntimeSafeArea)
window.addEventListener('an-runtime-config-updated', applyRuntimeSafeArea)
window.setTimeout(applyRuntimeSafeArea, 50)
window.setTimeout(applyRuntimeSafeArea, 250)
window.setTimeout(applyRuntimeSafeArea, 1000)
window.addEventListener('pageshow', applyRuntimeSafeArea)

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <App />
  </HashRouter>,
)

registerServiceWorker()
