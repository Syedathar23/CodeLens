import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useNavigate } from 'react-router-dom'

const aiAPI = axios.create({ baseURL: 'http://localhost:8000' })

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
          skillLevel: data.overall_level || 'Beginner',
          xpPoints: data.total_xp || 0,
          xpToNext: data.xp_to_next || 1000,
          totalReviews: data.total_reviews || 0,
          avgScore: data.avg_score ? parseFloat(data.avg_score).toFixed(1) : '0',
          bugsCaught: data.bugs_caught || 0,
          currentStreak: data.current_streak || 0,
          languages: data.language_profiles || [],
          scoreHistory: data.score_history || [],
          memberSince: data.member_since || ''
        })
      })
      .catch(err => {
        console.error('Profile fetch failed:', err)
        // graceful empty state
        setProfileData({
          skillLevel: 'Beginner', xpPoints: 0, xpToNext: 1000,
          totalReviews: 0, avgScore: '0', bugsCaught: 0, currentStreak: 0,
          languages: [], scoreHistory: [], memberSince: ''
        })
      })
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full pt-32">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </Layout>
    )
  }

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const chartData = (profileData?.scoreHistory || []).map(d => ({
    date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    score: d.score
  }))

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-8 overflow-y-auto pb-24">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-surface-bright flex items-center justify-center border-4 border-surface-container-high shadow-lg">
              <span className="font-headline font-bold text-3xl text-[#c4db68]">{initials}</span>
            </div>
            <div>
              <h1 className="font-headline font-bold text-3xl mb-1">{userName}</h1>
              <p className="text-on-surface-variant text-sm mb-2">{userEmail}</p>
              {profileData?.memberSince && (
                <span className="text-[10px] uppercase tracking-widest text-secondary font-bold bg-secondary/10 px-2 py-1 rounded">
                  {profileData.memberSince}
                </span>
              )}
            </div>
          </div>
          <button className="px-5 py-2.5 rounded-lg border border-red text-red text-xs font-bold uppercase tracking-wider hover:bg-red-500 transition-colors shrink-0">
            Logout
          </button>
          
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Column */}
          <div className="flex-1 space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Reviews', value: profileData?.totalReviews ?? 0 },
                { label: 'Avg Code Score', value: profileData?.avgScore ?? '0' },
                { label: 'Bugs Caught', value: profileData?.bugsCaught ?? 0 },
                { label: 'Current Streak', value: `${profileData?.currentStreak ?? 0} days` },
              ].map((s, i) => (
                <div key={i} className="bg-surface-container p-4 rounded-xl border border-outline-variant/20">
                  <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="font-headline font-bold text-2xl">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Score Timeline Chart */}
            <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/20">
              <h3 className="font-headline font-bold text-lg mb-6">Score Timeline</h3>
              {chartData.length === 0 ? (
                <p className="text-on-surface-variant text-sm text-center py-8">No review history yet.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                      <XAxis dataKey="date" stroke="#adaaaa" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#adaaaa" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                      <Tooltip cursor={{ fill: '#262626' }} contentStyle={{ backgroundColor: '#202020', border: 'none', borderRadius: '8px', color: '#fff' }} />
                      <Bar dataKey="score" fill="#20B2AA" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Language Profiles */}
            {(profileData?.languages || []).length > 0 && (
              <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/20">
                <h3 className="font-headline font-bold text-lg mb-6">Language Profiles</h3>
                <div className="space-y-3">
                  {profileData.languages.map((lang, i) => (
                    <div key={i} className="flex items-center justify-between bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
                      <div>
                        <p className="text-xs font-bold">{lang.language}</p>
                        <p className="text-[10px] text-on-surface-variant">{lang.total_reviews} reviews · avg {lang.avg_score}/10</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-primary/20 text-primary">
                          {lang.skill_level}
                        </span>
                        <span className="text-[10px] text-secondary font-bold">{lang.xp_points} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column */}
          <div className="w-full lg:w-80 space-y-6 shrink-0">
            
            {/* Mastery Card */}
            <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/20 glow-primary">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Current Mastery</p>
              <h2 className="font-headline font-bold text-3xl text-[#c4db68] mb-6">
                {(profileData?.skillLevel || 'Beginner').toUpperCase()}
              </h2>
              <div className="h-1.5 w-full bg-outline-variant/30 rounded-full mb-2 overflow-hidden">
                <div 
                  className="h-full bg-[#c4db68] rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, ((profileData?.xpPoints || 0) / (profileData?.xpToNext || 1000)) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-on-surface-variant text-right">
                {profileData?.xpPoints || 0} / {profileData?.xpToNext || 1000} XP
              </p>
            </div>

            {/* AI Insights */}
            <div className="bg-surface-container p-6 rounded-xl border-l-4 border-secondary">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-secondary text-xl">psychology</span>
                <h3 className="font-headline font-bold text-sm text-secondary">Architect Insights</h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-5 italic">
                {profileData?.totalReviews === 0
                  ? '"Submit your first code review to unlock personalized insights."'
                  : `"${profileData?.avgScore}/10 average score across ${profileData?.totalReviews} reviews. You've caught ${profileData?.bugsCaught} bugs so far. Keep it up!"`}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/20">
              <h3 className="font-headline font-bold text-sm mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">Total XP Earned</span>
                  <span className="font-bold text-secondary">{(profileData?.xpPoints || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">Languages Used</span>
                  <span className="font-bold">{(profileData?.languages || []).length}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">Bugs Caught</span>
                  <span className="font-bold text-error">{profileData?.bugsCaught || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">Current Streak</span>
                  <span className="font-bold text-amber-400">{profileData?.currentStreak || 0} days</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/review')}
              className="w-full bg-[#c4db68] py-3 rounded-xl text-[#131313] font-bold text-xs uppercase tracking-widest"
            >
              Start New Review
            </button>

          </div>
        </div>
      </div>
    </Layout>
  )
}
