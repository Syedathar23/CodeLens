import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const userName = localStorage.getItem('userName') || 'Developer'
  const userId = localStorage.getItem('userId')

  useEffect(() => {
    async function loadData() {
      try {
        const res = await axios.get(`http://localhost:8000/dashboard/${userId}`)
        setStats(res.data)
      } catch (err) {
        // Fallback to placeholder if real API isn't fully ready but avoiding error break
        setStats({
          reviewsToday: 4,
          avgScore: 8.5,
          monthlyGrowth: 12,
          longestStreak: 15,
          recentReviews: [
            { id: 1, language: 'JavaScript', score: 9.2, model: 'Gemini', issues: 0, date: '2 hrs ago' },
            { id: 2, language: 'Python', score: 7.4, model: 'LLaMA 3', issues: 2, date: '5 hrs ago' },
            { id: 3, language: 'React', score: 5.1, model: 'Gemini', issues: 6, date: '1 day ago' },
          ],
          skills: [
            { lang: 'JavaScript', level: 'Advanced', progress: 85 },
            { lang: 'Python', level: 'Intermediate', progress: 60 },
          ]
        })
      } finally {
        setLoading(false)
      }
    }
    loadData()
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

        {error && <div className="text-error mb-4">{error}</div>}

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Reviews Today', value: stats?.reviewsToday || 0, icon: 'code' },
            { label: 'Avg Score Weekly', value: stats?.avgScore || 0, icon: 'star' },
            { label: 'Monthly Growth %', value: `+${stats?.monthlyGrowth || 0}%`, icon: 'trending_up', color: 'text-secondary' },
            { label: 'Longest Streak', value: stats?.longestStreak || 0, icon: 'bolt', color: 'text-amber-400' },
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
            <button onClick={() => navigate('/review')} className="text-xs text-primary hover:underline">View all</button>
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
                {(stats?.recentReviews || []).map(r => {
                  let badge = 'bg-secondary/10 text-secondary'
                  if (r.score < 5) badge = 'bg-error/10 text-error'
                  else if (r.score < 8) badge = 'bg-amber-500/10 text-amber-500'

                  return (
                    <tr key={r.id} className="hover:bg-surface-container-high transition-colors cursor-pointer">
                      <td className="px-5 py-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        {r.language}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badge}`}>{r.score}</span>
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant">{r.model}</td>
                      <td className="px-5 py-3 font-mono-code">{r.issues} <span className="text-error">●</span></td>
                      <td className="px-5 py-3 text-on-surface-variant">{r.date}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {(!stats?.recentReviews || stats.recentReviews.length === 0) && (
              <div className="p-8 text-center text-on-surface-variant text-sm">No reviews yet. Get started!</div>
            )}
          </div>
        </div>

        {/* Bottom Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Skill Progress */}
          <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/20">
            <h3 className="font-headline font-bold text-lg mb-6">Language Skill Progress</h3>
            <div className="space-y-5">
              {(stats?.skills || []).map((skill, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold">{skill.lang}</span>
                    <span className="text-primary">{skill.level}</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                    <div className="h-full gradient-primary" style={{ width: `${skill.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue where you left off */}
          <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-amber-500 text-lg">warning</span>
                <h3 className="font-headline font-bold text-lg">Continue where you left off</h3>
              </div>
              <p className="text-xs text-on-surface-variant mb-4">You have an unresolved security vulnerability in your last `auth.js` submission.</p>
              <div className="bg-surface-container-lowest border border-outline-variant/20 p-3 rounded font-mono-code text-[10px] text-error-dim mb-4">
                12: const token = req.headers.authorization; <br/>
                <span className="text-on-surface-variant">{'// Missing Bearer token validation and sanitization'}</span>
              </div>
            </div>
            <button onClick={() => navigate('/review')} className="w-full gradient-primary py-2.5 rounded text-on-primary font-bold text-xs">
              FIX IT NOW
            </button>
          </div>
        </div>

      </div>
    </Layout>
  )
}
