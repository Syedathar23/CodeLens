import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

/* ── Design tokens ── */
const C = {
  cream:  '#F5F2EB',
  black:  '#0A0A0A',
  yellow: '#F5B800',
  orange: '#E8440A',
  muted:  '#37342E',
  border: '4px solid #0A0A0A',
  shadow: '6px 6px 0 #0A0A0A',
  font:   "'Space Grotesk', sans-serif",
  body:   "'Inter', sans-serif",
}

/* ── Team members ── */
const TEAM = [
  {
    name:   'Syed Athar',
    role:   'Founder & Lead Engineer',
    bio:    'Full-stack developer with a deep passion for developer tools, code quality, and building experiences that make engineers faster and more confident.',
    initials: 'SA',
    accent: C.orange,
  },
  {
    name:   'AI Core',
    role:   'Powered by Google Gemini',
    bio:    'State-of-the-art language model providing deep, line-by-line code analysis, security audits, and growth-oriented developer feedback.',
    initials: 'AI',
    accent: C.yellow,
  },
  {
    name:   'You',
    role:   'The Developer',
    bio:    'Every feature in CodeLens AI is built with you in mind. Your feedback and reviews shape the direction of the platform every single day.',
    initials: 'YOU',
    accent: C.black,
  },
]

/* ── Stat items ── */
const STATS = [
  { value: '30+',    label: 'Languages Supported' },
  { value: '3',      label: 'AI Models Available' },
  { value: '100%',   label: 'Open to Feedback'    },
  { value: 'FREE',   label: 'To Get Started'      },
]

/* ── Values ── */
const VALUES = [
  {
    icon:  'auto_fix_high',
    title: 'Clarity First',
    desc:  'We believe code review feedback should be actionable, not abstract. Every suggestion comes with a reason and a fix.',
    color: C.yellow,
  },
  {
    icon:  'developer_mode',
    title: 'Built by Developers',
    desc:  'We use CodeLens AI ourselves. That means every pain point gets fixed fast because we feel it too.',
    color: C.orange,
  },
  {
    icon:  'trending_up',
    title: 'Growth Over Perfection',
    desc:  'We track your skill progression over time - not to judge, but to celebrate how far you have come.',
    color: C.black,
  },
  {
    icon:  'lock',
    title: 'Privacy Respected',
    desc:  'Your code stays your code. We never share, sell, or train on your private submissions.',
    color: C.orange,
  },
]

function TeamCard({ name, role, bio, initials, accent }) {
  return (
    <div
      style={{
        background: '#fff',
        border: C.border,
        boxShadow: C.shadow,
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'transform 0.15s, box-shadow 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform   = 'translate(-3px,-3px)'
        e.currentTarget.style.boxShadow   = '9px 9px 0 #0A0A0A'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform   = 'translate(0,0)'
        e.currentTarget.style.boxShadow   = C.shadow
      }}
    >
      <div style={{
        width: 64, height: 64,
        background: accent,
        border: C.border,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: C.font, fontWeight: 900, fontSize: '1.1rem',
        color: accent === C.yellow ? C.black : '#fff',
        flexShrink: 0,
      }}>
        {initials}
      </div>
      <div>
        <p style={{
          fontFamily: C.font, fontWeight: 900, fontSize: '1.1rem',
          color: C.black, margin: '0 0 0.2rem 0',
        }}>{name}</p>
        <p style={{
          fontFamily: C.body, fontSize: '0.75rem', fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: accent === C.black ? C.orange : accent, margin: 0,
        }}>{role}</p>
      </div>
      <p style={{
        fontFamily: C.body, fontSize: '0.875rem',
        color: C.muted, lineHeight: 1.7, margin: 0,
      }}>{bio}</p>
    </div>
  )
}

