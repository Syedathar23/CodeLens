import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../services/api.js'

function PasswordStrength({ password }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const levels = ['', 'Weak', 'Fair', 'Strong', 'Excellent']
  const colors = ['bg-outline-variant', 'bg-error', 'bg-amber-400', 'bg-primary', 'bg-secondary']

  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= score ? colors[score] : 'bg-outline-variant/30'
            }`}
          />
        ))}
      </div>
      {password && (
        <p className={`text-[10px] mt-1 ${colors[score].replace('bg-', 'text-')}`}>
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
      navigate('/review')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex font-body">
      {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-surface-container-low border-r border-outline-variant/20">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 gradient-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-base">code</span>
          </div>
          <span className="font-headline font-bold text-lg text-on-surface">CodeLens AI</span>
        </div>

        <div>
          <h1 className="font-headline font-bold text-5xl text-on-surface leading-tight mb-4">
            CodeLens AI
          </h1>
          <p className="text-on-surface-variant text-lg tracking-widest uppercase mb-12">
            Monolithic Intelligence
          </p>
          <div className="bg-surface-container p-4 rounded-xl border-l-4 border-primary space-y-3">
            <p className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">
              Security Status
            </p>
            {[
              { label: 'SHA-256 ENCRYPTION', status: 'ACTIVE', active: true },
              { label: 'OAUTH 2.1 HANDSHAKE', status: 'READY', active: true },
              { label: 'MFA_REQUIRED_LOGIC', status: 'WAITING', active: false },
            ].map(({ label, status, active }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="font-mono-code text-[11px] text-on-surface-variant">{label}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono-code ${active ? 'text-secondary' : 'text-outline'}`}>
                  [{status}]
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-on-surface-variant">© 2026 CodeLens AI. All rights reserved.</p>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface-container rounded-2xl p-8 border border-outline-variant/20">
          <h2 className="font-headline font-bold text-2xl text-on-surface mb-1">Create your account</h2>
          <p className="text-xs text-on-surface-variant mb-8">Join the obsidian development community.</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-xs text-error">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
                  First Name
                </label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  placeholder="John"
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
                  Last Name
                </label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg pl-4 pr-10 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white">
                  <span className="material-symbols-outlined text-base">{showPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                name="agreed"
                type="checkbox"
                checked={form.agreed}
                onChange={handleChange}
                className="mt-0.5 accent-primary"
              />
              <span className="text-[11px] text-on-surface-variant">
                I agree to the{' '}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="gradient-primary w-full py-3 rounded-lg text-on-primary text-sm font-bold tracking-wide disabled:opacity-60"
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-[11px] text-on-surface-variant mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
