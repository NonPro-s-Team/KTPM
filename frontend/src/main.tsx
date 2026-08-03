import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
// Subset vietnamese không nằm trong file mặc định — thiếu là chữ có dấu rơi về font hệ thống
import '@fontsource/inter/vietnamese-400.css'
import '@fontsource/inter/vietnamese-500.css'
import '@fontsource/inter/vietnamese-600.css'
import '@fontsource/inter/vietnamese-700.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
