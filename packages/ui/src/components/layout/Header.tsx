import SearchBar from '../search/SearchBar'
import { useTheme } from '../../hooks/useTheme'

export default function Header() {
  const { isDark, toggle } = useTheme()

  return (
    <header className="h-[38px] bg-[var(--background)] border-b border-[var(--border)] flex items-center justify-between px-3">
      <h1 className="text-sm font-semibold text-[var(--foreground)] hidden lg:block">
        Bible d'Ecrivain
      </h1>

      <div className="flex-1 ml-12 lg:ml-0 lg:mx-auto max-w-md">
        <SearchBar />
      </div>

      <button
        onClick={toggle}
        className="w-9 h-9 flex items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
        title={isDark ? 'Mode clair' : 'Mode sombre'}
      >
        {isDark ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    </header>
  )
}
