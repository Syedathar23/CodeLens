import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import { useNavigate } from 'react-router-dom'

const aiAPI = axios.create({ baseURL: 'http://localhost:8000' })

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
    if (!userId) { setLoading(false); return }
    setLoading(true)

    aiAPI.get(`/dashboard/${userId}`)
      .then(res => {
        const data = res.data
        setStats({
          reviewsToday: data.reviews_today || 0,
          avgScore: data.avg_score
            ? parseFloat(data.avg_score).toFixed(1)
            : '0',
          monthlyGrowth: data.improvement !== undefined
            ? (data.improvement >= 0 ? `+${parseFloat(data.improvement).toFixed(1)}` : `${parseFloat(data.improvement).toFixed(1)}`)
            : '+0',
          longestStreak: data.current_streak || 0
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
        <div className="max-w-6xl mx-auto p-8 animate-pulse">
           <div className="h-10 w-1/3 bg-surface-container-high rounded mb-2"></div>
           <div className="h-4 w-1/4 bg-surface-container-low rounded mb-8"></div>
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
             {[1,2,3,4].map(i => <div key={i} className="h-28 bg-surface-container-high rounded-xl"></div>)}
           </div>

           <div className="h-64 bg-surface-container-high rounded-xl mb-8"></div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="h-40 bg-surface-container-high rounded-xl"></div>
             <div className="h-40 bg-surface-container-high rounded-xl"></div>
           </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-8">
        
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-headline font-bold text-3xl mb-1">Welcome back, {userName}</h1>
            <p className="text-on-surface-variant text-sm">Your development metrics for today.</p>
          </div>
          <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-full border border-secondary/30">
            <span className="material-symbols-outlined text-secondary text-sm">local_fire_department</span>
            <span className="text-xs font-bold text-secondary">{stats?.longestStreak || 0} Day Streak</span>
          </div>
        </div>

        {error && <div className="text-error mb-4 text-sm">{error}</div>}

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Reviews Today',    value: stats?.reviewsToday ?? 0,      icon: 'code' },
            { label: 'Avg Score',        value: stats?.avgScore ?? '0',         icon: 'star' },
            { label: 'Score Growth',     value: `${stats?.monthlyGrowth ?? '+0'}`,  icon: 'trending_up', color: 'text-secondary' },
            { label: 'Current Streak',   value: stats?.longestStreak ?? 0,      icon: 'bolt', color: 'text-amber-400' },
          ].map((s, i) => (
            <div key={i} className="bg-surface-container p-5 rounded-xl border border-outline-variant/20 hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{s.label}</span>
                <span className="material-symbols-outlined text-outline text-lg">{s.icon}</span>
              </div>
              <p className={`font-headline font-bold text-3xl ${s.color || 'text-on-surface'}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Reviews Table */}
        <div className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden mb-8">
          <div className="p-5 border-b border-outline-variant/20 flex justify-between items-center">
            <h2 className="font-headline font-bold text-lg">Recent Reviews</h2>
            <button onClick={() => navigate('/review')} className="text-xs text-white hover:underline">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-container-low text-[10px] text-on-surface-variant uppercase tracking-widest">
                <tr>
                  <th className="px-5 py-3 font-medium">Language</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Model</th>
                  <th className="px-5 py-3 font-medium">Issues</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-xs">
                {recentReviews.map(review => (
                  <tr key={review.id} className="hover:bg-surface-container-high transition-colors cursor-pointer">
                    <td className="px-5 py-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {review.language}
                    </td>
                    <td className="px-5 py-3">
                      <span style={{
                        color: review.score >= 8 ? '#65f3b6'
                             : review.score >= 5 ? '#EF9F27'
                             : '#ff6e84',
                        fontWeight: 700
                      }}>
                        {review.score}/10
                      </span>
                    </td>
                    <td className="px-5 py-3 text-on-surface-variant">{review.model_used}</td>
                    <td className="px-5 py-3 font-mono-code">{review.issues_count || 0} <span className="text-error">●</span></td>
                    <td className="px-5 py-3 text-on-surface-variant">{new Date(review.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentReviews.length === 0 && (
              <div className="p-8 text-center text-on-surface-variant text-sm">No reviews yet. Get started!</div>
            )}
          </div>
        </div>

        {/* Bottom Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Language Skill Progress */}
          <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/20">
            <h3 className="font-headline font-bold text-lg mb-6">Language Skill Progress</h3>
            {skillProgress.length === 0 ? (
              <p className="text-white text-sm">No language data yet.</p>
            ) : (
              <div className="space-y-5">
                {skillProgress.map((skill, i) => {
                  const progress = Math.min(100, Math.round(skill.avg_score * 10))
                  const level = skill.avg_score >= 8 ? 'Advanced' : skill.avg_score >= 6 ? 'Intermediate' : 'Beginner'
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-bold">{skill.language} <span className="text-[#10A37F] font-normal">({skill.count} reviews)</span></span>
                        <span className="text-white">{level}</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                        <div className="h-full bg-[#10A37F]" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Continue where you left off */}
          <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-amber-500 text-lg">warning</span>
                <h3 className="font-headline font-bold text-lg">Continue where you left off</h3>
              </div>
              <p className="text-xs text-on-surface-variant mb-4">
                {recentReviews.length > 0
                  ? `Last reviewed ${recentReviews[0].language} code — ${new Date(recentReviews[0].created_at).toLocaleDateString()}`
                  : 'Start your first code review to track your progress here.'}
              </p>
              {recentReviews.length > 0 && (
                <div className="bg-surface-container-lowest border border-outline-variant/20 p-3 rounded font-mono-code text-[10px] text-on-surface-variant/80 mb-4">
                  Score: {recentReviews[0].score}/10 · {recentReviews[0].issues_count || 0} issues found
                </div>
              )}
            </div>
            <button onClick={() => navigate('/review')} className="w-full bg-[#10A37F] py-2.5 rounded text-black font-bold text-xs">
              {recentReviews.length > 0 ? 'CONTINUE REVIEWING' : 'START REVIEWING'}
            </button>
          </div>
        </div>

      </div>
    </Layout>
  )
}
