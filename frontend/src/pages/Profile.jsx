import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useNavigate } from 'react-router-dom'

const aiAPI = axios.create({ baseURL: 'http://localhost:8000' })

const C = {
  cream: '#F5F2EB', black: '#0A0A0A', yellow: '#F5B800', orange: '#E8440A',
  muted: '#6B6862', border: '3px solid #0A0A0A', thinBorder: '2px solid #0A0A0A',
  shadow: '6px 6px 0 #0A0A0A', shadowLg: '10px 10px 0 #0A0A0A',
  font: "'Space Grotesk', sans-serif", body: "'Inter', sans-serif",
  grayLight: '#ECEAE4', grayMid: '#D9D6CF',
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div style={{ background: '#fff', border: C.border, boxShadow: C.shadow, padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: accent || C.orange }}>{icon}</span>
        <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: C.font, color: C.muted }}>{label}</span>
      </div>
      <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: C.font, color: C.black, lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function LanguageBar({ lang }) {
  const pct = Math.min(100, ((lang.avg_score || 0) / 10) * 100)
  const levelColor = lang.skill_level === 'Expert' ? '#16A34A' : lang.skill_level === 'Advanced' ? C.yellow : lang.skill_level === 'Intermediate' ? C.orange : C.muted
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.25rem', background: C.cream, border: C.thinBorder, boxShadow: '3px 3px 0 #0A0A0A', gap: '1.25rem' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: C.font, fontWeight: 800, fontSize: '0.85rem' }}>{lang.language}</span>
          <span style={{ fontFamily: C.font, fontWeight: 700, fontSize: '0.75rem', color: C.muted }}>{lang.total_reviews} reviews · {lang.avg_score}/10 avg</span>
        </div>
        <div style={{ height: 8, background: C.grayMid, border: '1px solid #0A0A0A', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: C.orange, transition: 'width 0.8s ease' }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem', flexShrink: 0 }}>
        <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', background: C.black, color: '#fff', fontSize: '0.6rem', fontWeight: 800, fontFamily: C.font, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{lang.skill_level}</span>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: levelColor, fontFamily: C.font }}>{lang.xp_points} XP</span>
      </div>
    </div>
  )
}

