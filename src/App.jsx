import React from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { StoreProvider } from '@/context/StoreContext'
import { useAuth } from '@/context/AuthContext'
import Dashboard from '@/components/Dashboard'
import LoginScreen from '@/components/LoginScreen'
import { Flower2 } from 'lucide-react'

function AppContent() {
  const { user } = useAuth()

  // Still loading auth state
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FFE4FB 0%, #C5E3FF 100%)" }}>
        <div className="flex flex-col items-center gap-3 text-rose-400">
          <Flower2 className="h-10 w-10 animate-spin" />
          <p className="text-sm font-medium">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return <LoginScreen />
  }

  // Logged in
  return (
    <StoreProvider>
      <Dashboard />
    </StoreProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
