import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { getRecentReviews } from '../services/api'
import { Link } from 'react-router-dom'

const C = {
  cream: '#F5F2EB',
  black: '#0A0A0A',
  yellow: '#F5B800',
  orange: '#E8440A',
  muted: '#6B6862',
  border: '5px solid #0A0A0A',
  shadow: '3px 3px 0 #0A0A0A',
  font: "'Space Grotesk', sans-serif",
  body: "'Inter', sans-serif",
}

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const isChats = location.pathname === '/review' || location.pathname === '/chat'
  const isDashboard = location.pathname === '/dashboard'
  const isProfile = location.pathname === '/profile'
  const isContact = location.pathname === '/contact'
  const isReviewPage = location.pathname === '/review'

  const userName = localStorage.getItem('userName') || 'Developer'
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const userId = localStorage.getItem('userId')

  const [allSessions, setAllSessions] = useState([])
  const [showChatsDropdown, setShowChatsDropdown] = useState(false)
  const dropdownTimeoutRef = useRef(null)

  useEffect(() => {
    getRecentReviews(userId)
      .then(data => setAllSessions(data || []))
      .catch(err => console.error(err))
  }, [userId])

  function handleLogout() {
    localStorage.clear()
    navigate('/login')
  }

  function handleNewChat() {
    localStorage.removeItem('currentSessionId')
    localStorage.removeItem('lastReviewId')
    if (isReviewPage) {
      window.location.reload()
    } else {
      navigate('/review')
    }
  }

  const navLinkStyle = (active) => ({
    fontFamily: C.body,
    fontSize: '1.0rem',
    fontWeight: 900,
    color: active ? C.orange : C.black,
    background: 'none',
    border: 'none',
    borderBottom: active ? `2px solid ${C.orange}` : '2px solid transparent',
    paddingBottom: 2,
    cursor: 'pointer',
    outline: 'none',
    textDecoration: 'none',
    transition: 'color 0.15s, border-color 0.15s',
  })

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: C.body, display: 'flex', flexDirection: 'column' }}>

      {/* ── NAVBAR ───────────────────────────────────────────────────── */}
      {!isReviewPage && (
        <nav style={{
          background: C.cream,
          borderBottom: C.border,
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{
            maxWidth: 1280, margin: '0 auto', padding: '0 2rem',
            height: 64,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            {/* Logo */}
            <Link
              to="/"
              style={{
                fontFamily: C.font, fontWeight: 900, fontSize: '1.35rem',
                letterSpacing: '-0.03em', color: C.black, textDecoration: 'none',
              }}
            >
              CODELENS AI
            </Link>

            {/* Center Nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>

              {/* Chats dropdown */}
              <div
                style={{ position: 'relative', height: 64, display: 'flex', alignItems: 'center', }}
                onMouseEnter={() => { if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current); setShowChatsDropdown(true) }}
                onMouseLeave={() => { dropdownTimeoutRef.current = setTimeout(() => setShowChatsDropdown(false), 200) }}
              >
                <button
                  onClick={() => navigate('/review')}
                  style={navLinkStyle(isChats)}
                >
                  Chats
                </button>

                {showChatsDropdown && (
                  <div style={{
                    position: 'absolute', top: 58, left: -120, width: 300,
                    background: '#fff', border: C.border, boxShadow: C.shadow,
                    zIndex: 200, padding: '0.75rem',
                    maxHeight: 320, overflowY: 'auto',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #E5E3DD' }}>
                      <span style={{ fontFamily: C.font, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>Recent chats</span>
                      <button onClick={() => navigate('/review')} style={{ background: 'none', border: 'none', fontFamily: C.body, fontSize: '0.75rem', color: C.orange, cursor: 'pointer' }}>View all</button>
                    </div>
                    {allSessions.length === 0 ? (
                      <div style={{ padding: '1rem', textAlign: 'center' }}>
                        <p style={{ fontFamily: C.body, fontSize: '0.8rem', color: C.muted, marginBottom: '0.75rem' }}>No chats yet</p>
                        <button onClick={handleNewChat} style={{
                          fontFamily: C.font, fontWeight: 700, fontSize: '0.7rem',
                          letterSpacing: '0.12em', textTransform: 'uppercase',
                          background: C.black, color: '#fff', border: C.border,
                          padding: '0.5rem 1rem', cursor: 'pointer', width: '100%',
                        }}>
                          Start reviewing code
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {allSessions.map(s => (
                          <div
                            key={s.id}
                            onClick={() => {
                              if (s.session_id) {
                                localStorage.setItem('currentSessionId', s.session_id)
                                navigate('/review')
                              }
                            }}
                            style={{
                              padding: '0.6rem', borderRadius: 0, cursor: 'pointer',
                              border: '1px solid transparent', transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F5F2EB'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <span style={{ fontFamily: C.font, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.black, background: '#ECEAE4', border: '1px solid #D9D6CF', padding: '0.15rem 0.4rem' }}>
                                  {s.language || 'Code'}
                                </span>
                                <span style={{ fontFamily: C.font, fontSize: '0.65rem', fontWeight: 700, color: '#fff', background: s.score >= 8 ? '#22C55E' : s.score >= 5 ? C.yellow : C.orange, padding: '0.15rem 0.4rem' }}>
                                  {s.score}/10
                                </span>
                              </div>
                              <span style={{ fontFamily: C.body, fontSize: '0.7rem', color: C.muted }}>{new Date(s.created_at).toLocaleDateString()}</span>
                            </div>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {s.code ? s.code.split('\n')[0].substring(0, 40) : 'No code'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button onClick={() => navigate('/dashboard')} style={navLinkStyle(isDashboard)}>Dashboard</button>
              <button onClick={() => navigate('/contact')} style={navLinkStyle(isContact)}>Contact Us</button>
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={handleNewChat}
                style={{
                  fontFamily: C.font, fontWeight: 700, fontSize: '0.75rem',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: C.black, color: '#fff',
                  border: C.border, boxShadow: C.shadow,
                  padding: '0.45rem 1rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'transform 0.1s, box-shadow 0.1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.orange; e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #0A0A0A' }}
                onMouseLeave={e => { e.currentTarget.style.background = C.black; e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = C.shadow }}
              >
                + New Chat
              </button>

              {/* Profile avatar */}
              <div style={{ position: 'relative' }} className="group">
                <div
                  style={{
                    width: 34, height: 34,
                    background: C.orange,
                    border: '5px solid #0A0A0A' ,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: C.font, fontWeight: 700, fontSize: '0.8rem',
                    color: '#fff', cursor: 'pointer',
                  }}
                  title="View Profile"
                >
                  {initials}
                </div>

                {/* Dropdown */}
                <div style={{
                  position: 'absolute', top: 40, right: 0,
                  background: '#fff', border: C.border, boxShadow: C.shadow,
                  width: 160, zIndex: 200, overflow: 'hidden',
                }}
                  className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
                >
                  <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '0.65rem 0.85rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: C.body, fontSize: '0.82rem', color: C.black, textAlign: 'left', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F2EB'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: C.muted }}>person</span> Profile
                  </button>
                  <div style={{ height: 1, background: '#E5E3DD' }} />
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '0.65rem 0.85rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: C.body, fontSize: '0.82rem', color: C.orange, textAlign: 'left', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FEF0EB'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: C.orange }}>logout</span> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* ── MAIN ─────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, width: '100%', position: 'relative' }}>
        {children}
      </main>
    </div>
  )
}
