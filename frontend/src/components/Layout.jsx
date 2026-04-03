import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
  { label: 'Chats', icon: 'code', path: '/review' },
  { label: 'Profile', icon: 'person', path: '/profile' },
  { label: 'Settings', icon: 'settings', path: '/settings' },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [submissionsCount, setSubmissionsCount] = useState(0)

  const userName = localStorage.getItem('userName') || 'U'
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Hide sidebar on the review page
  const isReviewPage = location.pathname === '/review'

  function handleLogout() {
    localStorage.clear()
    navigate('/login')
  }

  function handleNewChat() {
    // Clear out session if implemented
    localStorage.removeItem('currentSessionId')
    localStorage.removeItem('lastReviewId')
    // A small hack to force Reload the review page to clear its states safely in React
    if (isReviewPage) {
      window.location.reload()
    } else {
      navigate('/review')
    }
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between px-4 text-xs font-medium">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 gradient-primary rounded-md flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-sm">code</span>
            </div>
            <span className="font-headline font-semibold text-base tracking-tight">CodeLens</span>
          </div>
          
          {/* Main Top Nav */}
          <nav className="hidden md:flex items-center gap-6 mt-1 h-full">
            <div className="relative group h-14 flex items-center cursor-pointer">
              <NavLink 
                to="/review" 
                className={({isActive}) => `flex items-center h-full border-b-2 transition-colors ${isActive ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-white'}`}
              >
                Chats
              </NavLink>
              {/* Dropdown for recent chats on hover */}
              <div className="absolute top-14 left-0 w-64 bg-surface-container border border-outline-variant/20 rounded-b-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col p-2">
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest px-2 py-1">Recent Sessions</span>
                {/* Normally fetched from DB via user history, pseudo populated here */}
                <div onClick={() => navigate('/review')} className="px-2 py-2 text-xs truncate hover:bg-surface-container-high rounded text-on-surface border-b border-outline-variant/10">
                  <span className="text-secondary mr-2">●</span> auth.js security check - 2hr ago
                </div>
                <div onClick={() => navigate('/review')} className="px-2 py-2 text-xs truncate hover:bg-surface-container-high rounded text-on-surface">
                  <span className="text-outline mr-2">●</span> Refactoring User models - 1d ago
                </div>
              </div>
            </div>
            
            <NavLink to="/dashboard" className={({isActive}) => `h-full flex items-center border-b-2 transition-colors ${isActive ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-white'}`}>
              Dashboard
            </NavLink>
            <NavLink to="/profile" className={({isActive}) => `h-full flex items-center border-b-2 transition-colors ${isActive ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-white'}`}>
              Profile
            </NavLink>
            <NavLink to="/contact" className={({isActive}) => `h-full flex items-center border-b-2 transition-colors ${isActive ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-white'}`}>
              Contact
            </NavLink>
            
            <button onClick={handleNewChat} className="ml-4 border border-primary text-primary px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors uppercase tracking-widest text-[9px] font-bold">
              + New Chat
            </button>
          </nav>
        </div>

        {/* Right area */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-surface-container text-on-surface-variant px-2 py-1 rounded-full border border-outline-variant/30 flex items-center gap-1">
            {submissionsCount} reviews
          </span>
          <span className="w-2 h-2 rounded-full bg-secondary inline-block" title="Online" />
          <div className="w-8 h-8 rounded-full bg-surface-bright border border-outline-variant flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">{initials}</span>
          </div>
        </div>
      </header>

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      {!isReviewPage && (
        <aside className="fixed top-0 left-0 bottom-0 z-40 w-64 bg-surface-container-low border-r border-outline-variant/20 flex flex-col pt-14 text-sm font-medium">
          {/* Brand */}
          <div className="px-4 py-4 border-b border-outline-variant/10">
            <p className="font-headline font-bold text-sm text-on-surface">CodeLens AI</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Monolithic Intelligence</p>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 py-3 space-y-0.5">
            <button onClick={handleNewChat} className="gradient-primary w-full py-2.5 rounded-lg text-on-primary text-xs font-bold tracking-wider uppercase mb-3 text-center">
              + New Chat
            </button>

            {navItems.map(({ label, icon, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-primary bg-surface-container'
                      : 'text-on-surface-variant hover:text-white hover:bg-surface-container/50'
                  }`
                }
              >
                <span className="material-symbols-outlined text-base">{icon}</span>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Bottom */}
          <div className="px-3 py-4 border-t border-outline-variant/10 space-y-2">
            <a
              href="#"
              className="flex items-center gap-2 px-3 py-2 text-xs text-on-surface-variant hover:text-white rounded-lg"
            >
              <span className="material-symbols-outlined text-base">help</span>
              Help
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-xs text-error hover:text-error-dim rounded-lg w-full text-left"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Logout
            </button>
          </div>
        </aside>
      )}

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main className={`${isReviewPage ? '' : 'ml-64'} pt-14 min-h-screen`}>
        {children}
      </main>
    </div>
  )
}