function ValueCard({ icon, title, desc, color }) {
  return (
    <div
      style={{
        background: '#fff',
        border: C.border,
        boxShadow: C.shadow,
        padding: '1.75rem',
        transition: 'transform 0.15s, box-shadow 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translate(-3px,-3px)'
        e.currentTarget.style.boxShadow = '9px 9px 0 #0A0A0A'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translate(0,0)'
        e.currentTarget.style.boxShadow = C.shadow
      }}
    >
      <div style={{
        width: 48, height: 48,
        background: color,
        border: C.border,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1rem',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 24, color: color === C.yellow ? C.black : '#fff' }}>
          {icon}
        </span>
      </div>
      <h3 style={{
        fontFamily: C.font, fontWeight: 900, fontSize: '1rem',
        color: C.black, margin: '0 0 0.5rem 0',
      }}>{title}</h3>
      <p style={{
        fontFamily: C.body, fontSize: '0.875rem',
        color: C.muted, lineHeight: 1.7, margin: 0,
      }}>{desc}</p>
    </div>
  )
}

export default function AboutUs() {
  const navigate = useNavigate()

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: C.body }}>
      <div style={{
        border: '15px solid #E8440A',
        minHeight: 'calc(100vh - 2.5rem)',
        background: C.cream,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Navbar />

        <div style={{ flex: 1 }}>

          {/* ── HERO ── */}
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 2rem 4rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>

              {/* Left copy */}
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: C.yellow, border: C.border, boxShadow: '3px 3px 0 #0A0A0A',
                  padding: '0.35rem 0.85rem', marginBottom: '1.5rem',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: C.black }}>groups</span>
                  <span style={{ fontFamily: C.font, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.black }}>
                    Our Story
                  </span>
                </div>

                <h1 style={{
                  fontFamily: C.font, fontWeight: 900,
                  fontSize: 'clamp(2.8rem, 4.5vw, 4.5rem)',
                  lineHeight: 1.05, color: C.black,
                  margin: '0 0 1.5rem 0', letterSpacing: '-0.03em',
                }}>
                  BUILT FOR<br />
                  DEVELOPERS<br />
                  <span style={{
                    background: C.orange, color: '#fff',
                    display: 'inline-block', padding: '0.2rem 0.6rem',
                  }}>BY DEVELOPERS</span>
                </h1>

                <p style={{
                  fontFamily: C.body, fontSize: '1.05rem',
                  color: C.muted, lineHeight: 1.75, margin: '0 0 2rem 0',
                  maxWidth: 460,
                }}>
                  CodeLens AI was born out of frustration with slow, surface-level code reviews.
                  We built the tool we always wished existed — one that catches real bugs, teaches
                  better patterns, and actually helps you grow as an engineer.
                </p>

                <button
                  onClick={() => navigate('/review')}
                  style={{
                    fontFamily: C.font, fontWeight: 700,
                    fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                    background: C.black, color: '#fff',
                    border: C.border, boxShadow: C.shadow,
                    padding: '0.85rem 2rem', cursor: 'pointer',
                    transition: 'transform 0.1s, box-shadow 0.1s',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background  = C.orange
                    e.currentTarget.style.transform   = 'translate(-3px,-3px)'
                    e.currentTarget.style.boxShadow   = '9px 9px 0 #0A0A0A'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background  = C.black
                    e.currentTarget.style.transform   = 'translate(0,0)'
                    e.currentTarget.style.boxShadow   = C.shadow
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>rocket_launch</span>
                  Try It Free
                </button>
              </div>

              {/* Right – Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {STATS.map(({ value, label }) => (
                  <div
                    key={label}
                    style={{
                      background: '#fff', border: C.border, boxShadow: C.shadow,
                      padding: '1.75rem 1.5rem',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translate(-3px,-3px)'
                      e.currentTarget.style.boxShadow = '9px 9px 0 #0A0A0A'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translate(0,0)'
                      e.currentTarget.style.boxShadow = C.shadow
                    }}
                  >
                    <p style={{
                      fontFamily: C.font, fontWeight: 900,
                      fontSize: '2.8rem', color: C.orange,
                      margin: '0 0 0.25rem 0', lineHeight: 1,
                    }}>{value}</p>
                    <p style={{
                      fontFamily: C.body, fontSize: '0.8rem',
                      color: C.muted, margin: 0, fontWeight: 600,
                    }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── MISSION BANNER ── */}
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 5rem' }}>
            <div style={{
              background: C.black, border: C.border, boxShadow: C.shadow,
              padding: '3rem',
              display: 'flex', alignItems: 'center', gap: '2.5rem',
              flexWrap: 'wrap',
            }}>
              <div style={{
                width: 72, height: 72, background: C.orange, border: '4px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#fff' }}>lightbulb</span>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <p style={{
                  fontFamily: C.font, fontWeight: 900, fontSize: '0.65rem',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: C.yellow, margin: '0 0 0.5rem 0',
                }}>Our Mission</p>
                <p style={{
                  fontFamily: C.font, fontWeight: 900,
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.75rem)',
                  color: '#fff', margin: 0, lineHeight: 1.3, letterSpacing: '-0.02em',
                }}>
                  Empower every developer to write better code — not just once, but consistently,
                  through intelligent and personalised feedback.
                </p>
              </div>
            </div>
          </section>

          {/* ── OUR VALUES ── */}
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 5rem' }}>
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{
                fontFamily: C.font, fontWeight: 900,
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                letterSpacing: '-0.02em', textTransform: 'uppercase',
                color: C.black, margin: 0,
              }}>What We Stand For</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {VALUES.map(v => <ValueCard key={v.title} {...v} />)}
            </div>
          </section>

          {/* ── TEAM ── */}
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <h2 style={{
                fontFamily: C.font, fontWeight: 900,
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                letterSpacing: '-0.02em', textTransform: 'uppercase',
                color: C.black, margin: 0,
              }}>The Team</h2>
              <div style={{ flex: 1, height: 4, background: C.black }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {TEAM.map(m => <TeamCard key={m.name} {...m} />)}
            </div>
          </section>

          {/* ── TIMELINE ── */}
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 5rem' }}>
            <h2 style={{
              fontFamily: C.font, fontWeight: 900,
              fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
              letterSpacing: '-0.02em', textTransform: 'uppercase',
              color: C.black, margin: '0 0 2.5rem 0',
            }}>How We Got Here</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { year: '2024', title: 'The Problem', desc: 'Frustrated by generic linting tools that never explained the "why" behind issues, the idea for CodeLens AI was born.', color: C.orange },
                { year: '2025', title: 'First Build', desc: 'Prototype launched with Gemini Flash integration. First real users. First real bugs. First real lessons.', color: C.yellow },
                { year: '2026', title: 'Full Platform', desc: 'Full-stack review platform with sessions, skill tracking, multi-model support, side-chat, and per-user analytics.', color: C.black },
              ].map(({ year, title, desc, color }, i, arr) => (
                <div
                  key={year}
                  style={{
                    display: 'flex', gap: '2rem',
                    background: '#fff', border: C.border,
                    borderBottom: i < arr.length - 1 ? 'none' : C.border,
                    padding: '2rem',
                    cursor: 'default',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <div style={{
                    fontFamily: C.font, fontWeight: 900, fontSize: '1.5rem',
                    color, minWidth: 80, flexShrink: 0,
                  }}>{year}</div>
                  <div style={{ borderLeft: `4px solid ${color}`, paddingLeft: '1.5rem' }}>
                    <h3 style={{ fontFamily: C.font, fontWeight: 900, fontSize: '1rem', color: C.black, margin: '0 0 0.5rem 0' }}>{title}</h3>
                    <p style={{ fontFamily: C.body, fontSize: '0.875rem', color: C.muted, margin: 0, lineHeight: 1.7 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA ── */}
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 5rem' }}>
            <div style={{
              background: C.yellow, border: C.border, boxShadow: C.shadow,
              padding: '3.5rem', textAlign: 'center',
            }}>
              <h2 style={{
                fontFamily: C.font, fontWeight: 900,
                fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
                letterSpacing: '-0.03em', textTransform: 'uppercase',
                color: C.black, margin: '0 0 1rem 0',
              }}>
                Ready to Level Up?
              </h2>
              <p style={{
                fontFamily: C.body, fontSize: '1rem', color: C.muted,
                margin: '0 auto 2rem auto', maxWidth: 480, lineHeight: 1.7,
              }}>
                Join developers who use CodeLens AI to catch bugs faster, write cleaner code,
                and grow their skills review by review.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/signup')}
                  style={{
                    fontFamily: C.font, fontWeight: 700, fontSize: '0.85rem',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    background: C.black, color: '#fff',
                    border: C.border, boxShadow: C.shadow,
                    padding: '0.85rem 2rem', cursor: 'pointer',
                    transition: 'transform 0.1s, box-shadow 0.1s',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translate(-3px,-3px)'
                    e.currentTarget.style.boxShadow = '9px 9px 0 #0A0A0A'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translate(0,0)'
                    e.currentTarget.style.boxShadow = C.shadow
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>person_add</span>
                  Get Started Free
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  style={{
                    fontFamily: C.font, fontWeight: 700, fontSize: '0.85rem',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    background: 'transparent', color: C.black,
                    border: C.border, boxShadow: '3px 3px 0 #0A0A0A',
                    padding: '0.85rem 2rem', cursor: 'pointer',
                    transition: 'transform 0.1s, box-shadow 0.1s',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translate(-3px,-3px)'
                    e.currentTarget.style.boxShadow = '6px 6px 0 #0A0A0A'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translate(0,0)'
                    e.currentTarget.style.boxShadow = '3px 3px 0 #0A0A0A'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>mail</span>
                  Contact Us
                </button>
              </div>
            </div>
          </section>

        </div>

        {/* ── FOOTER ── */}
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
                <a key={link} href="#" style={{
                  fontFamily: C.body, fontSize: '0.8rem', color: '#9a9a9a',
                  textDecoration: 'none', transition: 'color 0.15s',
                }}
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
    </div>
  )
}
