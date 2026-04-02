import React from 'react'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './core/providers/AuthProvider'
import { ThemeProvider } from './core/providers/ThemeProvider'
import AppRouter from './core/router/AppRouter'
import ErrorBoundary from './shared/components/feedback/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes freshness
      cacheTime: 1000 * 60 * 5, // 5 minutes in memory (Reduced from 30m for lower footprint)
      retry: 1,
      refetchOnWindowFocus: false, // Prevents excessive CPU usage on tab switching
      refetchOnReconnect: true,
    },
  },
})

function App() {
  return (
    <ThemeProvider>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRouter />
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'heritage-toast',
              style: {
                background: '#FAF6EE',
                color: '#3D3826',
                border: '1px solid rgba(196, 154, 26, 0.2)',
                fontFamily: 'Plus Jakarta Sans',
                borderRadius: '1rem',
                fontSize: '12px',
                fontWeight: 'bold',
                padding: '16px 24px',
              },
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
