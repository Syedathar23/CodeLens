import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

/* ── Inline style tokens ─────────────────────────── */
const C = {
  cream: '#F5F2EB',
  black: '#0A0A0A',
  yellow: '#F5B800',
  orange: '#E8440A',
  muted: '#37342E',
  border: '4px solid #0A0A0A',
  thinBorder: '2px solid #0A0A0A',
  shadow: '5px 5px 0 #0A0A0A',
  shadowLg: '7px 7px 0 #0A0A0A',
  font: "'Space Grotesk', sans-serif",
  body: "'Inter', sans-serif",
}

function FeatureIcon({ children, color }) {
  return (
    <div style={{
      width: 52, height: 52,
      background: color,
      border: C.border,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '1rem',
      flexShrink: 0,
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 26, color: '#fff' }}>{children}</span>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: C.body }}>
      <div className="border-4 sm:border-8 md:border-[12px] lg:border-[15px] border-[#E8440A] min-h-[calc(100vh-1rem)] bg-[#F5F2EB] box-border flex flex-col">
        <Navbar />

        <div style={{ flex: 1 }}>
          {/* ── HERO ────────────────────────────────────────────────────────── */}
          <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 sm:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left */}
            <div>
              <h1 style={{
                fontFamily: C.font,
                fontWeight: 900,
                fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
                lineHeight: 1.05,
                color: C.black,
                marginBottom: '1.5rem',
                letterSpacing: '-0.03em',
              }}>
                MAKE YOUR<br />
                CODE<br />
                <div style={{
                  background: C.yellow,
                  display: 'inline-block',
                  padding: '0.4rem 1.25rem 0.2rem 0.4rem',
                  lineHeight: '1.15',
                  clipPath: 'polygon(0% 12%, 100% 0%, 98% 88%, 0% 100%)',
                  transform: 'rotate(-1.5deg)',
                  transformOrigin: 'left center',
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
                width: '100%',
                maxWidth: 280,
                position: 'relative',
                marginBottom: '2rem',
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
                    fontWeight: 800,
                    fontSize: '0.82rem',
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
            <div style={{ position: 'relative', width: '100%' }}>
              {/* Binary decoration */}
              <div className="hidden sm:block" style={{
                position: 'absolute', top: -38, right: -12,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '2.5rem', fontWeight: 700,
                color: C.black, opacity: 0.25,
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

                {/* Preview area with the hero scene image */}
                <div style={{ padding: 0, minHeight: 180, background: '#f9f7f2', display: 'flex', alignItems: 'stretch' }}>
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
          <section className="max-w-[1200px] mx-auto px-4 sm:px-8 pb-10 sm:pb-16">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, height: 2, background: C.black }} />
              <button
                onClick={() => navigate('/review')}
                style={{
                  fontFamily: C.font,
                  fontWeight: 800,
                  fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                  letterSpacing: '0.08em',
                  background: C.black,
                  color: '#fff',
                  border: C.border,
                  padding: '0.65rem 1.25rem',
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
                  width: 24, height: 24, borderRadius: '50%',
                  background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', flexShrink: 0,
                }}>▶</span>
              </button>
              <div style={{ flex: 1, height: 2, background: C.black }} />
            </div>
          </section>

          {/* ── FEATURES (Responsive 1/3 Grid) ───────────────────────────── */}
          <section className="max-w-[1200px] mx-auto px-4 sm:px-8 pb-12 sm:pb-20">
            <div style={{
              border: C.border,
              boxShadow: C.shadow,
              background: '#ECEAE4',
              padding: 'clamp(1.5rem, 4vw, 3rem)',
            }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12"
            >
              {/* Column 1 */}
              <div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {Array(7).fill(0).map((_, i) => (
                    <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: C.black }} />
                  ))}
                </div>
                <h2 style={{
                  fontFamily: C.font,
                  fontWeight: 900,
                  fontSize: 'clamp(1.25rem, 3vw, 1.6rem)',
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  color: C.black,
                  lineHeight: 1.1,
                  marginBottom: '0.75rem',
                }}>
                  Our Features
                </h2>
                <p style={{ fontFamily: C.body, fontSize: '0.875rem', color: C.muted, lineHeight: 1.7 }}>
                  CodeLens AI gives teams one unified place to plan, review, and ship code faster with integrated tools.
                </p>
              </div>

              {/* Column 2 */}
              <div className="border-t-2 lg:border-t-0 lg:border-l-2 border-[#0A0A0A] pt-6 lg:pt-0 lg:pl-8">
                <FeatureIcon color={C.yellow}>grid_view</FeatureIcon>
                <h3 style={{ fontFamily: C.font, fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem', color: C.black }}>
                  Unlimited repositories
                </h3>
                <p style={{ fontFamily: C.body, fontSize: '0.875rem', color: C.muted, lineHeight: 1.7 }}>
                  Scale your projects without worrying about arbitrary limits. Bring all your code into one solid platform.
                </p>
              </div>

              {/* Column 3 */}
              <div className="border-t-2 lg:border-t-0 lg:border-l-2 border-[#0A0A0A] pt-6 lg:pt-0 lg:pl-8">
                <FeatureIcon color={C.orange}>speed</FeatureIcon>
                <h3 style={{ fontFamily: C.font, fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem', color: C.black }}>
                  Performance optimization
                </h3>
                <p style={{ fontFamily: C.body, fontSize: '0.875rem', color: C.muted, lineHeight: 1.7 }}>
                  Identify bottlenecks early with automated insights and actionable metrics built right into your workflow.
                </p>
              </div>
            </div>
          </section>

          {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
          <section className="max-w-[1200px] mx-auto px-4 sm:px-8 pb-12 sm:pb-20">
            <h2 style={{
              fontFamily: C.font,
              fontWeight: 900,
              fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: C.black,
              marginBottom: '2rem',
            }}>
              How it works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Paste your code', desc: 'Drop your code into the secure editor. Supports 30+ languages.', color: C.yellow },
                { step: '02', title: 'Get AI review', desc: 'Deep AI analysis in seconds. Line-by-line feedback and suggestions.', color: C.orange },
                { step: '03', title: 'Grow & improve', desc: 'Learn from suggestions, track your dev skill profile over time.', color: C.black },
              ].map(({ step, title, desc, color }) => (
                <div key={step} style={{
                  border: C.border,
                  boxShadow: C.shadow,
                  padding: 'clamp(1.25rem, 3vw, 2rem)',
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
                    fontSize: 'clamp(2.2rem, 4vw, 3rem)', color, lineHeight: 1, marginBottom: '0.75rem',
                  }}>{step}</div>
                  <h3 style={{ fontFamily: C.font, fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.5rem', color: C.black }}>
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
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {['Privacy Policy', 'Terms of Service', 'Github', 'Discord', 'Twitter'].map(link => (
                <a key={link} href="#" style={{
                  fontFamily: C.body, fontSize: '0.78rem', color: '#9a9a9a',
                  textDecoration: 'none', transition: 'color 0.15s',
                }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = '#9a9a9a'}
                >
                  {link}
                </a>
              ))}
            </div>
            <span style={{ fontFamily: C.body, fontSize: '0.75rem', color: '#888' }}>
              © 2026 CodeLens AI. Built for developers by developers.
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
