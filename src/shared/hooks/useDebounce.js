import { useState, useEffect } from 'react'

/**
 * Custom hook to debounce a value.
 * @param {*} value - The value to debounce.
 * @param {number} delay - The delay in milliseconds (default: 300).
 * @returns {*} - The debounced value.
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debounced
}
