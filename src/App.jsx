import React from 'react'
import { StoreProvider } from '@/context/StoreContext'
import Dashboard from '@/components/Dashboard'

function App() {
  return (
    <StoreProvider>
      <Dashboard />
    </StoreProvider>
  )
}

export default App
