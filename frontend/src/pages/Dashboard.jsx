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
        padding: '1.5rem',
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
          fontSize: '0.62rem',
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
        fontSize: '2.5rem',
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
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: 120, background: C.grayLight, border: C.border, boxShadow: C.shadow }} />
            ))}
          </div>
          <div style={{ height: 280, background: C.grayLight, border: C.border, boxShadow: C.shadow, marginBottom: '2rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ height: 160, background: C.grayLight, border: C.border, boxShadow: C.shadow }} />
            <div style={{ height: 160, background: C.grayLight, border: C.border, boxShadow: C.shadow }} />
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 900,
              fontSize: '2rem',
              letterSpacing: '-0.03em',
              color: C.black,
              margin: 0,
              marginBottom: '0.25rem',
            }}>Welcome back, {userName}</h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: C.muted, margin: 0 }}>
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
              fontWeight: 700,
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
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
            padding: '1.1rem 1.5rem',
            borderBottom: C.border,
            background: C.grayLight,
          }}>
            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 900,
              fontSize: '1rem',
              letterSpacing: '-0.01em',
              color: C.black,
              margin: 0,
            }}>Recent Reviews</h2>
            <button
              onClick={() => navigate('/review')}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: '0.7rem',
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
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: C.cream }}>
                  {['Language', 'Score', 'Model', 'Issues', 'Date'].map(h => (
                    <th key={h} style={{
                      padding: '0.65rem 1.25rem',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: C.muted,
                      borderBottom: '1px solid ' + C.grayMid,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentReviews.map((review) => (
                  <tr
                    key={review.id}
                    style={{ borderBottom: '1px solid ' + C.grayLight, cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = C.cream}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.8rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: C.orange, display: 'inline-block', flexShrink: 0,
                        }} />
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: C.black }}>
                          {review.language}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.8rem 1.25rem' }}>
                      <span style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 900,
                        fontSize: '0.85rem',
                        color: review.score >= 8 ? '#16A34A' : review.score >= 5 ? '#D97706' : C.orange,
                        background: review.score >= 8 ? '#DCFCE7' : review.score >= 5 ? '#FEF3C7' : '#FEE2E2',
                        padding: '0.15rem 0.55rem',
                        border: `1px solid ${review.score >= 8 ? '#86EFAC' : review.score >= 5 ? '#FDE68A' : '#FECACA'}`,
                      }}>
                        {review.score}/10
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem 1.25rem', color: C.muted, fontFamily: "'Inter', sans-serif" }}>
                      {review.model_used}
                    </td>
                    <td style={{ padding: '0.8rem 1.25rem' }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.78rem',
                        color: (review.issues_count || 0) > 0 ? C.orange : '#16A34A',
                        fontWeight: 700,
                      }}>
                        {review.issues_count || 0} {(review.issues_count || 0) > 0 ? '●' : '✓'}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem 1.25rem', color: C.muted, fontFamily: "'Inter', sans-serif" }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {recentReviews.length === 0 && (
              <div style={{
                padding: '3rem',
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* Language Skill Progress */}
          <div style={{ background: '#fff', border: C.border, boxShadow: C.shadow, padding: '1.5rem' }}>
            <div style={{ borderBottom: C.border, paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
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

          {/* Continue where you left off */}
          <div style={{
            background: '#fff',
            border: C.border,
            boxShadow: C.shadow,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <div style={{
                  width: 28, height: 28,
                  background: C.yellow,
                  border: C.border,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: C.black }}>
                    {recentReviews.length > 0 ? 'history' : 'play_arrow'}
                  </span>
                </div>
                <h3 style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  color: C.black,
                  margin: 0,
                }}>Continue where you left off</h3>
              </div>

              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.82rem',
                color: C.muted,
                margin: '0 0 1rem 0',
                lineHeight: 1.5,
              }}>
                {recentReviews.length > 0
                  ? `Last reviewed ${recentReviews[0].language} code — ${new Date(recentReviews[0].created_at).toLocaleDateString()}`
                  : 'Start your first code review to track your progress here.'}
              </p>

              {recentReviews.length > 0 && (
                <div style={{
                  background: C.cream,
                  border: C.border,
                  padding: '0.65rem 0.85rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.72rem',
                  color: C.muted,
                  marginBottom: '1rem',
                }}>
                  Score: {recentReviews[0].score}/10 · {recentReviews[0].issues_count || 0} issues found
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/review')}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
                {recentReviews.length > 0 ? 'arrow_forward' : 'rocket_launch'}
              </span>
              {recentReviews.length > 0 ? 'CONTINUE REVIEWING' : 'START REVIEWING'}
            </button>
          </div>

        </div>
      </div>
    </Layout>
  )
}
