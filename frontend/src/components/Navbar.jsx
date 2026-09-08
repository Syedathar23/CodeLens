import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isLoggedIn = !!localStorage.getItem('token')

  function isActive(path) {
    return location.pathname === path
  }

  return (
    <nav
      style={{
        background: '#F5F2EB',
        borderBottom: '6px solid #0A0A0A',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 2rem',
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
            fontSize: '1.4rem',
            letterSpacing: '-0.03em',
            color: '#0A0A0A',
            textDecoration: 'none',
          }}
        >
          CODELENS AI
        </Link>

        {/* Center links */}
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {[
            { label: 'WHY CODELENS', path: '/' },
            { label: 'ABOUT US', path: '../about' },
            { label: 'CONTACT', path: '/contact' },
            ...(isLoggedIn ? [{ label: 'CHATS', path: '/review' }] : []),
          ].map(({ label, path }) => (
            <Link
              key={label}
              to={path}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.875rem',
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

        {/* Right buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
      </div>
    </nav>
  )
}
