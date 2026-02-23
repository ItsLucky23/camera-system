import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

(() => {
  const root = document.getElementById('root');
  if (!root) { return; }
  createRoot(root).render(
    <StrictMode>
      <div className='w-full h-dvh m-0 p-0'>
        <App />
      </div>
    </StrictMode>,
  )
})()