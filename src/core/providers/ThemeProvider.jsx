import React, { createContext, useContext } from 'react'

const ThemeContext = createContext()

/**
 * ThemeProvider decommissioned - Light Mode Only
 * Night mode has been removed per user request.
 */
export const ThemeProvider = ({ children }) => {
  // Always force light mode
  const isDark = false
  const toggleTheme = () => console.log('Night mode is no longer available.')

  // Ensure any leftover dark class is removed on initialization
  React.useEffect(() => {
    document.documentElement.classList.remove('dark')
    localStorage.removeItem('sreemnidhi_theme')
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
