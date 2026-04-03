import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const userId = localStorage.getItem('userId')
  const userName = localStorage.getItem('userName') || 'Developer'
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com'
  const navigate = useNavigate()

  useEffect(() => {
    async function loadData() {
      try {
        const res = await axios.get(`http://localhost:8000/profile/${userId}`)
        setProfile(res.data)
      } catch (err) {
        // Fallback for visual completeness if API not ready
        setProfile({
          memberSince: 'Mar 2026',
          mastery: { level: 'ADVANCED', xp: 14500, nextLevel: 20000 },
          stats: { totalReviews: 128, avgScore: 8.7, bugsCaught: 42, streak: 15 },
          skills: [
            { lang: 'JavaScript', stars: 4, reviews: 45, avg: 8.9 },
            { lang: 'Python', stars: 3, reviews: 30, avg: 7.5 },
            { lang: 'React', stars: 4, reviews: 25, avg: 9.1 },
            { lang: 'TypeScript', stars: 2, reviews: 10, avg: 6.8 },
          ],
          chartData: [
            { month: 'Oct', score: 6.5 },
            { month: 'Nov', score: 7.2 },
            { month: 'Dec', score: 7.8 },
            { month: 'Jan', score: 8.1 },
            { month: 'Feb', score: 8.5 },
            { month: 'Mar', score: 8.7 },
          ],
          recurringIssues: [
            { id: 1, text: 'Missing null checks before accessing object properties.', count: 12 },
            { id: 2, text: 'Inefficient loop structures causing O(N^2) complexity.', count: 8 },
            { id: 3, text: 'Unused imports and declared variables.', count: 5 },
          ],
          insight: 'Your React and JavaScript scores are consistently excellent, but Python reviews show a steep learning curve with recurring algorithmic efficiency issues. Keep iterating!',
          annotations: [
            { id: 101, text: 'useEffect(() => { fetchData() }, [])', reviewId: 44, date: '2 days ago' },
            { id: 102, text: 'function sanitizeInput(str)', reviewId: 52, date: '1 week ago' },
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

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-8 overflow-y-auto pb-24">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-surface-bright flex items-center justify-center border-4 border-surface-container-high shadow-lg">
              <span className="font-headline font-bold text-3xl text-primary">{initials}</span>
            </div>
            <div>
              <h1 className="font-headline font-bold text-3xl mb-1">{userName}</h1>
              <p className="text-on-surface-variant text-sm mb-2">{userEmail} • github.com/{userName.toLowerCase().replace(' ', '')}</p>
              <span className="text-[10px] uppercase tracking-widest text-secondary font-bold bg-secondary/10 px-2 py-1 rounded">
                Member since {profile?.memberSince}
              </span>
            </div>
          </div>
          <button className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface text-xs font-bold uppercase tracking-wider hover:bg-surface-container transition-colors shrink-0">
            Share Profile
          </button>
        </div>

        {/* Flex layout for content */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Column (Stats + Chart + Issues) */}
          <div className="flex-1 space-y-6">
            
            {/* Stats Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Reviews', value: profile?.stats?.totalReviews },
                { label: 'Avg Code Score', value: profile?.stats?.avgScore },
                { label: 'Bugs Caught', value: profile?.stats?.bugsCaught },
                { label: 'Current Streak', value: profile?.stats?.streak },
              ].map((s, i) => (
                <div key={i} className="bg-surface-container p-4 rounded-xl border border-outline-variant/20">
                  <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="font-headline font-bold text-2xl">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Performance Chart */}
            <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/20">
              <h3 className="font-headline font-bold text-lg mb-6">Score Timeline</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profile?.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis dataKey="month" stroke="#adaaaa" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#adaaaa" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                    <Tooltip cursor={{ fill: '#262626' }} contentStyle={{ backgroundColor: '#202020', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="score" fill="#aaa4ff" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recurring Issues */}
            <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/20">
              <h3 className="font-headline font-bold text-lg mb-6">Recurring Issues</h3>
              <ol className="space-y-3">
                {(profile?.recurringIssues || []).map((issue, idx) => (
                  <li key={issue.id} className="flex gap-4 items-start bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
                    <span className="font-headline text-on-surface-variant font-bold mt-0.5">{idx + 1}.</span>
                    <p className="text-xs text-on-surface flex-1 leading-5">{issue.text}</p>
                    <span className="text-[10px] bg-error/10 text-error px-2 py-1 rounded font-bold">{issue.count}x</span>
                  </li>
                ))}
              </ol>
            </div>

          </div>

          {/* Right Column (Mastery + Insights + Annotations) */}
          <div className="w-full lg:w-80 space-y-6 shrink-0">
            
            {/* Mastery Card */}
            <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/20 glow-primary">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Current Mastery</p>
              <h2 className="font-headline font-bold text-3xl text-primary mb-6">{profile?.mastery?.level}</h2>
              <div className="h-1.5 w-full bg-outline-variant/30 rounded-full mb-2 overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${((profile?.mastery?.xp || 0) / (profile?.mastery?.nextLevel || 1)) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-on-surface-variant text-right">
                {profile?.mastery?.xp} / {profile?.mastery?.nextLevel} XP
              </p>
            </div>

            {/* Architect Insights */}
            <div className="bg-surface-container p-6 rounded-xl border-l-4 border-secondary">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-secondary text-xl">psychology</span>
                <h3 className="font-headline font-bold text-sm text-secondary">Architect Insights</h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-5 italic">
                "{profile?.insight}"
              </p>
            </div>

            {/* Language Skills */}
            <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/20">
              <h3 className="font-headline font-bold text-sm mb-4">Language Ratings</h3>
              <div className="space-y-4">
                {(profile?.skills || []).map(skill => (
                  <div key={skill.lang} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold">{skill.lang}</p>
                      <p className="text-[10px] text-on-surface-variant">{skill.reviews} reviews · {skill.avg} avg</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`material-symbols-outlined text-sm ${i < skill.stars ? 'text-amber-400' : 'text-outline-variant'}`}>
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Annotations */}
            <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/20">
              <h3 className="font-headline font-bold text-sm mb-4">Saved Bookmarks</h3>
              <div className="space-y-3">
                {(profile?.annotations || []).map(ann => (
                  <div 
                    key={ann.id} 
                    onClick={() => navigate('/review')}
                    className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/10 cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <p className="font-mono-code text-[10px] text-primary truncate mb-1">{ann.text}</p>
                    <p className="text-[9px] text-on-surface-variant">Review #{ann.reviewId} · {ann.date}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </Layout>
  )
}
