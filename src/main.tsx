import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import config from '../amplify_outputs.json'
import './index.css'
import App from './App'

Amplify.configure(config, {
  ssr: true,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
