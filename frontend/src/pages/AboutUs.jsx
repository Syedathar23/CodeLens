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
  thinBorder: '2px solid #0A0A0A',
  shadow: '5px 5px 0 #0A0A0A',
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
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'transform 0.15s, box-shadow 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform   = 'translate(-2px,-2px)'
        e.currentTarget.style.boxShadow   = '7px 7px 0 #0A0A0A'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform   = 'translate(0,0)'
        e.currentTarget.style.boxShadow   = C.shadow
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: 50, height: 50,
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
          <h3 style={{
            fontFamily: C.font, fontWeight: 900, fontSize: '1.05rem',
            color: C.black, margin: 0, lineHeight: 1.2,
          }}>{name}</h3>
          <p style={{
            fontFamily: C.font, fontWeight: 700, fontSize: '0.65rem',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: C.orange, margin: '2px 0 0 0',
          }}>{role}</p>
        </div>
      </div>
      <p style={{
        fontFamily: C.body, fontSize: '0.85rem',
        color: C.muted, lineHeight: 1.65, margin: 0,
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
        padding: '1.5rem',
        transition: 'transform 0.15s, box-shadow 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform   = 'translate(-2px,-2px)'
        e.currentTarget.style.boxShadow   = '7px 7px 0 #0A0A0A'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform   = 'translate(0,0)'
        e.currentTarget.style.boxShadow   = C.shadow
      }}
    >
      <div style={{
        width: 44, height: 44,
        background: color,
        border: C.border,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1rem',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 22, color: color === C.yellow ? C.black : '#fff' }}>
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
      <div className="border-4 sm:border-8 md:border-[12px] lg:border-[15px] border-[#E8440A] min-h-[calc(100vh-1rem)] bg-[#F5F2EB] box-border flex flex-col">
        <Navbar />

        <div style={{ flex: 1 }}>

          {/* ── HERO ── */}
          <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 sm:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

              {/* Left copy */}
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: C.yellow, border: C.border, boxShadow: '3px 3px 0 #0A0A0A',
                  padding: '0.35rem 0.85rem', marginBottom: '1.25rem',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: C.black }}>groups</span>
                  <span style={{ fontFamily: C.font, fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.black }}>
                    Our Story
                  </span>
                </div>

                <h1 style={{
                  fontFamily: C.font, fontWeight: 900,
                  fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
                  lineHeight: 1.05, color: C.black,
                  margin: '0 0 1.25rem 0', letterSpacing: '-0.03em',
                }}>
                  BUILT FOR<br />
                  DEVELOPERS<br />
                  <span style={{
                    background: C.orange, color: '#fff',
                    display: 'inline-block', padding: '0.2rem 0.6rem',
                  }}>BY DEVELOPERS</span>
                </h1>

                <p style={{
                  fontFamily: C.body, fontSize: '1rem',
                  color: C.muted, lineHeight: 1.7, margin: '0 0 1.75rem 0',
                  maxWidth: 480,
                }}>
                  CodeLens AI was born out of frustration with slow, surface-level code reviews.
                  We built the tool we always wished existed — one that catches real bugs, teaches
                  better patterns, and actually helps you grow as an engineer.
                </p>

                <button
                  onClick={() => navigate('/review')}
                  style={{
                    fontFamily: C.font, fontWeight: 800,
                    fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                    background: C.black, color: '#fff',
                    border: C.border, boxShadow: C.shadow,
                    padding: '0.75rem 1.75rem', cursor: 'pointer',
                    transition: 'transform 0.1s, box-shadow 0.1s',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background  = C.orange
                    e.currentTarget.style.transform   = 'translate(-2px,-2px)'
                    e.currentTarget.style.boxShadow   = '7px 7px 0 #0A0A0A'
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
              <div className="grid grid-cols-2 gap-4">
                {STATS.map(({ value, label }) => (
                  <div
                    key={label}
                    style={{
                      background: '#fff', border: C.border, boxShadow: C.shadow,
                      padding: '1.25rem',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translate(-2px,-2px)'
                      e.currentTarget.style.boxShadow = '7px 7px 0 #0A0A0A'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translate(0,0)'
                      e.currentTarget.style.boxShadow = C.shadow
                    }}
                  >
                    <p style={{
                      fontFamily: C.font, fontWeight: 900,
                      fontSize: 'clamp(2rem, 4vw, 2.7rem)', color: C.orange,
                      margin: '0 0 0.25rem 0', lineHeight: 1,
                    }}>{value}</p>
                    <p style={{
                      fontFamily: C.body, fontSize: '0.75rem',
                      color: C.muted, margin: 0, fontWeight: 700,
                    }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── MISSION BANNER ── */}
          <section className="max-w-[1200px] mx-auto px-4 sm:px-8 pb-12 sm:pb-20">
            <div style={{
              background: C.black, border: C.border, boxShadow: C.shadow,
              padding: 'clamp(1.5rem, 4vw, 3rem)',
              display: 'flex', alignItems: 'center', gap: '1.5rem',
              flexWrap: 'wrap',
            }}>
              <div style={{
                width: 60, height: 60, background: C.orange, border: '3px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 30, color: '#fff' }}>lightbulb</span>
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <p style={{
                  fontFamily: C.font, fontWeight: 900, fontSize: '0.65rem',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: C.yellow, margin: '0 0 0.4rem 0',
                }}>Our Mission</p>
                <p style={{
                  fontFamily: C.font, fontWeight: 900,
                  fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)',
                  color: '#fff', margin: 0, lineHeight: 1.35, letterSpacing: '-0.02em',
                }}>
                  Empower every developer to write better code — not just once, but consistently,
                  through intelligent and personalised feedback.
                </p>
              </div>
            </div>
          </section>

          {/* ── OUR VALUES ── */}
          <section className="max-w-[1200px] mx-auto px-4 sm:px-8 pb-12 sm:pb-20">
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontFamily: C.font, fontWeight: 900,
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                letterSpacing: '-0.02em', textTransform: 'uppercase',
                color: C.black, margin: 0,
              }}>What We Stand For</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {VALUES.map(v => <ValueCard key={v.title} {...v} />)}
            </div>
          </section>

          {/* ── TEAM ── */}
          <section className="max-w-[1200px] mx-auto px-4 sm:px-8 pb-12 sm:pb-20">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <h2 style={{
                fontFamily: C.font, fontWeight: 900,
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                letterSpacing: '-0.02em', textTransform: 'uppercase',
                color: C.black, margin: 0,
              }}>The Team</h2>
              <div style={{ flex: 1, height: 3, background: C.black }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEAM.map(m => <TeamCard key={m.name} {...m} />)}
            </div>
          </section>

          {/* ── TIMELINE ── */}
          <section className="max-w-[1200px] mx-auto px-4 sm:px-8 pb-12 sm:pb-20">
            <h2 style={{
              fontFamily: C.font, fontWeight: 900,
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
              letterSpacing: '-0.02em', textTransform: 'uppercase',
              color: C.black, margin: '0 0 2rem 0',
            }}>How We Got Here</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { year: '2024', title: 'The Problem', desc: 'Frustrated by generic linting tools that never explained the "why" behind issues, the idea for CodeLens AI was born.', color: C.orange },
                { year: '2025', title: 'First Build', desc: 'Prototype launched with Gemini Flash integration. First real users. First real bugs. First real lessons.', color: C.yellow },
                { year: '2026', title: 'Full Platform', desc: 'Full-stack review platform with sessions, skill tracking, multi-model support, side-chat, and per-user analytics.', color: C.black },
              ].map(({ year, title, desc, color }, i, arr) => (
                <div
                  key={year}
                  className="flex flex-col sm:flex-row gap-4 sm:gap-8"
                  style={{
                    background: '#fff', border: C.border,
                    borderBottom: i < arr.length - 1 ? 'none' : C.border,
                    padding: 'clamp(1.25rem, 3vw, 2rem)',
                    cursor: 'default',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <div style={{
                    fontFamily: C.font, fontWeight: 900, fontSize: '1.4rem',
                    color, minWidth: 64, flexShrink: 0,
                  }}>{year}</div>
                  <div className="border-l-4 sm:border-l-4 pl-4 sm:pl-6" style={{ borderColor: color }}>
                    <h3 style={{ fontFamily: C.font, fontWeight: 900, fontSize: '1rem', color: C.black, margin: '0 0 0.4rem 0' }}>{title}</h3>
                    <p style={{ fontFamily: C.body, fontSize: '0.85rem', color: C.muted, margin: 0, lineHeight: 1.65 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── FOOTER ── */}
        <footer style={{
          background: C.black,
          borderTop: C.border,
          padding: '1.5rem 1.25rem',
        }}>
          <div style={{
            maxWidth: 1200, margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1rem',
          }}>
            <span style={{ fontFamily: C.font, fontWeight: 900, fontSize: '1.15rem', color: C.orange, letterSpacing: '-0.02em' }}>
              CODELENS AI
            </span>
            <span style={{ fontFamily: C.body, fontSize: '0.75rem', color: '#888' }}>
              © 2026 CodeLens AI. Built for developers by developers.
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
