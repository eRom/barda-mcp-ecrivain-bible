import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '#' },
  { to: '/characters', label: 'Personnages', icon: 'P' },
  { to: '/locations', label: 'Lieux', icon: 'L' },
  { to: '/events', label: 'Evenements', icon: 'E' },
  { to: '/interactions', label: 'Interactions', icon: 'I' },
  { to: '/world-rules', label: 'Regles', icon: 'R' },
  { to: '/research', label: 'Recherches', icon: 'D' },
  { to: '/notes', label: 'Notes', icon: 'N' },
  { to: '/graph', label: 'Graph', icon: 'G' },
  { to: '/timeline', label: 'Timeline', icon: 'T' },
  { to: '/search', label: 'Recherche', icon: '?' },
  { to: '/backups', label: 'Backups', icon: 'B' },
  { to: '/import-export', label: 'Import/Export', icon: 'X' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-3 left-3 z-50 bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)] w-10 h-10 rounded-lg flex items-center justify-center"
      >
        {collapsed ? '>' : 'x'}
      </button>

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] flex flex-col transition-all duration-200 border-r border-[var(--sidebar-border)]
          ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-[52px]' : 'translate-x-0 w-[260px]'}`}
      >
        <div className="h-14 flex items-center px-4 border-b border-[var(--sidebar-border)]">
          {!collapsed && (
            <span className="text-[var(--sidebar-foreground)] font-semibold text-lg">Bible</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex ml-auto w-6 h-6 items-center justify-center rounded text-[var(--sidebar-foreground)]/70 hover:bg-[var(--sidebar-accent)]/50 transition-colors"
          >
            {collapsed ? '>' : '<'}
          </button>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => {
                if (window.innerWidth < 1024) setCollapsed(true)
              }}
              className={({ isActive }) =>
                `flex items-center px-2.5 py-2 rounded-lg gap-2.5 text-[13px] mx-1.5 mb-0.5 transition-colors ${
                  isActive
                    ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)]'
                    : 'text-[var(--sidebar-foreground)]/70 hover:bg-[var(--sidebar-accent)]/50'
                }`
              }
            >
              <span className="w-5 text-center font-mono text-xs opacity-60 shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Overlay mobile */}
      {!collapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  )
}
