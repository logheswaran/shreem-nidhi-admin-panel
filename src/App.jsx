import React from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './hooks/useAuth'
import AppRouter from './routes/AppRouter'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#FAF6EE',
            color: '#3D3826',
            border: '1px solid rgba(196, 154, 26, 0.2)',
            fontFamily: 'Plus Jakarta Sans',
          },
        }}
      />
    </AuthProvider>
  )
}

export default App
