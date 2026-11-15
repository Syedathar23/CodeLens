import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import { useNavigate } from 'react-router-dom'

const aiAPI = axios.create({ baseURL: 'http://localhost:8000' })

const C = {
  cream: '#F5F2EB',
  black: '#0A0A0A',
  orange: '#E8440A',
  yellow: '#F5B800',
  muted: '#6B6862',
  border: '2px solid #0A0A0A',
  shadow: '4px 4px 0 #0A0A0A',
  grayLight: '#ECEAE4',
  grayMid: '#D9D6CF',
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div
      style={{
        background: '#fff',
        border: C.border,
        boxShadow: C.shadow,
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        transition: 'transform 0.1s, box-shadow 0.1s',
        cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 #0A0A0A' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = C.shadow }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: C.muted,
        }}>{label}</span>
        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: C.muted }}>{icon}</span>
      </div>
      <p style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 900,
        fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
        lineHeight: 1,
        color: accent || C.black,
        margin: 0,
      }}>{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentReviews, setRecentReviews] = useState([])
  const [skillProgress, setSkillProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const userName = localStorage.getItem('userName') || 'Developer'
  const userId = localStorage.getItem('userId')

  useEffect(() => {
    if (!userId || userId === 'undefined' || userId === 'null') { setLoading(false); return }
    setLoading(true)
    aiAPI.get(`/dashboard/${userId}`)
      .then(res => {
        const data = res.data
        setStats({
          reviewsToday: data.reviews_today || 0,
          avgScore: data.avg_score ? parseFloat(data.avg_score).toFixed(1) : '0',
          monthlyGrowth: data.improvement !== undefined
            ? (data.improvement >= 0 ? `+${parseFloat(data.improvement).toFixed(1)}` : `${parseFloat(data.improvement).toFixed(1)}`)
            : '+0',
          longestStreak: data.current_streak || 0,
        })
        setRecentReviews(data.recent_reviews || [])
        setSkillProgress(data.language_stats || [])
      })
      .catch(err => {
        console.error('Dashboard fetch failed:', err)
        setError('Could not load dashboard data.')
      })
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <Layout>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: 110, background: C.grayLight, border: C.border, boxShadow: C.shadow }} />
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(1.5rem, 3vw, 2.5rem) 1rem' }}>
        
        {/* ── Top Header Bar ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
              letterSpacing: '-0.02em',
              color: C.black,
              margin: '0 0 0.25rem 0',
            }}>
              Welcome back, {userName}
            </h1>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.875rem',
              color: C.muted,
              margin: 0,
            }}>
              Your development metrics for today.
            </p>
          </div>

          {/* Streak badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: C.yellow,
            border: C.border,
            boxShadow: C.shadow,
            padding: '0.4rem 1rem',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: C.black }}>local_fire_department</span>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: C.black,
            }}>{stats?.longestStreak || 0} Day Streak</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#FEF0EB',
            border: `2px solid ${C.orange}`,
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.85rem',
            color: C.orange,
            fontWeight: 600,
          }}>{error}</div>
        )}

        {/* ── 4 Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Reviews Today"  value={stats?.reviewsToday ?? 0}         icon="code"        />
          <StatCard label="Avg Score"      value={stats?.avgScore ?? '0'}            icon="star"        />
          <StatCard label="Score Growth"   value={stats?.monthlyGrowth ?? '+0'}      icon="trending_up" accent="#22C55E" />
          <StatCard label="Current Streak" value={stats?.longestStreak ?? 0}         icon="bolt"        accent={C.yellow} />
        </div>

        {/* ── Recent Reviews Table ── */}
        <div style={{
          background: '#fff',
          border: C.border,
          boxShadow: C.shadow,
          marginBottom: '2rem',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1rem 1.25rem',
            borderBottom: C.border,
            background: C.grayLight,
          }}>
            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 900,
              fontSize: '0.95rem',
              letterSpacing: '-0.01em',
              color: C.black,
              margin: 0,
            }}>Recent Reviews</h2>
            <button
              onClick={() => navigate('/review')}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                fontSize: '0.72rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: 'none',
                border: 'none',
                color: C.orange,
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >View all →</button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem', minWidth: 500 }}>
              <thead>
                <tr style={{ background: C.cream }}>
                  <th style={{ padding: '0.75rem 1.25rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, borderBottom: C.border }}>
                    Language
                  </th>
                  <th style={{ padding: '0.75rem 1.25rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, borderBottom: C.border }}>
                    Score
                  </th>
                  <th style={{ padding: '0.75rem 1.25rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, borderBottom: C.border }}>
                    Issues
                  </th>
                  <th style={{ padding: '0.75rem 1.25rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, borderBottom: C.border }}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentReviews.map((review, i) => (
                  <tr
                    key={review.id || i}
                    onClick={() => {
                      if (review.session_id) {
                        localStorage.setItem('currentSessionId', review.session_id)
                        navigate('/review')
                      }
                    }}
                    style={{
                      borderBottom: '1px solid ' + C.grayMid,
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAF8F4'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <span style={{
                        display: 'inline-block',
                        background: C.grayLight,
                        border: '1px solid ' + C.grayMid,
                        padding: '0.2rem 0.5rem',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: C.black,
                      }}>
                        {review.language || 'Code'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <span style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 900,
                        fontSize: '0.9rem',
                        color: review.score >= 8 ? '#16A34A' : review.score >= 6 ? C.yellow : C.orange,
                      }}>
                        {review.score !== undefined ? `${review.score}/10` : 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.78rem',
                        color: (review.issues_count || 0) > 0 ? C.orange : '#16A34A',
                        fontWeight: 700,
                      }}>
                        {review.issues_count || 0} {(review.issues_count || 0) > 0 ? '●' : '✓'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem', color: C.muted, fontFamily: "'Inter', sans-serif" }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {recentReviews.length === 0 && (
              <div style={{
                padding: '2.5rem',
                textAlign: 'center',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.875rem',
                color: C.muted,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: C.grayMid, display: 'block', marginBottom: '0.5rem' }}>code_off</span>
                No reviews yet. Get started!
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Cards Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Language Skill Progress */}
          <div style={{ background: '#fff', border: C.border, boxShadow: C.shadow, padding: '1.25rem' }}>
            <div style={{ borderBottom: C.border, paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 900,
                fontSize: '0.95rem',
                letterSpacing: '-0.01em',
                color: C.black,
                margin: 0,
              }}>Language Skill Progress</h3>
            </div>

            {skillProgress.length === 0 ? (
              <div style={{ padding: '1rem 0', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: C.grayMid, display: 'block', marginBottom: '0.5rem' }}>bar_chart</span>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: C.muted, margin: 0 }}>No language data yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {skillProgress.map((skill, i) => {
                  const progress = Math.min(100, Math.round(skill.avg_score * 10))
                  const level = skill.avg_score >= 8 ? 'Advanced' : skill.avg_score >= 6 ? 'Intermediate' : 'Beginner'
                  const levelColor = skill.avg_score >= 8 ? '#16A34A' : skill.avg_score >= 6 ? '#D97706' : C.orange
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.8rem', color: C.black }}>
                          {skill.language}
                          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, color: C.muted, marginLeft: 6 }}>
                            ({skill.count} reviews)
                          </span>
                        </span>
                        <span style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.62rem',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: levelColor,
                          background: skill.avg_score >= 8 ? '#DCFCE7' : skill.avg_score >= 6 ? '#FEF3C7' : '#FEE2E2',
                          padding: '0.1rem 0.45rem',
                          border: `1px solid ${skill.avg_score >= 8 ? '#86EFAC' : skill.avg_score >= 6 ? '#FDE68A' : '#FECACA'}`,
                        }}>{level}</span>
                      </div>
                      <div style={{ height: 6, width: '100%', background: C.grayLight, border: '1px solid ' + C.grayMid }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: levelColor, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Action Card */}
          <div style={{
            background: C.yellow,
            border: C.border,
            boxShadow: C.shadow,
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
          }}>
            <div>
              <div style={{ display: 'inline-block', background: C.black, color: '#fff', padding: '0.2rem 0.5rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
                Fast Review
              </div>
              <h3 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 900,
                fontSize: '1.25rem',
                color: C.black,
                margin: '0 0 0.5rem 0',
                letterSpacing: '-0.02em',
              }}>
                Ready to review new code?
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: C.black, margin: 0, lineHeight: 1.6 }}>
                Submit any function, snippet, or entire file for instant linting, security audits, and architectural improvements.
              </p>
            </div>

            <button
              onClick={() => navigate('/review')}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                fontSize: '0.8rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: C.black,
                color: '#fff',
                border: C.border,
                boxShadow: '3px 3px 0 #0A0A0A',
                padding: '0.75rem 1.25rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              Start New Review →
            </button>
          </div>
        </div>

      </div>
    </Layout>
  )
}
