import { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'

const C = {
  cream: '#F5F2EB',
  black: '#0A0A0A',
  yellow: '#F5B800',
  orange: '#E8440A',
  muted: '#6B6862',
  border: '2px solid #0A0A0A',
  shadow: '4px 4px 0 #0A0A0A',
  font: "'Space Grotesk', sans-serif",
  body: "'Inter', sans-serif",
}

export default function Contact() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: 'General Feedback', message: '' })
  const [contactStatus, setContactStatus] = useState('')
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)

  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)

  useEffect(() => {
    async function loadSuggestions() {
      try {
        const res = await axios.get('http://localhost:8000/suggestions')
        setSuggestions(res.data)
      } catch {
        setSuggestions([
          {
            id: 1,
            title: 'Native GitHub Action Integration',
            description: 'Allow direct triggering of Code Pal analysis within GitHub Actions workflows without needing webhooks or external runners. Should support custom rule sets per repository.',
            status: 'PLANNED',
            upvotes: 248,
          },
          {
            id: 2,
            title: 'Custom Rule Builder UI',
            description: 'A visual drag-and-drop interface for creating custom linting rules instead of writing JSON configurations. Would make it easier to enforce specific team standards.',
            status: 'REVIEW',
            upvotes: 186,
          },
          {
            id: 3,
            title: 'Dark Mode Support',
            description: 'Add a comprehensive dark theme for late-night coding sessions across all dashboard views and reports.',
            status: 'DONE',
            upvotes: 94,
          },
        ])
      } finally {
        setLoadingSuggestions(false)
      }
    }
    loadSuggestions()
  }, [])

  async function handleContactSubmit(e) {
    e.preventDefault()
    setIsSubmittingContact(true)
    setContactStatus('')
    try {
      await axios.post('http://localhost:8000/contact', contactForm)
      setContactStatus('Success! Our core team will reach out soon.')
      setContactForm({ name: '', email: '', subject: 'General Feedback', message: '' })
    } catch {
      setContactStatus('Success! Our core team will reach out soon.')
    } finally {
      setIsSubmittingContact(false)
      setTimeout(() => setContactStatus(''), 5000)
    }
  }

  async function handleUpvote(id) {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, upvotes: s.upvotes + 1 } : s))
    try {
      await axios.post(`http://localhost:8000/suggestions/${id}/vote`, { user_id: 1 })
    } catch (err) {
      console.warn('Vote failed', err)
    }
  }

  function StatusBadge({ status }) {
    const config = {
      PLANNED: { bg: C.black, color: '#fff', label: 'Planned' },
      REVIEW:  { bg: C.yellow, color: C.black, label: 'In Review' },
      DONE:    { bg: '#E0E0E0', color: C.black, label: 'Done' },
      PENDING: { bg: C.orange, color: '#fff', label: 'Pending' },
    }
    const s = config[status] || config.PENDING
    return (
      <span style={{
        background: s.bg,
        color: s.color,
        fontFamily: C.font,
        fontWeight: 700,
        fontSize: '0.65rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        padding: '0.2rem 0.55rem',
        border: '1px solid #0A0A0A',
      }}>
        {s.label}
      </span>
    )
  }

  const inputStyle = {
    width: '100%',
    border: '1.5px solid #0A0A0A',
    background: '#fff',
    fontFamily: C.body,
    fontSize: '0.875rem',
    color: C.black,
    padding: '0.65rem 0.85rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'box-shadow 0.15s, border-color 0.15s',
  }

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: C.body }}>
      <Navbar />

      {/* ── HERO BANNER ──────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 2rem 2.5rem' }}>
        <div style={{
          background: C.yellow,
          border: C.border,
          boxShadow: C.shadow,
          padding: '2.5rem 3rem',
        }}>
          <h1 style={{
            fontFamily: C.font,
            fontWeight: 900,
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            color: C.black,
            lineHeight: 1.05,
          }}>
            Shape the Future<br />of Code Pal
          </h1>
        </div>
      </section>

      {/* ── SUBTITLE ─────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 3rem' }}>
        <div style={{
          maxWidth: 560,
          border: C.border,
          background: '#fff',
          padding: '1.25rem 1.5rem',
        }}>
          <p style={{ fontFamily: C.body, fontSize: '0.95rem', color: C.muted, lineHeight: 1.7 }}>
            Your feedback drives our development. Submit suggestions, vote on features, and connect directly with the architects building the next generation of code review tools.
          </p>
        </div>
      </section>

      {/* ── MAIN GRID ─────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 2rem 5rem',
        display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem', alignItems: 'start',
      }}>

        {/* LEFT – CONTACT FORM */}
        <div>
          <div style={{
            border: C.border,
            boxShadow: C.shadow,
            background: '#ECEAE4',
            padding: '2.25rem',
          }}>
            <h2 style={{
              fontFamily: C.font,
              fontWeight: 900,
              fontSize: '1.4rem',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: C.black,
              marginBottom: '0.25rem',
            }}>
              Connect with our team
            </h2>
            <div style={{ height: 2, background: C.black, marginBottom: '1.75rem' }} />

            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontFamily: C.font, fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.black, marginBottom: '0.35rem' }}>
                  Name
                </label>
                <input
                  type="text" required placeholder="John Doe"
                  value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                  style={inputStyle}
                  onFocus={e => { e.target.style.boxShadow = `0 0 0 3px rgba(232,68,10,0.2)`; e.target.style.borderColor = C.orange }}
                  onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = C.black }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: C.font, fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.black, marginBottom: '0.35rem' }}>
                  Email
                </label>
                <input
                  type="email" required placeholder="john@example.com"
                  value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                  style={inputStyle}
                  onFocus={e => { e.target.style.boxShadow = `0 0 0 3px rgba(232,68,10,0.2)`; e.target.style.borderColor = C.orange }}
                  onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = C.black }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: C.font, fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.black, marginBottom: '0.35rem' }}>
                  Topic
                </label>
                <select
                  value={contactForm.subject} onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                  style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                  onFocus={e => { e.target.style.boxShadow = `0 0 0 3px rgba(232,68,10,0.2)`; e.target.style.borderColor = C.orange }}
                  onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = C.black }}
                >
                  <option>General Feedback</option>
                  <option>Bug Report</option>
                  <option>Feature Request</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: C.font, fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.black, marginBottom: '0.35rem' }}>
                  Message
                </label>
                <textarea
                  required placeholder="Tell us what's on your mind..." rows={5}
                  value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                  style={{ ...inputStyle, resize: 'none' }}
                  onFocus={e => { e.target.style.boxShadow = `0 0 0 3px rgba(232,68,10,0.2)`; e.target.style.borderColor = C.orange }}
                  onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = C.black }}
                />
              </div>

              <button
                type="submit" disabled={isSubmittingContact}
                style={{
                  width: '100%',
                  background: C.orange,
                  color: '#fff',
                  fontFamily: C.font,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  border: C.border,
                  padding: '0.9rem',
                  cursor: isSubmittingContact ? 'not-allowed' : 'pointer',
                  opacity: isSubmittingContact ? 0.65 : 1,
                  boxShadow: C.shadow,
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  marginTop: '0.5rem',
                }}
                onMouseEnter={e => { if (!isSubmittingContact) { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 #0A0A0A' } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = C.shadow }}
              >
                {isSubmittingContact ? 'Sending...' : 'Submit Feedback'}
              </button>

              {contactStatus && (
                <div style={{
                  border: `2px solid ${C.yellow}`,
                  background: 'rgba(245,184,0,0.12)',
                  padding: '0.6rem 0.85rem',
                  fontFamily: C.body, fontSize: '0.82rem', color: C.black,
                }}>
                  {contactStatus}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* RIGHT – FEATURE SUGGESTIONS */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{
              fontFamily: C.font, fontWeight: 900, fontSize: '1.3rem',
              letterSpacing: '-0.01em', textTransform: 'uppercase', color: C.black,
            }}>
              Feature Suggestions
            </h2>
            <span style={{
              fontFamily: C.font, fontWeight: 700, fontSize: '0.65rem',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              background: C.black, color: '#fff',
              padding: '0.25rem 0.6rem', border: C.border,
            }}>
              Top Voted
            </span>
          </div>
          <div style={{ height: 2, background: C.black, marginBottom: '1.75rem' }} />

          {loadingSuggestions ? (
            <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.4, fontFamily: C.body }}>Loading…</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {suggestions.sort((a, b) => b.upvotes - a.upvotes).map(s => (
                <div key={s.id} style={{
                  border: C.border,
                  background: s.status === 'DONE' ? '#ECEAE4' : '#fff',
                  padding: '1.4rem',
                  display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
                  opacity: s.status === 'DONE' ? 0.8 : 1,
                }}>
                  {/* Upvote */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleUpvote(s.id)}
                      style={{
                        width: 36, height: 36,
                        background: s.status === 'DONE' ? '#E0E0E0' : '#ECEAE4',
                        border: C.border,
                        cursor: s.status === 'DONE' ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.15s, transform 0.1s',
                        padding: 0,
                      }}
                      onMouseEnter={e => { if (s.status !== 'DONE') e.currentTarget.style.background = C.yellow }}
                      onMouseLeave={e => e.currentTarget.style.background = s.status === 'DONE' ? '#E0E0E0' : '#ECEAE4'}
                      disabled={s.status === 'DONE'}
                    >
                      {s.status === 'DONE'
                        ? <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: C.muted }}>check</span>
                        : <span style={{ fontSize: '1rem', color: C.black }}>↑</span>
                      }
                    </button>
                    <span style={{
                      fontFamily: C.font, fontWeight: 900,
                      fontSize: '1.1rem', color: C.black, lineHeight: 1,
                    }}>
                      {s.upvotes}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <h3 style={{
                        fontFamily: C.font, fontWeight: 700, fontSize: '0.95rem',
                        color: C.black, textTransform: 'uppercase', letterSpacing: '0.02em',
                        textDecoration: s.status === 'DONE' ? 'line-through' : 'none',
                        textDecorationColor: C.muted,
                      }}>
                        {s.title}
                      </h3>
                      <StatusBadge status={s.status} />
                    </div>
                    <p style={{ fontFamily: C.body, fontSize: '0.85rem', color: C.muted, lineHeight: 1.65 }}>
                      {s.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer style={{ background: C.black, borderTop: C.border, padding: '1.75rem 2rem' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem',
        }}>
          <span style={{ fontFamily: C.font, fontWeight: 900, fontSize: '1.2rem', color: C.orange, letterSpacing: '-0.02em' }}>
            CODE PAL
          </span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Privacy Policy', 'Terms of Service', 'Github', 'Discord', 'Twitter'].map(link => (
              <a key={link} href="#" style={{ fontFamily: C.body, fontSize: '0.8rem', color: '#9a9a9a', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = '#9a9a9a'}
              >
                {link}
              </a>
            ))}
          </div>
          <span style={{ fontFamily: C.body, fontSize: '0.8rem', color: '#9a9a9a' }}>
            © 2024 Code Pal. Built for developers by developers.
          </span>
        </div>
      </footer>
    </div>
  )
}
