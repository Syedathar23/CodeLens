import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { getRecentReviews } from '../services/api'
import { Link } from 'react-router-dom'
export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  
  const isChats = location.pathname === '/review' || location.pathname === '/chat'
  const isDashboard = location.pathname === '/dashboard'
  const isProfile = location.pathname === '/profile'

  const userName = localStorage.getItem('userName') || 'Developer'
  const initials = userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const userId = localStorage.getItem('userId') || 1

  const [allSessions, setAllSessions] = useState([])
  const [showChatsDropdown, setShowChatsDropdown] = useState(false)
  const dropdownTimeoutRef = useRef(null)

  useEffect(() => {
    getRecentReviews(userId)
      .then(data => setAllSessions(data || []))
      .catch(err => console.error(err))
  }, [userId])

  const isReviewPage = location.pathname === '/review'

  function handleLogout() {
    localStorage.clear()
    navigate('/login')
  }

  function handleNewChat() {
    localStorage.removeItem('currentSessionId')
    localStorage.removeItem('lastReviewId')
    if (isReviewPage) {
      window.location.reload()
    } else {
      navigate('/review')
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white font-body flex flex-col">
      {/* ── UNIFIED NAVBAR ─────────────────────────────────────────────────── */}
      {!isReviewPage && (
      <div className="h-[65px] bg-[#0e0e0e] px-6 flex flex-row items-center justify-between border-b border-[#222] shrink-0 z-50">
        
        {/* Left Side: Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-[#10A37F] rounded-md flex items-center justify-center">
            <span className="material-symbols-outlined text-black text-sm">code</span>
          </div>
          <Link to="/" className="font-headline font-semibold text-lg hover:opacity-80">
            CodeLens AI
          </Link>
        </div>

        {/* Center Nav Links */}
        <div className="flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2 mt-1">
            
            {/* Chats Dropdown */}
            <div 
              className="relative flex items-center h-[65px]"
              onMouseEnter={() => { if(dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current); setShowChatsDropdown(true); }}
              onMouseLeave={() => { dropdownTimeoutRef.current = setTimeout(() => setShowChatsDropdown(false), 200); }}
            >
              <button 
                onClick={() => navigate('/review')} 
                className="text-[14px] font-medium transition-colors cursor-pointer"
                style={{ 
                  background: 'none', border: 'none', outline: 'none',
                  color: isChats ? '#10A37F' : '#adaaaa',
                  borderBottom: isChats ? '2px solid #10A37F' : '2px solid transparent',
                  paddingBottom: 2 
                }}
              >
                Chats
              </button>
              
              {showChatsDropdown && (
                <div className="absolute top-[55px] left-[-100px] w-[280px] bg-[#1C1B1B] border border-[#2a2a2a] rounded-lg z-[100] p-2 max-h-[320px] overflow-y-auto shadow-2xl custom-scroll">
                  <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-[#2a2a2a]">
                    <span className="text-[10px] text-[#adaaaa] uppercase tracking-widest font-bold">Recent chats</span>
                    <button onClick={() => navigate('/review')} className="text-[10px] text-[#10A37F] hover:underline">View all</button>
                  </div>
                  {allSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <span className="text-xs text-[#adaaaa] mb-3">No chats yet</span>
                      <button onClick={handleNewChat} className="text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-widest bg-[#10A37F] text-black w-full transition-colors hover:opacity-80">Start reviewing code</button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {allSessions.map(s => (
                        <div 
                          key={s.id}
                          onClick={() => {
                            if (s.session_id) {
                              localStorage.setItem('currentSessionId', s.session_id);
                              navigate('/review');
                            }
                          }}
                          className="flex flex-col p-2 rounded-md hover:bg-[#2a2a2a] cursor-pointer transition-colors border border-transparent"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded font-bold bg-[#1C1B1B] border border-[#333] text-white">{s.language || 'Code'}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded text-black ${s.score >= 8 ? 'bg-[#10A37F]' : s.score >= 5 ? 'bg-[#EF9F27]' : 'bg-[#ff6e84]'}`}>{s.score}/10</span>
                            </div>
                            <span className="text-[9px] text-[#8a8a8a]">{new Date(s.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="text-[10px] font-mono-code text-[#adaaaa] truncate mt-0.5">
                            {s.code ? s.code.split('\n')[0].substring(0, 40) : 'No code'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => navigate('/dashboard')} 
              className="text-[14px] font-medium transition-colors cursor-pointer" 
              style={{ 
                background: 'none', border: 'none', outline: 'none',
                color: isDashboard ? '#10A37F' : '#adaaaa',
                borderBottom: isDashboard ? '2px solid #10A37F' : '2px solid transparent',
                paddingBottom: 2 
              }}
            >
              Dashboard
            </button>

            <button 
              onClick={() => navigate('/contact')} 
              className="text-[14px] font-medium transition-colors cursor-pointer" 
              style={{ 
                background: 'none', border: 'none', outline: 'none',
                color: location.pathname === '/contact' ? '#10A37F' : '#adaaaa',
                borderBottom: location.pathname === '/contact' ? '2px solid #10A37F' : '2px solid transparent',
                paddingBottom: 2 
              }}
            >
              Contact Us
            </button>
        </div>

        {/* Right Nav Options */}
        <div className="flex items-center gap-5">
            <button
              onClick={handleNewChat}
              className="transition-transform hover:scale-105 px-4 py-1.5 bg-[#10A37F] border border-[#10A37F] rounded-full text-black text-xs font-semibold cursor-pointer flex items-center gap-1.5"
            >
              + New Chat
            </button>

            <div className="group relative cursor-pointer">
              <div
                className="w-[30px] h-[30px] rounded-full bg-[#10A37F] flex items-center justify-center text-[10px] font-semibold text-black"
                title="View Profile"
              >
                {initials}
              </div>
              
              {/* Profile Dropdown */}
              <div className="absolute top-[40px] right-0 bg-[#1C1B1B] border border-[#2a2a2a] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col w-36 z-[100] overflow-hidden">
                 <button onClick={() => navigate('/profile')} className="px-4 py-2.5 text-xs text-left text-[#adaaaa] hover:bg-[#2a2a2a] hover:text-white transition-colors flex items-center gap-2">
                   <span className="material-symbols-outlined text-[16px]">person</span> Profile
                 </button>
                 <button onClick={() => navigate('/settings')} className="px-4 py-2.5 text-xs text-left text-[#adaaaa] hover:bg-[#2a2a2a] hover:text-white transition-colors flex items-center gap-2">
                   <span className="material-symbols-outlined text-[16px]">settings</span> Settings
                 </button>
                 <div className="h-px bg-[#2a2a2a] w-full" />
                 <button onClick={handleLogout} className="px-4 py-2.5 text-xs text-left text-[#ff6e84] hover:bg-[#2a2a2a] hover:text-red-400 transition-colors flex items-center gap-2">
                   <span className="material-symbols-outlined text-[16px]">logout</span> Logout
                 </button>
              </div>
            </div>
        </div>
      </div>
      )}

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full relative">
        {children}
      </main>
    </div>
  )
}
