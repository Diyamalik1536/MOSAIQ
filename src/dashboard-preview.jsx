import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Dashboard from './assets/Components/Dashboard/Dashboard.jsx'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './App.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Dashboard />
  </StrictMode>,
)
