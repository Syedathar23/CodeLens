import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

/* ── Inline style tokens ─────────────────────────── */
const C = {
  cream: '#F5F2EB',
  black: '#0A0A0A',
  yellow: '#F5B800',
  orange: '#E8440A',
  muted: '#37342eff',
  border: '4px solid #0A0A0A',
  shadow: '6px 6px 0 #0A0A0A',
  shadowLg: '6px 6px 0 #0A0A0A',
  font: "'bold', sans-serif",
  body: "'Inter', sans-serif",
}

function FeatureIcon({ children, color }) {
  return (
    <div style={{
      width: 56, height: 56,
      background: color,
      border: C.border,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '1rem',
      flexShrink: 0,
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#fff' }}>{children}</span>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: C.body }}>
      <div style={{ border: '15px solid #E8440A', minHeight: 'calc(100vh - 2.5rem)', background: C.cream, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        <div style={{ flex: 1 }}>
          {/* ── HERO ────────────────────────────────────────────────────────── */}
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 2rem 4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
            {/* Left */}
            <div>
              <h1 style={{
                fontFamily: C.font,
                fontWeight: 900,
                fontSize: 'clamp(3rem, 5vw, 5rem)',
                lineHeight: 1.0,
                color: C.black,
                marginBottom: '1.5rem',
                letterSpacing: '-0.03em',
              }}>
                MAKE YOUR<br />
                CODE<br />
                <div style={{
                  background: C.yellow,
                  display: 'inline-block',
                  padding: '1rem 2rem 0rem 0.1rem',
                  lineHeight: '1.15',
                  clipPath: 'polygon(0% 12%, 100% 0%, 98% 88%, 0% 100%)',
                  transform: 'rotate(-1.5deg)',
                  transformOrigin: 'left center',
                  // marginTop: '0.5rem',
                  gap: '1',
                }}>
                  REVIEWS<br />
                  ROCK SOLID
                </div>
              </h1>

              {/* CTA Box */}
              <div style={{
                border: C.border,
                boxShadow: C.shadowLg,
                background: '#fff',
                padding: '1.25rem 1.5rem',
                display: 'inline-block',
                maxWidth: 280,
                position: 'relative',
                marginBottom: '2.5rem',
              }}>
                <div style={{
                  position: 'absolute', top: -14, left: 12,
                  background: C.cream, padding: '0 8px',
                  fontFamily: C.font, fontSize: '0.75rem', fontWeight: 700,
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: C.black,
                  border: C.border,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  CLA
                  <span style={{ cursor: 'pointer', opacity: 0.5 }}>_</span>
                  <span style={{ cursor: 'pointer', opacity: 0.5 }}>✕</span>
                </div>
                <button
                  onClick={() => navigate('/signup')}
                  style={{
                    fontFamily: C.font,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    background: C.black,
                    color: '#fff',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.orange}
                  onMouseLeave={e => e.currentTarget.style.background = C.black}
                >
                  START FOR FREE
                </button>
              </div>
            </div>

            {/* Right – App preview card */}
            <div style={{ position: 'relative' }}>
              {/* Binary decoration */}
              <div style={{
                position: 'absolute', top: -44, right: -12,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '2.5rem', fontWeight: 700,
                
                color: C.black, opacity: 0.3,
                letterSpacing: '0.05em', userSelect: 'none',
              }}>
                0101
              </div>

              <div style={{
                border: C.border,
                boxShadow: C.shadowLg,
                background: '#fff',
                overflow: 'hidden',
              }}>
                {/* Mock app bar */}
                <div style={{
                  background: C.black,
                  padding: '0.5rem 1rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ color: '#fff', fontFamily: C.font, fontSize: '0.75rem', fontWeight: 600 }}>Home (V3)</span>
                  <span style={{ color: '#aaa', fontSize: '0.7rem', fontFamily: C.body }}>Dashboard ↗</span>
                </div>

                {/* Preview area with the actual hero scene image */}
                <div style={{ padding: 0, minHeight: 220, background: '#f9f7f2', display: 'flex', alignItems: 'stretch' }}>
                  <img 
                    src="/hero-scene.jpg" 
                    alt="Code Pal Home Scene" 
                    style={{ width: '100%', height: 'auto', display: 'block', border: 'none' }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── WATCH APP TOUR DIVIDER ────────────────────────────────────── */}
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ flex: 1, height: 2, background: C.black }} />
              <button
                style={{
                  fontFamily: C.font,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.08em',
                  background: C.black,
                  color: '#fff',
                  border: C.border,
                  padding: '0.7rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  boxShadow: C.shadow,
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translate(-2px,-2px)'
                  e.currentTarget.style.boxShadow = C.shadowLg
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translate(0,0)'
                  e.currentTarget.style.boxShadow = C.shadow
                }}
              >
                Watch app tour
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', flexShrink: 0,
                }}>▶</span>
              </button>
              <div style={{ flex: 1, height: 2, background: C.black }} />
            </div>
          </section>

          {/* ── FEATURES ──────────────────────────────────────────────────── */}
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 5rem' }}>
            <div style={{
              border: C.border,
              boxShadow: C.shadow,
              background: '#ECEAE4',
              padding: '3rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1px 1fr 1px 1fr',
              gap: 0,
              alignItems: 'start',
            }}>
              {/* Column 1 */}
              <div style={{ paddingRight: '2.5rem' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {Array(7).fill(0).map((_, i) => (
                    <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: C.black, opacity: 1 }} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: C.black, opacity: 1 }} />
                  ))}
                </div>
                <h2 style={{
                  fontFamily: C.font,
                  fontWeight: 900,
                  fontSize: '1.5rem',
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  color: C.black,
                  lineHeight: 1.1,
                  marginBottom: '0.75rem',
                }}>
                  Our Features
                </h2>
                <p style={{ fontFamily: C.body, fontSize: '0.875rem', color: C.muted, lineHeight: 1.7 }}>
                  Code Pal gives teams one point to plan, review, and ship code faster with integrated tools.
                </p>
              </div>

              {/* Divider */}
              <div style={{ background: C.black, width: 3, height: '100%',  }} />

              {/* Column 2 */}
              <div style={{ paddingRight: '2.5rem', margin: "0px 10px 0px 40px" }}>
                <FeatureIcon color={C.yellow}>grid_view</FeatureIcon>
                <h3 style={{ fontFamily: C.font, fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', color: C.black }}>
                  Unlimited repositories
                </h3>
                <p style={{ fontFamily: C.body, fontSize: '0.875rem', color: C.muted, lineHeight: 1.7 }}>
                  Scale your projects without worrying about arbitrary limits. Bring all your code into one solid platform.
                </p>
              </div>

              {/* Divider */}
              <div style={{ background: C.black, width: 3, height: '100%'  }} />

              {/* Column 3 */}
              <div style={{margin:"0px 10px 0px 40px"}}>
                <FeatureIcon color={C.orange} >speed</FeatureIcon>
                <h3 style={{ fontFamily: C.font, fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', color: C.black }}>
                  Performance optimization
                </h3>
                <p style={{ fontFamily: C.body, fontSize: '0.875rem', color: C.muted, lineHeight: 1.7 }}>
                  Identify bottlenecks early with automated insights and actionable metrics built right into your workflow.
                </p>
              </div>
            </div>
          </section>

          {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 5rem' }}>
            <h2 style={{
              fontFamily: C.font,
              fontWeight: 900,
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: C.black,
              marginBottom: '2.5rem',
            }}>
              How it works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {[
                { step: '01', title: 'Paste your code', desc: 'Drop your code into the secure editor. Supports 30+ languages.', color: C.yellow },
                { step: '02', title: 'Get AI review', desc: 'Deep AI analysis in seconds. Line-by-line feedback and suggestions.', color: C.orange },
                { step: '03', title: 'Grow & improve', desc: 'Learn from suggestions, track your dev skill profile over time.', color: C.black },
              ].map(({ step, title, desc, color }) => (
                <div key={step} style={{
                  border: C.border,
                  boxShadow: C.shadow,
                  padding: '2rem',
                  background: '#fff',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  cursor: 'default',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translate(-3px,-3px)'
                    e.currentTarget.style.boxShadow = C.shadowLg
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translate(0,0)'
                    e.currentTarget.style.boxShadow = C.shadow
                  }}
                >
                  <div style={{
                    fontFamily: C.font, fontWeight: 900,
                    fontSize: '3rem', color, lineHeight: 1, marginBottom: '1rem',
                  }}>{step}</div>
                  <h3 style={{ fontFamily: C.font, fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', color: C.black }}>
                    {title}
                  </h3>
                  <p style={{ fontFamily: C.body, fontSize: '0.875rem', color: C.muted, lineHeight: 1.7 }}>{desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <footer style={{
          background: C.black,
          borderTop: C.border,
          padding: '1.75rem 2rem',
        }}>
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