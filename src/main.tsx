import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { NuqsAdapter } from 'nuqs/adapters/react'

import App from "./app/App.tsx"

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <NuqsAdapter>
        <App />
      </NuqsAdapter>
    </StrictMode>
  )
}