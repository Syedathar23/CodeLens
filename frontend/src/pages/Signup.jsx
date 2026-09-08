import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../services/api.js'

const C = {
  cream: '#F5F2EB',
  black: '#0A0A0A',
  yellow: '#F5B800',
  orange: '#E8440A',
  muted: '#4A4845',
  border: '3px solid #0A0A0A',
  shadow: '6px 6px 0 #0A0A0A',
  shadowLg: '10px 10px 0 #0A0A0A',
  font: "'Space Grotesk', sans-serif",
  body: "'Inter', sans-serif",
}

function PasswordStrength({ password }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const levels = ['', 'Weak', 'Fair', 'Strong', 'Excellent']
  const colors = ['bg-cp-muted', 'text-cp-orange', 'text-cp-yellow', 'text-cp-yellow', 'text-green-600']

  return (
    <div style={{ marginTop: '0.45rem' }}>
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              height: 4,
              flex: 1,
              background: i <= score 
                ? (score === 1 ? C.orange : score <= 3 ? C.yellow : '#16A34A') 
                : '#D9D6CF',
              transition: 'background-color 0.15s',
            }}
          />
        ))}
      </div>
      {password && (
        <p style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          marginTop: '0.25rem',
          fontFamily: C.font,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: score === 1 ? C.orange : score <= 3 ? C.yellow : '#16A34A'
        }}>
          {levels[score]}
        </p>
      )}
    </div>
  )
}

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreed: false,
  })
  const [showPw, setShowPw] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!form.agreed) {
      setError('Please accept the terms to continue.')
      return
    }

    const fullName = `${form.firstName} ${form.lastName}`.trim()
    setIsLoading(true)
    try {
      const { token, user } = await signup(fullName, form.email, form.password)
      localStorage.setItem('token', token)
      localStorage.setItem('userId', user.id)
      localStorage.setItem('userName', user.name)
      localStorage.setItem('userEmail', user.email)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    border: '3px solid #0A0A0A',
    background: '#FAFAF8',
    fontFamily: C.body,
    fontSize: '0.95rem',
    color: C.black,
    padding: '0.85rem 1.05rem',
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

      {/* ── Checkered background pattern ────────────────────────────── */}
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
        backgroundSize: '12px 12px',
      }} />

      {/* ── Floating decoration shapes (matching login scale) ───────── */}
      <div style={{
        position: 'absolute', top: '10%', left: '8%',
        width: 150, height: 150,
        background: C.orange, border: '4px solid #0A0A0A',
        transform: 'rotate(-9deg)', zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '9%',
        width: 170, height: 170,
        background: C.yellow, border: '4px solid #0A0A0A',
        transform: 'rotate(11deg)', zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', top: '44%', right: '23%',
        width: 108, height: 108,
        borderRadius: '50%',
        background: '#fff', border: '4px solid #0A0A0A', zIndex: 1,
      }} />

      {/* ── Signup card ──────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 2,
        background: '#fff',
        border: '4px solid #0A0A0A',
        boxShadow: C.shadowLg,
        width: '100%', maxWidth: 480,
        overflow: 'hidden',
      }}>

        {/* ── Card header bar ─────────────────────────────────────────── */}
        <div style={{
          background: C.yellow,
          borderBottom: '4px solid #0A0A0A',
          padding: '0.9rem 1.1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{
            fontFamily: "'bold', sans-serif",
            fontWeight: 800,
            fontSize: '0.95rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: C.black,
          }}>
            System Registration
          </span>

          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            border: '3px solid #0A0A0A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            marginRight: '-2px',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#0A0A0A' }} />
          </div>
        </div>

        {/* ── Card body ───────────────────────────────────────────────── */}
        <div style={{ padding: '2.25rem 2rem' }}>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h1 style={{
              fontFamily: "'bold', sans-serif",
              fontWeight: 900,
              fontSize: '2.5rem',
              letterSpacing: '-0.04em',
              color: C.black,
              marginBottom: '0.5rem',
              lineHeight: 1,
            }}>
              SIGNUP
            </h1>
            <p style={{
              fontFamily: C.body,
              fontSize: '0.95rem',
              color: '#1A1A1A',
              letterSpacing: '0.02em',
              marginTop: '0.4rem',
            }}>
              Join the developer workspace
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontFamily: C.font, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.black, marginBottom: '0.45rem' }}>
                  First Name
                </label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  placeholder="John"
                  style={inputStyle}
                  onFocus={e => { e.target.style.boxShadow = '0 0 0 3px rgba(232,68,10,0.25)'; e.target.style.borderColor = C.orange }}
                  onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = C.black }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: C.font, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.black, marginBottom: '0.45rem' }}>
                  Last Name
                </label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                  style={inputStyle}
                  onFocus={e => { e.target.style.boxShadow = '0 0 0 3px rgba(232,68,10,0.25)'; e.target.style.borderColor = C.orange }}
                  onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = C.black }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontFamily: C.font, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.black, marginBottom: '0.45rem' }}>
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={e => { e.target.style.boxShadow = '0 0 0 3px rgba(232,68,10,0.25)'; e.target.style.borderColor = C.orange }}
                onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = C.black }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontFamily: C.font, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.black, marginBottom: '0.45rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '2.75rem' }}
                  onFocus={e => { e.target.style.boxShadow = '0 0 0 3px rgba(232,68,10,0.25)'; e.target.style.borderColor = C.orange }}
                  onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = C.black }}
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
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontFamily: C.font, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.black, marginBottom: '0.45rem' }}>
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={inputStyle}
                onFocus={e => { e.target.style.boxShadow = '0 0 0 3px rgba(232,68,10,0.25)'; e.target.style.borderColor = C.orange }}
                onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = C.black }}
              />
            </div>

            {/* Terms checkbox */}
            <label style={{ display: 'flex', alignItems: 'start', gap: '0.6rem', cursor: 'pointer', margin: '0.35rem 0' }}>
              <input
                name="agreed"
                type="checkbox"
                checked={form.agreed}
                onChange={handleChange}
                style={{
                  width: 18, height: 18,
                  accentColor: C.orange,
                  cursor: 'pointer',
                  border: '2px solid #0A0A0A',
                  marginTop: 2,
                }}
              />
              <span style={{ fontSize: '0.8rem', color: C.black, lineHeight: 1.4 }}>
                I agree to the{' '}
                <a href="#" style={{ color: C.orange, fontWeight: 700, textDecoration: 'underline' }}>Terms of Service</a>
                {' '}and{' '}
                <a href="#" style={{ color: C.orange, fontWeight: 700, textDecoration: 'underline' }}>Privacy Policy</a>
              </span>
            </label>

            {/* Submit */}
            <button
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
                padding: '1.2rem 0',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.65 : 1,
                transition: 'transform 0.1s, box-shadow 0.1s',
                boxShadow: '6px 6px 0 #0A0A0A',
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
              {isLoading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          {/* Signin link */}
          <p style={{
            textAlign: 'center',
            fontFamily: C.body,
            fontSize: '0.85rem',
            color: C.muted,
            marginTop: '1.6rem',
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: C.orange, fontWeight: 700, textDecoration: 'underline' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
