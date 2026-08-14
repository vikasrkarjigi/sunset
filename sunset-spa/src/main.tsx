import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'

const rootElement = document.getElementById('root')

if (rootElement === null) {
  throw new Error(
    '[Sunset] Root element #root not found in document. ' +
    'Ensure index.html contains <div id="root"></div>.',
  )
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
