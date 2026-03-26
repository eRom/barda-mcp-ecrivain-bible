import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  MapPin,
  CalendarClock,
  ArrowLeftRight,
  Scale,
  BookOpen,
  StickyNote,
  Search,
  Network,
  Save,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const mainNav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/characters', label: 'Personnages', icon: Users },
  { to: '/locations', label: 'Lieux', icon: MapPin },
  { to: '/events', label: 'Evenements', icon: CalendarClock },
  { to: '/interactions', label: 'Interactions', icon: ArrowLeftRight },
  { to: '/world-rules', label: 'Regles', icon: Scale },
  { to: '/research', label: 'Recherches', icon: BookOpen },
  { to: '/notes', label: 'Notes', icon: StickyNote },
]

const toolsNav: NavItem[] = [
  { to: '/search', label: 'Recherche', icon: Search },
  { to: '/graph', label: 'Graph', icon: Network },
  { to: '/timeline', label: 'Timeline', icon: CalendarClock },
]

const adminNav: NavItem[] = [
  { to: '/backups', label: 'Backups', icon: Save },
  { to: '/import-export', label: 'Import/Export', icon: ArrowRightLeft },
]

function NavSection({ items, collapsed }: { items: NavItem[]; collapsed: boolean }) {
  return (
    <>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex items-center px-2.5 py-2 rounded-lg gap-2.5 text-[13px] mx-1.5 mb-0.5 transition-colors ${
              isActive
                ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)]'
                : 'text-[var(--sidebar-foreground)]/70 hover:bg-[var(--sidebar-accent)]/50'
            }`
          }
        >
          <item.icon className="w-4 h-4 shrink-0 opacity-70" />
          {!collapsed && <span>{item.label}</span>}
        </NavLink>
      ))}
    </>
  )
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-3 left-3 z-50 bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)] w-10 h-10 rounded-lg flex items-center justify-center"
      >
        {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
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
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          <NavSection items={mainNav} collapsed={collapsed} />

          {/* Separateur */}
          <div className="mx-3 my-2 border-t border-[var(--sidebar-border)]" />

          <NavSection items={toolsNav} collapsed={collapsed} />

          {/* Separateur */}
          <div className="mx-3 my-2 border-t border-[var(--sidebar-border)]" />

          <NavSection items={adminNav} collapsed={collapsed} />
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