export default function Profile() {
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const userId = localStorage.getItem('userId')
  const userName = localStorage.getItem('userName') || 'Developer'
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com'
  const navigate = useNavigate()

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    aiAPI.get(`/profile/${userId}`)
      .then(res => {
        const data = res.data
        setProfileData({
          skillLevel: data.overall_level || 'Beginner', xpPoints: data.total_xp || 0,
          xpToNext: data.xp_to_next || 1000, totalReviews: data.total_reviews || 0,
          avgScore: data.avg_score ? parseFloat(data.avg_score).toFixed(1) : '0',
          bugsCaught: data.bugs_caught || 0, currentStreak: data.current_streak || 0,
          languages: data.language_profiles || [], scoreHistory: data.score_history || [],
          memberSince: data.member_since || '',
        })
      })
      .catch(() => setProfileData({ skillLevel: 'Beginner', xpPoints: 0, xpToNext: 1000, totalReviews: 0, avgScore: '0', bugsCaught: 0, currentStreak: 0, languages: [], scoreHistory: [], memberSince: '' }))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '8rem' }}>
          <div style={{ width: 40, height: 40, border: '4px solid #0A0A0A', borderTopColor: C.orange, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </Layout>
    )
  }

  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const chartData = (profileData?.scoreHistory || []).map(d => ({
    date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    score: d.score,
  }))
  const xpPct = Math.min(100, ((profileData?.xpPoints || 0) / (profileData?.xpToNext || 1000)) * 100)

  return (
    <Layout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem 6rem', fontFamily: C.body }}>

        {/* Page Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ width: 8, height: 44, background: C.orange, border: '2px solid #0A0A0A' }} />
          <h1 style={{ fontFamily: C.font, fontWeight: 900, fontSize: '2.5rem', margin: 0, letterSpacing: '-0.02em' }}>Developer Profile</h1>
        </div>

        {/* Profile Hero Card */}
        <div style={{ background: '#fff', border: C.border, boxShadow: C.shadowLg, padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <div style={{ width: 80, height: 80, background: C.yellow, border: C.border, boxShadow: C.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: C.font, fontWeight: 900, fontSize: '2rem', color: C.black }}>{initials}</span>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontFamily: C.font, fontWeight: 900, fontSize: '1.6rem', margin: '0 0 0.25rem', color: C.black }}>{userName}</h2>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: C.muted }}>{userEmail}</p>
            {profileData?.memberSince && (
              <span style={{ display: 'inline-block', background: C.grayLight, border: C.thinBorder, padding: '0.2rem 0.6rem', fontSize: '0.6rem', fontWeight: 800, fontFamily: C.font, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Member since {profileData.memberSince}
              </span>
            )}
          </div>
          <div style={{ background: C.black, color: '#fff', border: C.border, boxShadow: C.shadow, padding: '1.25rem 2rem', textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 800, fontFamily: C.font, textTransform: 'uppercase', letterSpacing: '0.15em', color: C.grayMid, marginBottom: '0.3rem' }}>Mastery Level</div>
            <div style={{ fontFamily: C.font, fontWeight: 900, fontSize: '1.4rem', color: C.yellow }}>{(profileData?.skillLevel || 'Beginner').toUpperCase()}</div>
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ height: 6, background: '#333', border: '1px solid #555', overflow: 'hidden', marginBottom: '0.35rem' }}>
                <div style={{ height: '100%', width: `${xpPct}%`, background: C.yellow, transition: 'width 0.8s ease' }} />
              </div>
              <span style={{ fontSize: '0.65rem', color: C.grayMid, fontFamily: C.font }}>{profileData?.xpPoints || 0} / {profileData?.xpToNext || 1000} XP</span>
            </div>
          </div>
          <button
            onClick={() => { localStorage.clear(); navigate('/login') }}
            style={{ background: 'transparent', border: C.thinBorder, color: C.orange, padding: '0.6rem 1.25rem', fontFamily: C.font, fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', alignSelf: 'flex-start' }}
            onMouseEnter={e => { e.currentTarget.style.background = C.orange; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.orange }}
          >
            Logout
          </button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          <StatCard label="Total Reviews"  value={profileData?.totalReviews ?? 0}        icon="code"       />
          <StatCard label="Avg Code Score" value={profileData?.avgScore ?? '0'}           icon="star"       accent={C.yellow} />
          <StatCard label="Bugs Caught"    value={profileData?.bugsCaught ?? 0}           icon="bug_report" accent="#EF4444" />
          <StatCard label="Day Streak"     value={`${profileData?.currentStreak ?? 0}d`}  icon="bolt"       accent={C.yellow} />
        </div>

        {/* Main two-col grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>

          {/* Left col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Score Timeline */}
            <div style={{ background: '#fff', border: C.border, boxShadow: C.shadow, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', background: C.grayLight, borderBottom: C.border }}>
                <h2 style={{ fontFamily: C.font, fontWeight: 900, fontSize: '1rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score Timeline</h2>
              </div>
              <div style={{ padding: '1.5rem' }}>
                {chartData.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', fontFamily: C.font, fontSize: '0.85rem', color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    No review history yet.
                  </div>
                ) : (
                  <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} barSize={28}>
                        <CartesianGrid strokeDasharray="4 4" stroke={C.grayMid} vertical={false} />
                        <XAxis dataKey="date" stroke={C.muted} fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke={C.muted} fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} />
                        <Tooltip cursor={{ fill: C.grayLight }} contentStyle={{ background: '#fff', border: '2px solid #0A0A0A', borderRadius: 0, fontFamily: C.font, fontWeight: 700, boxShadow: '4px 4px 0 #0A0A0A' }} />
                        <Bar dataKey="score" fill={C.orange} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Language Profiles */}
            {(profileData?.languages || []).length > 0 && (
              <div style={{ background: '#fff', border: C.border, boxShadow: C.shadow, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', background: C.grayLight, borderBottom: C.border }}>
                  <h2 style={{ fontFamily: C.font, fontWeight: 900, fontSize: '1rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Language Profiles</h2>
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {profileData.languages.map((lang, i) => <LanguageBar key={i} lang={lang} />)}
                </div>
              </div>
            )}
          </div>

          {/* Right col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* AI Insights */}
            <div style={{ background: C.black, border: C.border, boxShadow: C.shadow, padding: '1.5rem', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: C.yellow }}>psychology</span>
                <span style={{ fontFamily: C.font, fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.yellow }}>Architect Insights</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6, fontStyle: 'italic', color: '#D1CEC9', fontFamily: C.body }}>
                {profileData?.totalReviews === 0
                  ? '"Submit your first code review to unlock personalized insights."'
                  : `"${profileData?.avgScore}/10 average score across ${profileData?.totalReviews} reviews. You've caught ${profileData?.bugsCaught} bugs so far. Keep pushing!"`}
              </p>
            </div>

            {/* Quick Stats */}
            <div style={{ background: '#fff', border: C.border, boxShadow: C.shadow, overflow: 'hidden' }}>
              <div style={{ padding: '0.85rem 1.25rem', background: C.grayLight, borderBottom: C.border }}>
                <h3 style={{ fontFamily: C.font, fontWeight: 900, fontSize: '0.8rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Stats</h3>
              </div>
              <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { label: 'Total XP Earned', value: (profileData?.xpPoints || 0).toLocaleString(), color: C.orange },
                  { label: 'Languages Used',  value: (profileData?.languages || []).length,          color: C.black },
                  { label: 'Bugs Caught',     value: profileData?.bugsCaught || 0,                   color: '#EF4444' },
                  { label: 'Day Streak',      value: `${profileData?.currentStreak || 0}d`,          color: C.yellow },
                ].map((item, i, arr) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.85rem', borderBottom: i < arr.length - 1 ? `1px solid ${C.grayMid}` : 'none' }}>
                    <span style={{ fontSize: '0.8rem', color: C.muted, fontFamily: C.body }}>{item.label}</span>
                    <span style={{ fontFamily: C.font, fontWeight: 900, fontSize: '0.95rem', color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => navigate('/review')}
              style={{ width: '100%', background: C.orange, border: C.border, color: '#fff', padding: '1rem', fontFamily: C.font, fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', boxShadow: C.shadow, transition: 'transform 0.1s, box-shadow 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '8px 8px 0 #0A0A0A' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = C.shadow }}
            >
              + Start New Review
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

