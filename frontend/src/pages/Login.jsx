import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/api'

const C = {
  cream: '#F5F2EB',
  black: '#0A0A0A',
  yellow: '#F5B800',
  orange: '#E8440A',
  muted: '#4A4845',
  border: '3px solid #0A0A0A',
  shadow: '6px 6px 0 #0A0A0A',
  shadowLg: '10px 10px 0 #0A0A0A',
  /* Use Inter for the card body, Space Grotesk for display */
  font: "'BOLD', sans-serif",
  body: "'Inter', sans-serif",
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const { token, user } = await login(email, password)
      localStorage.setItem('token', token)
      localStorage.setItem('userId', user.id)
      localStorage.setItem('userName', user.name)
      localStorage.setItem('userEmail', user.email)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  /* shared input style */
  const inputStyle = {
    width: '100%',
    border: '3px solid #0A0A0A',
    background: '#FAFAF8',
    fontFamily: C.body,
    fontSize: '1rem',
    color: C.black,
    padding: '0.95rem 1.10rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'box-shadow 0.15s, border-color 0.15s',
    borderRadius: 0,
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: C.cream,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: C.body,
    }}>

      {/* ── Dense, dark, high-contrast checkered background ─────────── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        backgroundImage: `
          repeating-conic-gradient(
            rgba(10,10,10,0.28) 0% 25%,
            transparent 0% 50%
          )
        `,
        backgroundSize: '12px 12px',   /* much smaller, denser grid */
      }} />

      {/* ── Floating decoration squares (Larger, thicker borders) ──────────────── */}
      <div style={{
        position: 'absolute', top: '10%', left: '8%',
        width: 150, height: 150,         /* much larger */
        background: C.orange, border: '2px solid #0A0A0A',
        transform: 'rotate(-9deg)', zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '9%',
        width: 170, height: 170,         /* much larger */
        background: C.yellow, border: '2px solid #0A0A0A',
        transform: 'rotate(11deg)', zIndex: 1,
      }} />
      {/* White circle — larger, moved closer to the login card box */}
      <div style={{
        position: 'absolute', top: '44%', right: '23%',  /* closer to the card */
        width: 108, height: 108,           /* much larger */
        borderRadius: '50%',
        background: '#fff', border: '4px solid #0A0A0A', zIndex: 1,
      }} />

      {/* ── Login card ───────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 2,
        background: '#fff',
        border: '4px solid #0A0A0A',     /* thicker card border */
        boxShadow: C.shadowLg,            /* larger, harder offset */
        width: '100%', maxWidth: 460,     /* slightly wider to fit larger inputs */
        overflow: 'hidden',
      }}>

        {/* ── Card header bar ─────────────────────────────────────────── */}
        <div style={{
          background: C.yellow,
          borderBottom: '4px solid #0A0A0A', /* thicker border */
          padding: '0.9rem 1.1rem',       /* adjusted padding to bring items closer to borders */
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* SYSTEM LOGIN — bigger, heavier, slightly tighter tracking, Inter Bold */}
          <span style={{
            fontFamily: "'bold', sans-serif",
            fontWeight: 800,
            fontSize: '0.95rem',           /* larger */
            letterSpacing: '0.08em',       /* less letter-spaced than before */
            textTransform: 'uppercase',
            color: C.black,
          }}>
            System Login
          </span>

          {/* Circle indicator — smaller, hugging right edge closer to the box border, with inner black dot */}
          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            border: '3px solid #0A0A0A',  /* thicker border */
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            marginRight: '-2px',          /* pull it closer to the right container edge */
          }}>
            {/* Inner filled dot */}
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#0A0A0A',
            }} />
          </div>
        </div>

        {/* ── Card body ───────────────────────────────────────────────── */}
        <div style={{ padding: '2.5rem 2.25rem' }}>

          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontFamily: C.font,
              fontWeight: 900,
              fontSize: '2.5rem',         /* larger */
              letterSpacing: '-0.04em',
              color: C.black,
              marginBottom: '0.5rem',
              lineHeight: 1,
            }}>
              LOGIN
            </h1>
            {/* "Authenticate to continue" — bigger, darker, more spacing */}
            <p style={{
              fontFamily: C.body,
              fontSize: '0.95rem',         /* bigger */
              color: '#1A1A1A',            /* darker */
              letterSpacing: '0.02em',
              marginTop: '0.4rem',
            }}>
              Authenticate to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              border: `2px solid ${C.orange}`,
              background: 'rgba(232,68,10,0.08)',
              padding: '0.65rem 0.9rem',
              marginBottom: '1.25rem',
              fontFamily: C.body,
              fontSize: '0.82rem',
              color: C.orange,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

            {/* Identity / Email */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: C.font,
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: C.black,
                marginBottom: '0.45rem',
              }}>
                Identity / Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="dev@example.com"
                style={inputStyle}
                onFocus={e => {
                  e.target.style.boxShadow = '0 0 0 3px rgba(232,68,10,0.25)'
                  e.target.style.borderColor = C.orange
                }}
                onBlur={e => {
                  e.target.style.boxShadow = 'none'
                  e.target.style.borderColor = C.black
                }}
              />
            </div>

            {/* Access Key / Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <label style={{
                  fontFamily: C.font,
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: C.black,
                }}>
                  Access Key
                </label>
                <a href="#" style={{
                  fontFamily: C.body,
                  fontSize: '0.78rem',
                  color: C.orange,
                  textDecoration: 'none',
                  fontWeight: 600,
                }}>
                  Lost Key?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '2.75rem' }}
                  onFocus={e => {
                    e.target.style.boxShadow = '0 0 0 3px rgba(232,68,10,0.25)'
                    e.target.style.borderColor = C.orange
                  }}
                  onBlur={e => {
                    e.target.style.boxShadow = 'none'
                    e.target.style.borderColor = C.black
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: C.muted,
                    display: 'flex', alignItems: 'center', padding: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
                    {showPw ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* ── INITIALIZE SESSION button — taller, heavier, neo-brutalist ── */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: C.orange,
                color: '#fff',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                fontSize: '0.9rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                border: '3px solid #0A0A0A',
                padding: '1.2rem 0',           /* taller/bigger */
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.65 : 1,
                transition: 'transform 0.1s, box-shadow 0.1s',
                boxShadow: '6px 6px 0 #0A0A0A', /* bigger offset shadow */
                marginTop: '0.5rem',
                borderRadius: 0,
              }}
              onMouseEnter={e => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translate(-3px,-3px)'
                  e.currentTarget.style.boxShadow = '9px 9px 0 #0A0A0A'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translate(0,0)'
                e.currentTarget.style.boxShadow = '6px 6px 0 #0A0A0A'
              }}
            >
              {isLoading ? 'Authenticating…' : 'Initialize Session'}
            </button>

          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.6rem 0' }}>
            <div style={{ flex: 1, height: 1, background: '#C5C2BB' }} />
            <span style={{
              fontFamily: C.body,
              fontSize: '0.75rem',
              color: C.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}>
              or
            </span>
            <div style={{ flex: 1, height: 1, background: '#C5C2BB' }} />
          </div>

          {/* Google */}
          <button
            id="login-google"
            style={{
              width: '100%',
              background: '#fff',
              border: '2px solid #0A0A0A',
              padding: '0.75rem',
              fontFamily: C.body,
              fontSize: '0.9rem',
              fontWeight: 500,
              color: C.black,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              transition: 'background 0.15s',
              borderRadius: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F2EB'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google Account
          </button>

          {/* Sign-up link */}
          <p style={{
            textAlign: 'center',
            fontFamily: C.body,
            fontSize: '0.85rem',
            color: C.muted,
            marginTop: '1.6rem',
          }}>
            Don&apos;t have an account?{' '}
            <Link to="/signup" style={{ color: C.orange, fontWeight: 700, textDecoration: 'underline' }}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
