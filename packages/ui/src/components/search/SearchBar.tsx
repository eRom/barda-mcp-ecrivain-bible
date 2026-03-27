import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isUserInputRef = useRef(false)
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  // Sync SearchBar with URL when on /search
  useEffect(() => {
    if (location.pathname === '/search') {
      const urlQuery = new URLSearchParams(location.search).get('q') ?? ''
      setQuery(urlQuery)
    }
  }, [location.pathname, location.search])

  // Only auto-navigate when user is actively typing
  useEffect(() => {
    if (!isUserInputRef.current) return
    isUserInputRef.current = false

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query.trim()) return

    debounceRef.current = setTimeout(() => {
      navigateRef.current(`/search?q=${encodeURIComponent(query.trim())}`)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    isUserInputRef.current = true
    setQuery(e.target.value)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    isUserInputRef.current = false
    const trimmed = query.trim()
    if (trimmed) {
      navigateRef.current(`/search?q=${encodeURIComponent(trimmed)}`)
    }
  }

  function handleClear() {
    isUserInputRef.current = false
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setQuery('')
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-md">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Rechercher dans la bible..."
        className="w-full pl-9 pr-8 h-9 text-sm rounded-md border border-[var(--input)] bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/50 focus:outline-none"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </form>
  )
}
