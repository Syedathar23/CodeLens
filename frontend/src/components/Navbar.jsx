import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isLoggedIn = !!localStorage.getItem('token')

  function isActive(path) {
    return location.pathname === path
  }

  const navLinks = [
    { label: 'WHY CODELENS', path: '/' },
    { label: 'ABOUT US', path: '/about' },
    { label: 'CONTACT', path: '/contact' },
    ...(isLoggedIn ? [{ label: 'CHATS', path: '/review' }] : []),
  ]

  return (
    <nav
      style={{
        background: '#F5F2EB',
        borderBottom: '4px solid #0A0A0A',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 1.25rem',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(1.15rem, 3vw, 1.4rem)',
            letterSpacing: '-0.03em',
            color: '#0A0A0A',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          CODELENS AI
        </Link>

        {/* Desktop Center Links */}
        <div className="hidden md:flex" style={{ gap: '2rem', alignItems: 'center' }}>
          {navLinks.map(({ label, path }) => (
            <Link
              key={label}
              to={path}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.85rem',
                fontWeight: 900,
                color: isActive(path) ? '#E8440A' : '#0A0A0A',
                textDecoration: isActive(path) ? 'underline' : 'none',
                textUnderlineOffset: 3,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.target.style.color = '#E8440A'}
              onMouseLeave={e => e.target.style.color = isActive(path) ? '#E8440A' : '#0A0A0A'}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop Right Buttons */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '1rem' }}>
          {isLoggedIn ? (
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 900,
                fontSize: '0.8rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: '#E8440A',
                color: '#fff',
                border: '2px solid #0A0A0A',
                boxShadow: '3px 3px 0 #0A0A0A',
                padding: '0.5rem 1.25rem',
                cursor: 'pointer',
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translate(-2px, -2px)'
                e.currentTarget.style.boxShadow = '5px 5px 0 #0A0A0A'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translate(0,0)'
                e.currentTarget.style.boxShadow = '3px 3px 0 #0A0A0A'
              }}
            >
              Dashboard
            </button>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 900,
                  color: '#0A0A0A',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => e.target.style.color = '#E8440A'}
                onMouseLeave={e => e.target.style.color = '#0A0A0A'}
              >
                Login
              </Link>
              <button
                onClick={() => navigate('/signup')}
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  background: '#E8440A',
                  color: '#fff',
                  border: '2px solid #0A0A0A',
                  boxShadow: '3px 3px 0 #0A0A0A',
                  padding: '0.5rem 1.25rem',
                  cursor: 'pointer',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translate(-2px, -2px)'
                  e.currentTarget.style.boxShadow = '5px 5px 0 #0A0A0A'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translate(0,0)'
                  e.currentTarget.style.boxShadow = '3px 3px 0 #0A0A0A'
                }}
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden" style={{ alignItems: 'center' }}>
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle Navigation Menu"
            style={{
              background: mobileMenuOpen ? '#0A0A0A' : '#fff',
              color: mobileMenuOpen ? '#fff' : '#0A0A0A',
              border: '2px solid #0A0A0A',
              boxShadow: '2px 2px 0 #0A0A0A',
              padding: '6px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div
          className="block md:hidden"
          style={{
            background: '#F5F2EB',
            borderTop: '2px solid #0A0A0A',
            borderBottom: '4px solid #0A0A0A',
            padding: '1.25rem',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {navLinks.map(({ label, path }) => (
              <Link
                key={label}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '1rem',
                  fontWeight: 900,
                  color: isActive(path) ? '#E8440A' : '#0A0A0A',
                  textDecoration: 'none',
                  padding: '0.4rem 0',
                  borderBottom: '1px solid #D9D6CF',
                }}
              >
                {label}
              </Link>
            ))}

            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate('/dashboard')
                  }}
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    background: '#E8440A',
                    color: '#fff',
                    border: '2px solid #0A0A0A',
                    boxShadow: '3px 3px 0 #0A0A0A',
                    padding: '0.75rem',
                    width: '100%',
                    cursor: 'pointer',
                  }}
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      textAlign: 'center',
                      color: '#0A0A0A',
                      padding: '0.6rem',
                      background: '#fff',
                      border: '2px solid #0A0A0A',
                      boxShadow: '2px 2px 0 #0A0A0A',
                      textDecoration: 'none',
                    }}
                  >
                    Login
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      navigate('/signup')
                    }}
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      background: '#E8440A',
                      color: '#fff',
                      border: '2px solid #0A0A0A',
                      boxShadow: '3px 3px 0 #0A0A0A',
                      padding: '0.75rem',
                      width: '100%',
                      cursor: 'pointer',
                    }}
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
