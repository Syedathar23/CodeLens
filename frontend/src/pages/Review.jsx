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

// ── Left Sidebar (Desktop + Mobile Drawer) ───────────────────────────────────
function ChatSidebar({ sessions, activeSessionId, onSelectSession, onNewChat, mobileOpen, onCloseMobile }) {
  const [collapsed, setCollapsed] = useState(false)

  const content = (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
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
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: C.black,
          }}>Chats</span>
        )}
        
        {/* Mobile close button or Desktop collapse toggle */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="md:hidden"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                color: C.black,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>close</span>
            </button>
          )}

          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:flex"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              alignItems: 'center',
              color: C.muted,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
              {collapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      {(!collapsed || mobileOpen) && (
        <div style={{ padding: '0.75rem 0.75rem 0.5rem' }}>
          <button
            onClick={() => {
              onNewChat()
              if (onCloseMobile) onCloseMobile()
            }}
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

      {/* Collapsed new chat icon (Desktop) */}
      {collapsed && !mobileOpen && (
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
      {(!collapsed || mobileOpen) && (
        <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '0.25rem 0.5rem 1rem' }}>
          {sessions.length === 0 ? (
            <div style={{
              padding: '1.5rem 0.5rem',
              textAlign: 'center',
              fontFamily: C.body,
              fontSize: '0.75rem',
              color: C.muted,
            }}>
              No chat history yet.
            </div>
          ) : (
            sessions.map((s, idx) => {
              const isSelected = activeSessionId && (String(s.session_id) === String(activeSessionId) || String(s.id) === String(activeSessionId))
              return (
                <div
                  key={s.id || idx}
                  onClick={() => {
                    onSelectSession(s)
                    if (onCloseMobile) onCloseMobile()
                  }}
                  style={{
                    padding: '0.6rem 0.65rem',
                    marginBottom: '0.35rem',
                    background: isSelected ? C.grayLight : 'transparent',
                    border: isSelected ? `2px solid ${C.black}` : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'background 0.1s, border-color 0.1s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#FAF8F4' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{
                      fontFamily: C.font,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: C.black,
                      background: '#fff',
                      border: '1px solid #D9D6CF',
                      padding: '0.1rem 0.35rem',
                    }}>
                      {s.language || 'Code'}
                    </span>
                    {s.score !== undefined && (
                      <span style={{
                        fontFamily: C.font,
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        color: '#fff',
                        background: s.score >= 8 ? '#22C55E' : s.score >= 5 ? C.yellow : C.orange,
                        padding: '0.1rem 0.35rem',
                      }}>
                        {s.score}/10
                      </span>
                    )}
                  </div>
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

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div
        className="hidden md:flex"
        style={{
          width: collapsed ? 48 : 260,
          minWidth: collapsed ? 48 : 260,
          borderRight: C.border,
          flexDirection: 'column',
          transition: 'width 0.2s ease, min-width 0.2s ease',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
          height: '100%',
          flexShrink: 0,
        }}
      >
        {content}
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden"
          style={{ background: 'rgba(10,10,10,0.5)' }}
          onClick={onCloseMobile}
        >
          <div
            style={{
              width: 280,
              maxWidth: '80vw',
              height: '100%',
              background: '#fff',
              borderRight: C.border,
              boxShadow: '4px 0 12px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {content}
          </div>
        </div>
      )}
    </>
  )
}

export default function Review() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const userId = localStorage.getItem('userId')
  const savedSessionId = localStorage.getItem('currentSessionId')

  const [sessionId, setSessionId] = useState(savedSessionId)
  const [messages, setMessages] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  
  const [allSessions, setAllSessions] = useState([])
  
  // Editor mode state
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorData, setEditorData] = useState(null)
  const [editorMobileTab, setEditorMobileTab] = useState('editor') // 'analysis' | 'editor' | 'chat'
  const [editorDiffView, setEditorDiffView] = useState('both') // 'both' | 'original' | 'improved'

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
    getRecentReviews(userId)
      .then(data => setAllSessions(data || []))
      .catch(err => console.error(err))
  }, [userId])

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
    if (!selectedText || selectedText.length < 3) return
    try {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setPopupPos({
        top: rect.top - 44,
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
        textareaRef.current.style.height = '48px'
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
      textareaRef.current.style.height = '48px'
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
    setEditorMobileTab('editor')
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

      {/* Mobile Workspace Bar */}
      <div className="flex md:hidden" style={{
        background: '#fff',
        borderBottom: C.thinBorder,
        padding: '0.4rem 0.75rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <button
          onClick={() => setMobileSidebarOpen(true)}
          style={{
            background: C.grayLight,
            border: '1px solid #0A0A0A',
            padding: '0.35rem 0.65rem',
            fontFamily: C.font,
            fontWeight: 800,
            fontSize: '0.72rem',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>history</span>
          Chats ({allSessions.length})
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setModelUsed(modelUsed === 'gemini' ? 'llama3' : 'gemini')}
            style={{
              background: '#fff',
              border: '1px solid #0A0A0A',
              padding: '0.35rem 0.5rem',
              fontFamily: C.font,
              fontWeight: 800,
              fontSize: '0.68rem',
              cursor: 'pointer',
            }}
          >
            ⚡ {modelUsed === 'gemini' ? 'GEMINI' : 'LLAMA'}
          </button>
          <button
            onClick={handleNewChat}
            style={{
              background: C.black,
              color: '#fff',
              border: '1px solid #0A0A0A',
              padding: '0.35rem 0.65rem',
              fontFamily: C.font,
              fontWeight: 800,
              fontSize: '0.72rem',
              cursor: 'pointer',
            }}
          >
            + New
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* ── Left Sidebar ── */}
        <ChatSidebar
          sessions={allSessions}
          activeSessionId={sessionId}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* ── Main Content ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, position: 'relative' }}>
          {editorOpen && editorData ? (
            /* ── RESPONSIVE EDITOR MODE ── */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.cream, borderTop: C.border }}>
              
              {/* Responsive Tab Bar on Mobile & Tablet (< lg) */}
              <div className="flex lg:hidden" style={{
                background: C.black,
                borderBottom: C.border,
                padding: '0.4rem',
                gap: 6,
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
                  <button
                    onClick={() => setEditorMobileTab('editor')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontFamily: C.font,
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      background: editorMobileTab === 'editor' ? C.orange : '#333',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Code Diff
                  </button>
                  <button
                    onClick={() => setEditorMobileTab('analysis')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontFamily: C.font,
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      background: editorMobileTab === 'analysis' ? C.yellow : '#333',
                      color: editorMobileTab === 'analysis' ? C.black : '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Analysis ({editorData.score}/10)
                  </button>
                  <button
                    onClick={() => setEditorMobileTab('chat')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontFamily: C.font,
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      background: editorMobileTab === 'chat' ? '#3B82F6' : '#333',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Side Chat
                  </button>
                </div>

                <button
                  onClick={() => setEditorOpen(false)}
                  style={{
                    fontFamily: C.font,
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    background: '#EF4444',
                    color: '#fff',
                    border: 'none',
                    padding: '0.35rem 0.65rem',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  ✕ Close
                </button>
              </div>

              {/* Editor Workspace Area */}
              <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Panel 1: Review Analysis Panel */}
                <div
                  className={`${editorMobileTab === 'analysis' ? 'flex' : 'hidden'} lg:flex`}
                  style={{
                    width: '100%',
                    maxWidth: 320,
                    borderRight: C.border,
                    background: '#fff',
                    padding: '1.25rem',
                    overflowY: 'auto',
                    flexShrink: 0,
                  }}
                >
                  <ReviewAnalysisPanel reviewData={editorData} />
                </div>
                
                {/* Panel 2: Code Comparison Editors */}
                <div
                  className={`${editorMobileTab === 'editor' ? 'flex' : 'hidden'} lg:flex`}
                  style={{ flex: 1, flexDirection: 'column', overflow: 'hidden' }}
                >
                  {/* Diff view switch for smaller screens */}
                  <div className="flex md:hidden" style={{
                    padding: '0.35rem 0.75rem',
                    background: '#FAFAF8',
                    borderBottom: '1px solid #D9D6CF',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: '0.7rem', fontFamily: C.font, fontWeight: 700, color: C.muted }}>SHOW:</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => setEditorDiffView('original')}
                        style={{
                          background: editorDiffView === 'original' ? C.yellow : '#fff',
                          border: '1px solid #0A0A0A',
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.65rem',
                          fontFamily: C.font,
                          fontWeight: 700,
                        }}
                      >
                        Original
                      </button>
                      <button
                        onClick={() => setEditorDiffView('improved')}
                        style={{
                          background: editorDiffView === 'improved' ? C.orange : '#fff',
                          color: editorDiffView === 'improved' ? '#fff' : C.black,
                          border: '1px solid #0A0A0A',
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.65rem',
                          fontFamily: C.font,
                          fontWeight: 700,
                        }}
                      >
                        Improved
                      </button>
                      <button
                        onClick={() => setEditorDiffView('both')}
                        style={{
                          background: editorDiffView === 'both' ? C.black : '#fff',
                          color: editorDiffView === 'both' ? '#fff' : C.black,
                          border: '1px solid #0A0A0A',
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.65rem',
                          fontFamily: C.font,
                          fontWeight: 700,
                        }}
                      >
                        Both
                      </button>
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', overflow: 'hidden' }}>
                      {/* Left Editor: Original Submission */}
                      {(editorDiffView === 'both' || editorDiffView === 'original') && (
                        <div style={{
                          flex: 1,
                          minWidth: 280,
                          display: 'flex',
                          flexDirection: 'column',
                          borderRight: C.border,
                          background: '#fff',
                          overflow: 'hidden',
                        }}>
                          <div style={{ padding: '0.5rem 0.75rem', background: C.yellow, borderBottom: C.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: C.font, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Original Submission</span>
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
                      )}

                      {/* Right Editor: Architect Improvements */}
                      {(editorDiffView === 'both' || editorDiffView === 'improved') && (
                        <div style={{
                          flex: 1,
                          minWidth: 280,
                          display: 'flex',
                          flexDirection: 'column',
                          background: '#fff',
                          overflow: 'hidden',
                        }}>
                          <div style={{ padding: '0.5rem 0.75rem', background: C.orange, borderBottom: C.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: C.font, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#fff' }}>Architect Improvements</span>
                            <button
                              onClick={() => setEditorOpen(false)}
                              className="hidden lg:block"
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
                      )}
                    </div>

                    {/* Embedded Input Bar */}
                    <div style={{ padding: '0.75rem', background: '#fff', borderTop: C.border }}>
                      <div style={{ border: C.border, background: '#FAFAF8', padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', smDirection: 'row', gap: 8 }}>
                        <textarea
                          value={inputCode}
                          onChange={(e) => setInputCode(e.target.value)}
                          placeholder="Ask follow-up or describe changes..."
                          style={{ flex: 1, background: 'transparent', border: 'none', color: C.black, fontSize: 13, outline: 'none', resize: 'none', minHeight: 40 }}
                          rows={1}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            onClick={handleTextSubmit}
                            disabled={isSynthesizing || !inputCode.trim()}
                            style={{ background: '#fff', border: C.thinBorder, color: C.black, padding: '0.45rem 0.85rem', fontFamily: C.font, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            SEND CHAT
                          </button>
                          <button
                            onClick={handleReviewSubmit}
                            disabled={isSynthesizing || !inputCode.trim()}
                            style={{ background: C.orange, border: C.thinBorder, color: '#fff', padding: '0.45rem 0.85rem', fontFamily: C.font, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            CODE REVIEW
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel 3: Side Chat */}
                <div
                  className={`${editorMobileTab === 'chat' ? 'flex' : 'hidden'} xl:flex`}
                  style={{
                    width: '100%',
                    maxWidth: 340,
                    height: '100%',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <SideChat 
                    isOpen={true}
                    selectedText={sideChatText}
                    reviewId={editorData.reviewId}
                    onClose={() => setEditorOpen(false)}
                    isEditorMode={true}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* ── CHAT MODE ── */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 0.75rem 9rem', overflowY: 'auto', overscrollBehavior: 'contain', width: '100%' }}>
              {messages.length === 0 && !loadingHistory && (
                <div style={{ maxWidth: 600, width: '100%', textAlign: 'center', marginTop: 'clamp(2rem, 8vh, 6rem)', padding: '0 1rem' }}>
                  <div style={{ width: 56, height: 56, background: C.yellow, border: C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: C.shadow }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 28 }}>psychology</span>
                  </div>
                  <h1 style={{ fontFamily: C.font, fontWeight: 900, fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                    Your AI Code Mentor
                  </h1>
                  <p style={{ fontFamily: C.body, fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', color: C.muted, lineHeight: 1.6 }}>
                    Paste a block of code, submit a file, or ask a question. CodeLens AI handles code reviews, security scanning, and inline chat natively.
                  </p>
                </div>
              )}

              {loadingHistory && (
                 <div style={{ marginTop: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5 }}>
                   <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #000', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                   <span style={{ fontSize: '0.7rem', fontWeight: 700, marginTop: '1rem', letterSpacing: '0.1em' }}>LOADING HISTORY...</span>
                 </div>
              )}

              <div style={{ maxWidth: 760, width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0 0.5rem' }}>
                {messages.map((msg, idx) => (
                  <div key={msg.id || idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
                    {msg.role === 'user' ? (
                       <div style={{ maxWidth: '92%', background: '#fff', border: C.border, boxShadow: '3px 3px 0 #0A0A0A', padding: '0.85rem 1rem' }}>
                         {msg.type === 'code' ? (
                           <pre style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                             {msg.code}
                           </pre>
                         ) : (
                           <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5, wordBreak: 'break-word' }}>{msg.content}</p>
                         )}
                       </div>
                    ) : (
                      <div style={{ maxWidth: '96%', display: 'flex', gap: '0.75rem', width: '100%' }}>
                        <div style={{ width: 32, height: 32, background: C.orange, border: C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_awesome</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {msg.type === 'error' && (
                             <div style={{ border: `2px solid ${C.orange}`, background: 'rgba(232,68,10,0.08)', padding: '0.75rem', fontSize: '0.85rem', color: C.orange }}>
                               {msg.content}
                             </div>
                          )}
                          {msg.type === 'text' && (
                             <div style={{ fontSize: '0.88rem', lineHeight: 1.6, background: '#fff', border: C.border, padding: '0.85rem 1rem', boxShadow: '3px 3px 0 #0A0A0A', wordBreak: 'break-word' }}>
                               {msg.content}
                             </div>
                          )}
                          {msg.type === 'review' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                               <div style={{ background: '#fff', border: C.border, padding: '1rem', boxShadow: '4px 4px 0 #0A0A0A' }}>
                                  <span style={{ fontFamily: C.font, fontWeight: 900, fontSize: '1rem', color: C.orange, display: 'block', marginBottom: '0.4rem' }}>
                                    {msg.score}/10 — Reviewed.
                                  </span>
                                  <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.6, wordBreak: 'break-word' }} onMouseUp={handleSelection}>
                                    {msg.content}
                                  </p>
                               </div>
                               
                               {msg.improvedCode && (
                                 <div style={{ background: '#fff', border: C.border, overflow: 'hidden', boxShadow: '4px 4px 0 #0A0A0A' }}>
                                    <div style={{ background: C.black, color: '#fff', padding: '0.4rem 0.75rem', fontSize: '0.72rem', fontWeight: 700 }}>
                                       Improved version ready
                                    </div>
                                    <pre style={{ margin: 0, padding: '0.75rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', background: '#FAFAF8', overflowX: 'auto', borderBottom: '1px solid #ECEAE4' }}>
                                       {msg.improvedCode.split('\n').slice(0, 4).join('\n')}...
                                    </pre>
                                    <div style={{ padding: '0.6rem 0.75rem', background: '#fff', display: 'flex', justifyContent: 'flex-end' }}>
                                       <button 
                                         onClick={() => openEditorMode(msg)} 
                                         style={{ fontFamily: C.font, fontWeight: 700, fontSize: '0.72rem', background: C.orange, border: C.thinBorder, color: '#fff', padding: '0.4rem 0.85rem', cursor: 'pointer' }}
                                       >
                                         Open in editor ↗
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
              <div style={{
                position: 'fixed',
                bottom: '1.25rem',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: 760,
                padding: '0 0.75rem',
                zIndex: 30,
              }}>
                <div style={{
                  background: '#fff',
                  border: C.border,
                  boxShadow: '5px 5px 0 #0A0A0A',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}>
                  <textarea
                    ref={textareaRef}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="Paste code or type a message to review..."
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: C.black,
                      fontSize: 'clamp(12px, 2.5vw, 14px)',
                      outline: 'none',
                      resize: 'none',
                      minHeight: 48,
                    }}
                    rows={2}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setModelUsed(modelUsed === 'gemini' ? 'llama3' : 'gemini')}
                        style={{
                          background: '#ECEAE4',
                          border: '1px solid #0A0A0A',
                          padding: '0.3rem 0.55rem',
                          fontSize: '0.68rem',
                          fontFamily: C.font,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ⚡ {modelUsed === 'gemini' ? 'GEMINI' : 'LLAMA'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={handleTextSubmit}
                        disabled={isSynthesizing || !inputCode.trim()}
                        style={{
                          background: '#fff',
                          border: C.thinBorder,
                          color: C.black,
                          padding: '0.45rem 0.85rem',
                          fontFamily: C.font,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          boxShadow: '2px 2px 0 #000',
                        }}
                      >
                        CHAT 💬
                      </button>
                      <button
                        onClick={handleReviewSubmit}
                        disabled={isSynthesizing || !inputCode.trim()}
                        style={{
                          background: C.orange,
                          border: C.thinBorder,
                          color: '#fff',
                          padding: '0.45rem 0.85rem',
                          fontFamily: C.font,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          boxShadow: '2px 2px 0 #000',
                        }}
                      >
                        {isSynthesizing ? 'ANALYZING...' : 'REVIEW 🚀'}
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
         fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em', color: C.muted,
         padding: '2px', zIndex: 5, textAlign: 'center', pointerEvents: 'none',
      }}>
        AI CAN MAKE MISTAKES. VERIFY IMPORTANT CODE.
      </p>
    </div>
  )
}
