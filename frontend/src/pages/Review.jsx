import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { createSession, reviewCode, getRecentReviews } from '../services/api'
import Navbar from '../components/Navbar'
import ReviewAnalysisPanel from '../components/ReviewAnalysisPanel'
import CodePanel from '../components/CodePanel'
import SideChat from '../components/SideChat'
import { Link } from 'react-router-dom'

const C = {
  cream: '#F5F2EB',
  black: '#0A0A0A',
  yellow: '#F5B800',
  orange: '#E8440A',
  muted: '#6B6862',
  border: '3px solid #0A0A0A',
  thinBorder: '2px solid #0A0A0A',
  shadow: '6px 6px 0 #0A0A0A',
  font: "'Space Grotesk', sans-serif",
  body: "'Inter', sans-serif",
  grayLight: '#ECEAE4',
  grayMid: '#D9D6CF',
}

// ── Left Sidebar ──────────────────────────────────────────────────────────────
function ChatSidebar({ sessions, activeSessionId, onSelectSession, onNewChat }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{
      width: collapsed ? 48 : 260,
      minWidth: collapsed ? 48 : 260,
      background: '#fff',
      borderRight: C.border,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease, min-width 0.2s ease',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 10,
      height: '100%',
      flexShrink: 0,
    }}>
      {/* Header row */}
      <div style={{
        padding: collapsed ? '0.75rem 0' : '0.85rem 0.85rem',
        borderBottom: C.thinBorder,
        background: C.grayLight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 8,
        flexShrink: 0,
      }}>
        {!collapsed && (
          <span style={{
            fontFamily: C.font,
            fontWeight: 900,
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: C.black,
          }}>Chats</span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            color: C.muted,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* New Chat Button */}
      {!collapsed && (
        <div style={{ padding: '0.75rem 0.75rem 0.5rem' }}>
          <button
            onClick={onNewChat}
            style={{
              width: '100%',
              fontFamily: C.font,
              fontWeight: 800,
              fontSize: '0.72rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: C.black,
              color: '#fff',
              border: C.thinBorder,
              boxShadow: '3px 3px 0 ' + C.orange,
              padding: '0.55rem 0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '5px 5px 0 ' + C.orange }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '3px 3px 0 ' + C.orange }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span>
            New Chat
          </button>
        </div>
      )}

      {/* Collapsed new chat icon */}
      {collapsed && (
        <div style={{ padding: '0.5rem 0', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onNewChat}
            title="New Chat"
            style={{
              width: 32, height: 32,
              background: C.black,
              border: '2px solid ' + C.black,
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span>
          </button>
        </div>
      )}

      {/* Session List */}
      {!collapsed && (
        <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '0.25rem 0.5rem 1rem' }}>
          {sessions.length === 0 ? (
            <div style={{
              padding: '1.5rem 0.5rem',
              textAlign: 'center',
              fontFamily: C.body,
              fontSize: '0.75rem',
              color: C.muted,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: C.grayMid, display: 'block', marginBottom: 6 }}>chat_bubble_outline</span>
              No previous chats yet.
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = String(s.session_id) === String(activeSessionId)
              const scoreColor = s.score >= 8 ? '#16A34A' : s.score >= 5 ? '#D97706' : C.orange
              const scoreBg = s.score >= 8 ? '#DCFCE7' : s.score >= 5 ? '#FEF3C7' : '#FEE2E2'
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectSession(s)}
                  style={{
                    padding: '0.65rem 0.6rem',
                    marginBottom: 2,
                    background: isActive ? C.grayLight : 'transparent',
                    border: isActive ? C.thinBorder : '2px solid transparent',
                    borderLeft: isActive ? `4px solid ${C.orange}` : '4px solid transparent',
                    cursor: 'pointer',
                    transition: 'background 0.12s, border-color 0.12s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F5F2EB' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  {/* Language + score row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{
                      fontFamily: C.font,
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      background: isActive ? C.black : C.grayLight,
                      color: isActive ? '#fff' : C.black,
                      padding: '0.1rem 0.4rem',
                      border: '1px solid ' + C.grayMid,
                    }}>
                      {s.language || 'Code'}
                    </span>
                    {s.score != null && (
                      <span style={{
                        fontFamily: C.font,
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        color: scoreColor,
                        background: scoreBg,
                        padding: '0.1rem 0.35rem',
                        border: `1px solid ${scoreColor}40`,
                      }}>
                        {s.score}/10
                      </span>
                    )}
                  </div>
                  {/* Code preview */}
                  <p style={{
                    margin: 0,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.65rem',
                    color: C.muted,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.4,
                  }}>
                    {s.code ? s.code.split('\n')[0].trim().substring(0, 32) || 'No preview' : 'No preview'}
                  </p>
                  {/* Date */}
                  <p style={{
                    margin: '3px 0 0',
                    fontFamily: C.body,
                    fontSize: '0.6rem',
                    color: C.grayMid,
                  }}>
                    {new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default function Review() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const isChats = location.pathname === '/review' || location.pathname === '/chat'
  const isDashboard = location.pathname === '/dashboard'
  const userName = localStorage.getItem('userName') || 'Developer'
  const initials = userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const userId = localStorage.getItem('userId')
  const savedSessionId = localStorage.getItem('currentSessionId')

  const [sessionId, setSessionId] = useState(savedSessionId)
  const [messages, setMessages] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  
  const [allSessions, setAllSessions] = useState([])
  const [showChatsDropdown, setShowChatsDropdown] = useState(false)
  const dropdownTimeoutRef = useRef(null)

  useEffect(() => {
    getRecentReviews(userId)
      .then(data => setAllSessions(data || []))
      .catch(err => console.error(err))
  }, [userId])
  
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorData, setEditorData] = useState(null)

  const [inputCode, setInputCode] = useState('')
  const language = 'auto'
  const [modelUsed, setModelUsed] = useState('gemini')
  const [isSynthesizing, setIsSynthesizing] = useState(false)
  
  const [popupPos, setPopupPos] = useState(null)
  const [popupText, setPopupText] = useState('')
  const [sideChatOpen, setSideChatOpen] = useState(false)
  const [sideChatText, setSideChatText] = useState('')
  const [replyContext, setReplyContext] = useState(null)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('#selection-popup')) {
        const selection = window.getSelection()
        if (!selection || selection.toString().trim().length < 3) {
           setPopupPos(null)
        }
      }
    }
    document.addEventListener('mousedown', handleClick)
    const hideOnType = () => setPopupPos(null)
    window.addEventListener('keydown', hideOnType)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('keydown', hideOnType)
    }
  }, [])

  const handleSelection = (e) => {
    if (e.target.closest('#selection-popup')) return
    const selection = window.getSelection()
    const selectedText = selection.toString().trim()
    if (selectedText.length < 3) {
      setPopupPos(null)
      return
    }
    try {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setPopupPos({
        top: rect.top - 10,
        left: rect.left + rect.width / 2
      })
      setPopupText(selectedText)
    } catch(err) { /* ignore */ }
  }

  function generateChatName(code, lang) {
    const lines = code.split('\n').filter(l => l.trim())
    const funcMatch = code.match(/(?:def|function|class|func|fn)\s+(\w+)/)
    if (funcMatch) {
      return `${funcMatch[1]} — ${lang}`
    }
    const firstLine = lines[0]?.trim() || ''
    const name = firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine
    return name || `${lang} review — ${new Date().toLocaleDateString()}`
  }

  // Load a specific session by session_id
  async function loadSession(sid) {
    setLoadingHistory(true)
    setMessages([])
    setEditorOpen(false)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`http://localhost:8000/reviews/session/${sid}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const sessionReviews = res.data
      if (sessionReviews.length > 0) {
        const loadedMessages = []
        sessionReviews.forEach(rev => {
          loadedMessages.push({
            id: `user-${rev.id}`, role: 'user', type: 'code',
            content: 'Please review this code.', code: rev.code, language: rev.language
          })
          loadedMessages.push({
            id: `ai-${rev.id}`, role: 'ai', type: 'review',
            content: rev.summary, score: rev.score, issues: rev.issues,
            improvedCode: rev.improved_code, originalCode: rev.code,
            reviewId: rev.id, language: rev.language
          })
        })
        setMessages(loadedMessages)
      }
    } catch (err) {
      console.error('Failed to load session', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    async function fetchSession() {
      if (!savedSessionId) {
        setLoadingHistory(false)
        return
      }
      await loadSession(savedSessionId)
    }
    fetchSession()
  }, [savedSessionId])

  useEffect(() => {
    if (!editorOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, editorOpen])

  async function handleReviewSubmit() {
    if (!inputCode.trim()) return
    setIsSynthesizing(true)
    try {
      let activeSession = sessionId
      if (!activeSession || activeSession === 0 || activeSession === '0') {
        const generatedName = generateChatName(inputCode, language)
        const sessRes = await axios.post('http://localhost:8000/sessions', {
          user_id: parseInt(userId, 10),
          session_name: generatedName,
          language: language
        })
        activeSession = sessRes.data.id
        setSessionId(activeSession)
        localStorage.setItem('currentSessionId', activeSession)
      }

      const timestamp = new Date().getTime()
      const userBubble = {
        id: `user-temp-${timestamp}`, role: 'user', type: 'code',
        content: 'Please review this code.', code: inputCode, language
      }
      setMessages(prev => [...prev, userBubble])
      
      let parsedSession = typeof activeSession === 'string' ? parseInt(activeSession, 10) : activeSession
      if (isNaN(parsedSession) || parsedSession <= 0) parsedSession = null
      
      const revRes = await axios.post('http://localhost:8000/review', {
        code: inputCode, language, model_used: modelUsed,
        user_id: parseInt(userId, 10), session_id: parsedSession
      })
      const reviewData = revRes.data

      const reviewMsg = {
        id: `ai-${reviewData.id}`, role: 'ai', type: 'review',
        content: reviewData.summary, score: reviewData.score,
        issues: reviewData.issues || [], improvedCode: reviewData.improved_code,
        originalCode: inputCode, reviewId: reviewData.id, language
      }
      setMessages(prev => [...prev, reviewMsg])
      localStorage.setItem('lastReviewId', reviewData.id)
      setInputCode('')
      if (textareaRef.current) {
        textareaRef.current.style.height = '24px'
        textareaRef.current.style.overflowY = 'hidden'
      }
      // Refresh sidebar sessions
      getRecentReviews(userId).then(data => setAllSessions(data || [])).catch(() => {})
      openEditorMode(reviewMsg)
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { id: Date.now(), role: 'system', type: 'error', content: 'An error occurred while connecting to CodeLens AI. Connection refused.' }])
    } finally {
      setIsSynthesizing(false)
    }
  }

  async function handleTextSubmit() {
    if (!inputCode.trim()) return
    setIsSynthesizing(true)
    const textStr = replyContext ? `Regarding: "${replyContext}"\n\n${inputCode}` : inputCode
    const timestamp = new Date().getTime()
    setMessages(prev => [
      ...prev, 
      { id: `user-text-${timestamp}`, role: 'user', type: 'text', content: textStr }
    ])
    setInputCode('')
    setReplyContext(null)
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px'
      textareaRef.current.style.overflowY = 'hidden'
    }
    
    try {
      const res = await axios.post('http://localhost:8000/chat', {
        message: textStr,
        user_id: parseInt(userId, 10)
      })
      setMessages(prev => [...prev, {
        id: `ai-text-${timestamp}`, role: 'ai', type: 'text',
        content: res.data.response
      }])
    } catch (err) {
      console.error(err)
    } finally {
      setIsSynthesizing(false)
      if (editorOpen) setEditorOpen(false) 
    }
  }

  function openEditorMode(aiMsg) {
    setEditorData({
      code: aiMsg.originalCode || '',
      improvedCode: aiMsg.improvedCode || '',
      score: aiMsg.score,
      issues: aiMsg.issues || [],
      summary: aiMsg.content,
      language: aiMsg.language,
      reviewId: aiMsg.reviewId
    })
    setEditorOpen(true)
  }

  function handleNewChat() {
    localStorage.removeItem('currentSessionId')
    localStorage.removeItem('lastReviewId')
    setSessionId(null)
    setMessages([])
    setEditorOpen(false)
    setEditorData(null)
    setInputCode('')
  }

  function handleSelectSession(s) {
    if (s.session_id) {
      localStorage.setItem('currentSessionId', s.session_id)
      setSessionId(s.session_id)
      loadSession(s.session_id)
    }
  }

  return (
    <div style={{ background: C.cream, height: '100vh', overflow: 'hidden', fontFamily: C.body, color: C.black, display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* ── Left Sidebar ── */}
        <ChatSidebar
          sessions={allSessions}
          activeSessionId={sessionId}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
        />

        {/* ── Main Content ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
          {editorOpen && editorData ? (
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: C.cream, borderTop: C.border }}>
              
              {/* Panel 1: Review Analysis (Brutalist card layout) */}
              <div style={{ width: 280, borderRight: C.border, background: '#fff', padding: '1.5rem', overflowY: 'auto' }}>
                <ReviewAnalysisPanel reviewData={editorData} />
              </div>
              
              {/* Panel 2: Code Editors */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}> 
                   {/* Left Editor */}
                   <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: C.border, background: '#fff' }}>
                      <div style={{ padding: '0.75rem 1rem', background: C.yellow, borderBottom: C.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: C.font, fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Original Submission</span>
                        {editorData.language && <span style={{ background: C.black, color: '#fff', padding: '0.15rem 0.4rem', fontSize: '0.65rem', fontWeight: 700 }}>{editorData.language}</span>}
                      </div>
                      <div style={{ flex: 1, overflow: 'auto' }} onMouseUp={handleSelection}>
                         <CodePanel 
                           code={editorData.code || ''}
                           language={editorData.language}
                           editable={false}
                           isLatest={false}
                           issues={editorData.issues || []}
                         />
                      </div>
                   </div>
 
                   {/* Right Editor */}
                   <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
                      <div style={{ padding: '0.75rem 1rem', background: C.orange, borderBottom: C.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: C.font, fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#fff' }}>Architect Improvements</span>
                        <button
                          onClick={() => setEditorOpen(false)}
                          style={{
                            fontFamily: C.font, fontWeight: 700, fontSize: '0.7rem',
                            background: C.black, color: '#fff', border: 'none',
                            padding: '0.35rem 0.75rem', cursor: 'pointer',
                          }}
                        >
                           Close Editor
                        </button>
                      </div>
                      <div style={{ flex: 1, overflow: 'auto' }} onMouseUp={handleSelection}>
                         <CodePanel 
                           code={editorData.improvedCode || editorData.code || ''}
                           originalCode={editorData.code || ''}
                           language={editorData.language}
                           score={editorData.score}
                           editable={false}
                           isLatest={true}
                           issues={editorData.issues || []}
                         />
                      </div>
                   </div>
                </div>
                
                {/* Embedded Input Bar */}
                <div style={{ padding: '1rem', background: '#fff', borderTop: C.border }}>
                  <div style={{ border: C.border, background: '#FAFAF8', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <textarea
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="Ask follow-up or describe changes..."
                      style={{ flex: 1, background: 'transparent', border: 'none', color: C.black, fontSize: 13, outline: 'none', resize: 'none' }}
                      rows={1}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={handleTextSubmit}
                        disabled={isSynthesizing || !inputCode.trim()}
                        style={{ background: '#fff', border: C.border, color: C.black, padding: '0.5rem 1rem', fontFamily: C.font, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        SEND CHAT
                      </button>
                      <button
                        onClick={handleReviewSubmit}
                        disabled={isSynthesizing || !inputCode.trim()}
                        style={{ background: C.orange, border: C.border, color: '#fff', padding: '0.5rem 1rem', fontFamily: C.font, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        CODE REVIEW
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 3: Side Chat */}
              <SideChat 
                isOpen={true}
                selectedText={sideChatText}
                reviewId={editorData.reviewId}
                onClose={() => setEditorOpen(false)}
                isEditorMode={true}
              />
            </div>
          ) : (
            /* CHAT MODE */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', overflowY: 'auto', overscrollBehavior: 'contain' }}>
              {messages.length === 0 && !loadingHistory && (
                <div style={{ maxWidth: 600, textAlign: 'center', marginTop: '6rem' }}>
                  <div style={{ width: 64, height: 64, background: C.yellow, border: C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: C.shadow }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 32 }}>psychology</span>
                  </div>
                  <h1 style={{ fontFamily: C.font, fontWeight: 900, fontSize: '2.5rem', marginBottom: '0.5rem' }}>Your AI Code Mentor</h1>
                  <p style={{ fontFamily: C.body, fontSize: '0.95rem', color: C.muted, lineHeight: 1.6 }}>
                    Paste a block of code, submit a file, or ask a question. CodeLens AI handles code reviews, security scanning, and inline chat natively.
                  </p>
                </div>
              )}

              {loadingHistory && (
                 <div style={{ marginTop: '6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5 }}>
                   <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #000', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                   <span style={{ fontSize: '0.7rem', fontWeight: 700, marginTop: '1rem', letterSpacing: '0.1em' }}>LOADING HISTORY...</span>
                 </div>
              )}

              <div style={{ maxWidth: 760, width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '8rem' }}>
                {messages.map((msg, idx) => (
                  <div key={msg.id || idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    {msg.role === 'user' ? (
                       <div style={{ maxWidth: '85%', background: '#fff', border: C.border, boxShadow: C.shadow, padding: '1rem' }}>
                         {msg.type === 'code' ? (
                           <pre style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', overflowX: 'auto' }}>
                             {msg.code}
                           </pre>
                         ) : (
                           <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>{msg.content}</p>
                         )}
                       </div>
                    ) : (
                      <div style={{ maxWidth: '90%', display: 'flex', gap: '1rem' }}>
                        <div style={{ width: 34, height: 34, background: C.orange, border: C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>auto_awesome</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          {msg.type === 'error' && (
                             <div style={{ border: `2px solid ${C.orange}`, background: 'rgba(232,68,10,0.08)', padding: '0.75rem', fontSize: '0.85rem', color: C.orange }}>
                               {msg.content}
                             </div>
                          )}
                          {msg.type === 'text' && (
                             <div style={{ fontSize: '0.9rem', lineHeight: 1.6, background: '#fff', border: C.border, padding: '1rem' }}>{msg.content}</div>
                          )}
                          {msg.type === 'review' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                               <div style={{ background: '#fff', border: C.border, padding: '1.25rem', boxShadow: C.shadow }}>
                                  <span style={{ fontFamily: C.font, fontWeight: 900, fontSize: '1.1rem', color: C.orange, display: 'block', marginBottom: '0.5rem' }}>
                                    {msg.score}/10 — Reviewed.
                                  </span>
                                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }} onMouseUp={handleSelection}>{msg.content}</p>
                               </div>
                               
                               {msg.improvedCode && (
                                 <div style={{ background: '#fff', border: C.border, overflow: 'hidden', boxShadow: C.shadow }}>
                                    <div style={{ background: C.black, color: '#fff', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700 }}>
                                       Improved version ready
                                    </div>
                                    <pre style={{ margin: 0, padding: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', background: '#FAFAF8', overflowX: 'auto', borderBottom: '1px solid #ECEAE4' }}>
                                       {msg.improvedCode.split('\n').slice(0, 4).join('\n')}...
                                    </pre>
                                    <div style={{ padding: '0.75rem', background: '#fff', display: 'flex', justifyContent: 'flex-end' }}>
                                       <button 
                                         onClick={() => openEditorMode(msg)} 
                                         style={{ fontFamily: C.font, fontWeight: 700, fontSize: '0.75rem', background: C.orange, border: C.border, color: '#fff', padding: '0.5rem 1rem', cursor: 'pointer' }}
                                       >
                                         Open in editor
                                       </button>
                                    </div>
                                 </div>
                               )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Float Input Bar */}
              <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 760, padding: '0 1rem', zIndex: 10 }}>
                <div style={{ background: '#fff', border: C.border, boxShadow: '8px 8px 0 #0A0A0A', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <textarea
                    ref={textareaRef}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="Paste your code block or message here to review..."
                    style={{ width: '100%', background: 'transparent', border: 'none', color: C.black, fontSize: 14, outline: 'none', resize: 'none', minHeight: 60 }}
                    rows={3}
                  />
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => setModelUsed(modelUsed === 'gemini' ? 'llama3' : 'gemini')}
                        style={{ background: '#ECEAE4', border: '1px solid #0A0A0A', padding: '0.35rem 0.65rem', fontSize: '0.7rem', fontFamily: C.font, fontWeight: 700, cursor: 'pointer' }}
                      >
                        ⚡ {modelUsed === 'gemini' ? 'GEMINI' : 'LLAMA'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={handleTextSubmit}
                        disabled={isSynthesizing || !inputCode.trim()}
                        style={{ background: '#fff', border: C.border, color: C.black, padding: '0.6rem 1.25rem', fontFamily: C.font, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', boxShadow: '3px 3px 0 #000' }}
                      >
                        SEND CHAT 💬
                      </button>
                      <button
                        onClick={handleReviewSubmit}
                        disabled={isSynthesizing || !inputCode.trim()}
                        style={{ background: C.orange, border: C.border, color: '#fff', padding: '0.6rem 1.25rem', fontFamily: C.font, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', boxShadow: '3px 3px 0 #000' }}
                      >
                        {isSynthesizing ? 'ANALYZING...' : 'CODE REVIEW 🚀'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <p style={{
         position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
         fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: C.muted,
         padding: '4px', zIndex: 5, textAlign: 'center'
      }}>
        AI CAN MAKE MISTAKES. VERIFY IMPORTANT INFRASTRUCTURE.
      </p>
    </div>
  )
}
