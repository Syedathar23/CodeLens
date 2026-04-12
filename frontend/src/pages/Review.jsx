import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { createSession, reviewCode, getRecentReviews } from '../services/api'
import Navbar from '../components/Navbar'     // Since we don't have Sidebar nav anymore, Navbar must handle the page
import ReviewAnalysisPanel from '../components/ReviewAnalysisPanel'
import CodePanel from '../components/CodePanel'
import AIReviewSection from '../components/AIReviewSection' // if needed later
import SideChat from '../components/SideChat'
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { getLanguageExtension } from '../components/CodePanel'

export default function Review() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const isChats = location.pathname === '/review' || location.pathname === '/chat'
  const isDashboard = location.pathname === '/dashboard'
  const userName = localStorage.getItem('userName') || 'Developer'
  const initials = userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  // App state
  
  const userId = localStorage.getItem('userId') || 1
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
  
  // Editor mode state
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorData, setEditorData] = useState(null) // { code, improvedCode, reviewId, score, issues, summary, bugs, tips, security }

  // Input states
  const [inputCode, setInputCode] = useState('')
  const language = 'auto' // Replaced with auto language detection
  const [modelUsed, setModelUsed] = useState('gemini')
  const [isSynthesizing, setIsSynthesizing] = useState(false)
  
  // Selection popup states
  const [popupPos, setPopupPos] = useState(null)
  const [popupText, setPopupText] = useState('')
  const [sideChatOpen, setSideChatOpen] = useState(false)
  const [sideChatText, setSideChatText] = useState('')
  const [replyContext, setReplyContext] = useState(null)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Global click outside to clear selection
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
    
    // Hide popup when typing
    const hideOnType = () => setPopupPos(null)
    window.addEventListener('keydown', hideOnType)
    
    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('keydown', hideOnType)
    }
  }, [])

  // Handle selection for inline sidechat
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

  // 1. Fetch History on mount
  useEffect(() => {
    async function fetchSession() {
      if (!savedSessionId) {
        setLoadingHistory(false)
        return
      }
      try {
        const res = await axios.get(`http://localhost:8000/reviews/session/${savedSessionId}`)
        const sessionReviews = res.data
        if (sessionReviews.length > 0) {
          const loadedMessages = []
          sessionReviews.forEach(rev => {
            // Push User Submission Code Bubble
            loadedMessages.push({
              id: `user-${rev.id}`,
              role: 'user',
              type: 'code',
              content: 'Please review this code.',
              code: rev.code,
              language: rev.language
            })
            // Push AI Response Bubble
            loadedMessages.push({
              id: `ai-${rev.id}`,
              role: 'ai',
              type: 'review',
              content: rev.summary,
              score: rev.score,
              issues: rev.issues,
              improvedCode: rev.improved_code,
              originalCode: rev.code,
              reviewId: rev.id,
              language: rev.language
            })
          })
          setMessages(loadedMessages)
        }
      } catch (err) {
        console.error("Failed to load session history", err)
      } finally {
        setLoadingHistory(false)
      }
    }
    fetchSession()
  }, [savedSessionId])

  // Scroll to bottom when messages update
  useEffect(() => {
    if (!editorOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, editorOpen])


  // 2. Main Logic -> Handle 'Review'
  async function handleReviewSubmit() {
    if (!inputCode.trim()) return
    setIsSynthesizing(true)

    try {
      let activeSession = sessionId
      
      // Create session if it doesn't exist
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

      // Optimistically add user bubble
      const timestamp = new Date().getTime()
      const userBubble = {
        id: `user-temp-${timestamp}`,
        role: 'user',
        type: 'code',
        content: 'Please review this code.',
        code: inputCode,
        language
      }
      setMessages(prev => [...prev, userBubble])
      
      // Backend request
      let parsedSession = typeof activeSession === 'string' ? parseInt(activeSession, 10) : activeSession
      if (isNaN(parsedSession) || parsedSession <= 0) parsedSession = null
      
      const revRes = await axios.post('http://localhost:8000/review', {
        code: inputCode,
        language,
        model_used: modelUsed,
        user_id: parseInt(userId, 10),
        session_id: parsedSession
      })
      const reviewData = revRes.data

      const reviewMsg = {
        id: `ai-${reviewData.id}`,
        role: 'ai',
        type: 'review',
        content: reviewData.summary,
        score: reviewData.score,
        issues: reviewData.issues || [],
        improvedCode: reviewData.improved_code,
        originalCode: inputCode,
        reviewId: reviewData.id,
        language
      };

      // Add AI bubble
      setMessages(prev => [...prev, reviewMsg])

      localStorage.setItem('lastReviewId', reviewData.id)
      setInputCode('')
      if (textareaRef.current) {
        textareaRef.current.style.height = '24px'
        textareaRef.current.style.overflowY = 'hidden'
      }
      
      // Auto-open diff automatically
      openEditorMode(reviewMsg)

    } catch (err) {
      console.error(err)
      
      setMessages(prev => [...prev, { id: Date.now(), role: 'system', type: 'error', content: 'An error occurred while connecting to CodeLens AI. Connection refused.' }])
    } finally {
      setIsSynthesizing(false)
    }
  }

  // 3. Main Logic -> Handle 'Send Text message'  
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
      const res = await axios.post("http://localhost:8000/chat", {
        message: textStr,
        user_id: parseInt(userId, 10)
      })
      
      setMessages(prev => [...prev, {
        id: `ai-text-${timestamp}`,
        role: 'ai',
        type: 'text',
        content: res.data.response
      }])
    } catch (err) {
      console.error(err)
    } finally {
      setIsSynthesizing(false)
      if (editorOpen) setEditorOpen(false) 
    }
  }

  // 4. Open Editor action 
  function openEditorMode(aiMsg) {
    setEditorData({
      code: aiMsg.originalCode || '',
      improvedCode: aiMsg.improvedCode || '',
      score: aiMsg.score,
      issues: aiMsg.issues || [],
      summary: aiMsg.content,
      language: aiMsg.language
    })
    setEditorOpen(true)
  }

  // Common UI classes
  const btnActive = "bg-primary text-on-primary font-bold shadow-lg shadow-primary/20"
  const btnInactive = "bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-medium border border-outline-variant/30 text-surface-variant hover:text-white"
  
  return (
    <div className="flex flex-col h-screen bg-surface font-body text-on-surface overflow-hidden">
      
      {/* Compact Top Bar */}
      <div className="h-[65px] bg-[#0e0e0e] px-6 flex flex-row items-center justify-between border-b border-[#222] shrink-0 z-50 filter drop-shadow-sm font-body">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8  bg-[#10A37F] rounded-md flex items-center justify-center">
            <span className="material-symbols-outlined text-black text-sm">code</span>
          </div>
           <span className="font-bold text-sm tracking-wide text-white">CodeLens AI</span>
        </div>
        <div className="flex items-center gap-6" style={{ transform: 'translateX(20px)' }}>
            <div 
              className="relative flex items-center h-full"
              onMouseEnter={() => { if(dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current); setShowChatsDropdown(true); }}
              onMouseLeave={() => { dropdownTimeoutRef.current = setTimeout(() => setShowChatsDropdown(false), 200); }}
            >
              <button 
                onClick={() => navigate('/chats')} 
                className="text-[15px] font-medium transition-colors cursor-pointer"
                style={{ 
                  background: 'none', 
                  border: 'none',
                  color: isChats ? '#65f3b6' : '#adaaaa',
                  borderBottom: isChats ? '2px solid #65f3b6' : '2px solid transparent',
                  paddingBottom: 2 
                }}
              >
                Chats
              </button>
              
              {showChatsDropdown && (
                <div className="absolute top-[34px] left-0 w-[280px] bg-[#1C1B1B] border border-[#2a2a2a] rounded-lg z-[100] p-2 max-h-[320px] overflow-y-auto shadow-2xl custom-scroll">
                  <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-[#2a2a2a]">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Recent chats</span>
                    <button onClick={() => navigate('/chats')} className="text-[10px] text-primary hover:underline">View all</button>
                  </div>
                  
                  {allSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <span className="text-xs text-on-surface-variant mb-3">No chats yet</span>
                      <button onClick={() => { setSessionId(null); setMessages([]); localStorage.removeItem('currentSessionId'); setShowChatsDropdown(false); }} className="text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-widest bg-primary text-on-primary w-full transition-colors hover:opacity-80">Start reviewing code</button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {allSessions.map(s => (
                        <div 
                          key={s.id}
                          onClick={() => {
                            if (s.session_id) {
                              setSessionId(s.session_id);
                              localStorage.setItem('currentSessionId', s.session_id);
                              window.location.reload();
                            }
                          }}
                          className="flex flex-col p-2 rounded-md hover:bg-surface-container cursor-pointer transition-colors hover:border-outline-variant/10 border border-transparent"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded font-bold bg-surface-container border border-outline-variant/30">{s.language || 'Code'}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${s.score >= 8 ? 'bg-secondary/20 text-secondary' : s.score >= 5 ? 'bg-amber-400/20 text-amber-500' : 'bg-error/20 text-error'}`}>{s.score}/10</span>
                            </div>
                            <span className="text-[9px] text-on-surface-variant">{new Date(s.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="text-[10px] font-mono-code text-on-surface-variant/70 truncate opacity-70 mt-0.5">
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
              className="text-[15px] font-medium transition-colors cursor-pointer" 
              style={{ 
                background: 'none', 
                border: 'none',
                color: isDashboard ? '#65f3b6' : '#adaaaa',
                borderBottom: isDashboard ? '2px solid #65f3b6' : '2px solid transparent',
                paddingBottom: 2 
              }}
            >
              Dashboard
            </button>
            <button 
              onClick={() => navigate('/contact')} 
              className="text-[15px] font-medium transition-colors cursor-pointer" 
              style={{ 
                background: 'none', 
                border: 'none',
                color: isDashboard ? '#65f3b6' : '#adaaaa',
                borderBottom: isDashboard ? '2px solid #65f3b6' : '2px solid transparent',
                paddingBottom: 2 
              }}
            >
              Contact Us
            </button>
        </div>
        <div className="flex items-center gap-5">
            <button onClick={() => { localStorage.removeItem('currentSessionId'); localStorage.removeItem('lastReviewId'); window.location.reload(); }} style={{
              padding: "6px 16px",
              background: "#10A37F",
              border: "1px solid #10A37F",
              borderRadius: 20,
              color: "#000000ff",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              + New Chat
            </button>
            <div
              onClick={() => navigate("/profile")}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#10A37F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 600,
                color: "#000000ff",
                cursor: "pointer",
              }}
              title="View Profile"
            >
              {initials}
            </div>
        </div>
      </div>

      {/* Main Responsive Layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        
        {/* ============================================================== */}
        {/* EDITOR SPLIT MODE (3 Panels) */}
        {/* ============================================================== */}
        {editorOpen && editorData ? (
          <div className="animated-fade-in" style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0, height: "100%", background: '#0e0e0e' }}>
            
            {/* Panel 1: Review Analysis (Fixed 220px) */}
            <ReviewAnalysisPanel reviewData={editorData} />
            
            {/* Panel 2: Center Code Editors (Flex 1) */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0, height: "100%" }}>

              {/* Two Editors side by side */}
              <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0, height: "100%" }}> 
                 {/* Left Editor */}
                 <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100%", borderRight: '1px solid #222', background: '#1c1b1b' }}>
                    <div style={{ padding: '15px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, color: '#666', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Original Submission</span>
                        {editorData.language && editorData.language !== "Unknown" && (
                          <span style={{ 
                            fontSize: 9, 
                            fontWeight: 700, 
                            padding: '2px 6px', 
                            borderRadius: 4, 
                            background: '#2a2a2a', 
                            color: '#e0e0e0' 
                          }}>
                            {editorData.language}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="code-panel-content custom-scroll" style={{ flex: 1, overflow: "auto", minHeight: 0, height: "100%" }} onMouseUp={handleSelection}>
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
                 <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100%", background: '#101010' }}>
                    <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222' }}>
                      <span style={{ fontSize: 10, color: '#1D9E75', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, background: '#1D9E75', display: 'inline-block', borderRadius: '50%' }}></span>
                        Architect Improvements
                      </span>
                      <button
                        onClick={() => setEditorOpen(false)}
                        style={{
                          padding: "6px 14px",
                          background: "#FF6B6B",
                          border: "1px solid #FF6B6B",
                          borderRadius: 6,
                          color: "#ffffff",
                          fontSize: 12,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                         Back to Chat
                      </button>
                    </div>
                    <div className="code-panel-content custom-scroll" style={{ flex: 1, overflow: "auto", minHeight: 0, height: "100%" }} onMouseUp={handleSelection}>
                       <CodePanel 
                         code={editorData.improvedCode || editorData.code || ''}
                         originalCode={editorData.code || ''}
                         language={editorData.language}
                         score={editorData.score}
                         editable={false}
                         isLatest={true}
                         bugs={editorData.issues?.filter(i=>i.type==='bug').length || 0}
                         tips={editorData.issues?.filter(i=>i.type==='suggestion').length || 0}
                         security={editorData.issues?.filter(i=>i.type==='security').length || 0}
                         issues={editorData.issues || []}
                       />
                    </div>
                 </div>
              </div>
              
              {/* === Embedded Input Bar Inside Panel 2 === */}
              <div style={{ padding: '12px 16px', background: '#131313', borderTop: '1px solid #222', flexShrink: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '800px', background: '#1A1C1A', borderRadius: 12, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  
                  {/* Model Selector styled as pill */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#252724', padding: '6px 12px', borderRadius: 20, cursor: 'pointer', border: '1px solid #333' }}
                       onClick={() => setModelUsed(modelUsed === 'gemini' ? 'llama3' : 'gemini')}
                  >
                    <span style={{ fontSize: 12 }}>⚡</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#e0e0e0', letterSpacing: 0.5 }}>{modelUsed === 'gemini' ? 'GEMINI PRO' : 'LLAMA 3'}</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#8a8a8a' }}>expand_more</span>
                  </div>

                  {/* Input field */}
                  <textarea
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextSubmit(); }
                    }}
                    onInput={(e) => {
                      e.target.style.height = 'auto'
                      const lineHeight = 20
                      const maxHeight = lineHeight * 5
                      const scrollHeight = e.target.scrollHeight
                      e.target.style.height = Math.min(scrollHeight, maxHeight) + 'px'
                      e.target.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden'
                    }}
                    placeholder="Ask follow-up or describe changes..."
                    style={{ flex: 1, background: 'transparent', border: 'none', color: '#e0e0e0', fontSize: 13, outline: 'none', resize: 'none', minHeight: 24, maxHeight: 100, overflowY: 'hidden' }}
                    rows={1}
                  />

                  {/* Submit buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={handleTextSubmit}
                      disabled={isSynthesizing || !inputCode.trim()}
                      style={{ background: 'transparent', border: 'none', color: '#8a8a8a', cursor: 'pointer', display: 'flex' }}
                    >
                      <span className="material-symbols-outlined hover:text-[#65f3b6] transition-colors" style={{ fontSize: 18 }}>send</span>
                    </button>
                    
                    <button
                      onClick={handleReviewSubmit}
                      disabled={isSynthesizing || !inputCode.trim()}
                      style={{
                        background: 'linear-gradient(135deg, #65f3b6, #1D9E75)',
                        border: 'none', borderRadius: 20, padding: '8px 16px',
                        color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2,
                        opacity: (isSynthesizing || !inputCode.trim()) ? 0.6 : 1
                      }}
                    >
                      CODE REVIEW <span style={{ fontSize: 12, marginLeft: 4 }}>🚀</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel 3: Review Thread inline layout */}
            <SideChat 
              isOpen={true}
              selectedText={sideChatText}
              reviewId={editorData.reviewId}
              onClose={() => setEditorOpen(false)}
              isEditorMode={true}
            />

          </div>
        ) : (
          /* ============================================================== */
          /* CHAT MODE (STAGE 1 & Thread) */
          /* ============================================================== */
          <div className="flex-1 overflow-y-auto px-4 md:px-0 flex flex-col items-center custom-scroll pb-12">
            
            {messages.length === 0 && !loadingHistory && (
              <div className="max-w-2xl w-full flex flex-col items-center justify-center text-center pt-32 shrink-0">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-xl shadow-primary/20 glow-primary transition-all duration-700">
                  <span className="material-symbols-outlined text-white text-3xl">psychology</span>
                </div>
                <h1 className="font-headline font-bold text-4xl mb-3 tracking-tight">Your AI-powered code mentor.</h1>
                <p className="text-on-surface-variant max-w-lg leading-relaxed text-sm">
                  Paste a block of code, submit a file, or ask a question. The Obsidian Architect handles code reviews, security scanning, and inline chat natively.
                </p>
              </div>
            )}

            {loadingHistory && (
               <div className="pt-32 flex items-center flex-col opacity-50">
                 <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
                 <span className="text-[10px] uppercase tracking-widest font-mono-code font-bold">LOADING SESSION...</span>
               </div>
            )}

            <div className="max-w-[760px] mx-auto w-full flex flex-col gap-6 pt-12 pb-12 shrink-0 h-auto">
              {messages.map((msg, idx) => (
                <div key={msg.id || idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  
                  {msg.role === 'user' ? (
                     <div className="max-w-[85%] sm:max-w-2xl bg-surface-container-high rounded-2xl rounded-tr-sm p-4 relative border border-outline-variant/10 shadow-lg glow-surface">
                       {msg.type === 'code' ? (
                         <div className="font-mono-code text-xs bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/10 whitespace-pre-wrap overflow-hidden max-h-32 relative text-on-surface-variant">
                           {msg.code?.split('\n').slice(0,3).join('\n')}
                           {msg.code?.split('\n').length > 3 && '\n...'}
                         </div>
                       ) : (
                         <p className="text-sm leading-6 whitespace-pre-wrap">{msg.content}</p>
                       )}
                     </div>
                  ) : (
                    <div className="max-w-[90%] sm:max-w-3xl bg-transparent flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-[#10A37F] flex items-center justify-center shrink-0 shadow-lg mt-1">
                        <span className="material-symbols-outlined text-on-primary text-[18px]">auto_awesome</span>
                      </div>
                      <div className="flex-1 flex flex-col">
                        {/* Error */}
                        {msg.type === 'error' && (
                           <div className="bg-error/10 text-error p-3 rounded border border-error/20 inline-block text-sm">
                             {msg.content}
                           </div>
                        )}
                        
                        {/* Text Only AI */}
                        {msg.type === 'text' && (
                           <div className="text-sm text-on-surface leading-7 p-2">{msg.content}</div>
                        )}

                        {/* Review Block */}
                        {msg.type === 'review' && (
                          <div className="flex flex-col gap-3">
                             <div className="flex flex-col gap-1 p-2">
                                <span className="font-headline font-bold text-lg text-[#10A37F]">{msg.score}/10 — Reviewed.</span>
                                <p className="text-on-surface text-sm leading-6 opacity-90 ai-response-text" onMouseUp={handleSelection}>{msg.content}</p>
                             </div>
                             
                             {/* Issues quick pill preview */}
                             {msg.issues && msg.issues.length > 0 && (
                               <div className="flex gap-2 flex-wrap mb-2 pl-2">
                                 {msg.issues.slice(0, 3).map((ish, i) => (
                                    <span key={i} className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${ish.type==='bug' ? 'border-error text-error bg-error/10' : ish.type==='security' ? 'border-orange-500 text-orange-500 bg-orange-500/10' : 'border-amber-400 text-amber-500 bg-amber-400/10'}`}>
                                      {ish.type}
                                    </span>
                                 ))}
                                 {msg.issues.length > 3 && <span className="text-[10px] text-on-surface-variant font-bold px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant/30">+{msg.issues.length - 3} MORE</span>}
                               </div>
                             )}

                             {/* Code Truncated Bubble */}
                             {msg.improvedCode && (
                               <div className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden w-[600px] shadow-lg max-w-full">
                                  <div className="bg-surface-container-low px-4 py-2 border-b border-outline-variant/20 flex justify-between items-center text-xs text-on-surface font-bold tracking-wide">
                                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary"></span> Improved version ready</span>
                                  </div>
                                  <div className="p-4 font-mono-code text-[11px] bg-surface-container-lowest text-on-surface-variant/80 border-b border-outline-variant/10 leading-relaxed overflow-hidden">
                                     {msg.improvedCode.split('\n').slice(0,3).join('\n')}...
                                  </div>
                                  <div className="p-3 bg-surface-container flex justify-end">
                                     <button 
                                       onClick={() => openEditorMode(msg)} 
                                       className="flex items-center gap-1 text-[11px] uppercase tracking-widest font-bold bg-[#10A37F] px-4 py-2 rounded shadow-lg text-black hover:opacity-90 transition-opacity"
                                     >
                                       <span className="material-symbols-outlined text-[14px]">terminal</span>
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
              <div ref={messagesEndRef} className="h-10" />
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* UNIVERSAL BOTTOM CHAT INPUT BAR  (ONLY FOR STAGE 1)            */}
      {/* ============================================================== */}
      {!editorOpen && (
        <div style={{ flexShrink: 0, width: '100%', padding: '12px 0 16px', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 30 }}>
          
          {replyContext && (
            <div style={{
              width: '100%', maxWidth: '800px',
              padding: "6px 10px", borderLeft: "2px solid #aaa4ff", background: "rgba(170,164,255,0.08)",
              borderRadius: "0 6px 6px 0", marginBottom: 6, fontSize: 11, color: "#adaaaa",
              display: "flex", justifyContent: "space-between"
            }}>
              <span>"{replyContext.length > 80 ? replyContext.substring(0, 80) + '...' : replyContext}"</span>
              <button onClick={() => setReplyContext(null)} className="text-[#adaaaa] hover:text-white transition-colors">×</button>
            </div>
          )}

          <div style={{ width: '100%', maxWidth: '800px', background: '#1A1C1A', borderRadius: 12, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 12 }} className="shadow-2xl">
            
            {/* Model Selector styled as pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#252724', padding: '6px 12px', borderRadius: 20, cursor: 'pointer', border: '1px solid #333', flexShrink: 0 }}
                 onClick={() => setModelUsed(modelUsed === 'gemini' ? 'llama3' : 'gemini')}
            >
              <span style={{ fontSize: 12 }}>⚡</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#e0e0e0', letterSpacing: 0.5 }}>{modelUsed === 'gemini' ? 'GEMINI PRO' : 'LLAMA 3'}</span>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#8a8a8a' }}>expand_more</span>
            </div>

            {/* Input field */}
            <textarea
              ref={textareaRef}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextSubmit(); }
              }}
              onInput={(e) => {
                e.target.style.height = 'auto'
                const lineHeight = 20
                const maxHeight = lineHeight * 5
                const scrollHeight = e.target.scrollHeight
                e.target.style.height = Math.min(scrollHeight, maxHeight) + 'px'
                e.target.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden'
              }}
              placeholder="Ask follow-up or describe changes..."
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#e0e0e0', fontSize: 13, outline: 'none', resize: 'none', minHeight: 24, maxHeight: 100, overflowY: 'hidden' }}
              rows={1}
            />

            {/* Submit buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <button
                onClick={handleTextSubmit}
                disabled={isSynthesizing || !inputCode.trim()}
                style={{ background: 'transparent', border: 'none', color: '#8a8a8a', cursor: 'pointer', display: 'flex' }}
              >
                <span className="material-symbols-outlined hover:text-[#65f3b6] transition-colors" style={{ fontSize: 18 }}>send</span>
              </button>
              
              <button
                onClick={handleReviewSubmit}
                disabled={isSynthesizing || !inputCode.trim()}
                style={{
                  background: 'linear-gradient(135deg, #65f3b6, #1D9E75)',
                  border: 'none', borderRadius: 20, padding: '8px 16px',
                  color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2,
                  opacity: (isSynthesizing || !inputCode.trim()) ? 0.6 : 1
                }}
              >
                {isSynthesizing ? 'ANALYZING...' : 'CODE REVIEW'} <span style={{ fontSize: 12, marginLeft: 4 }}>🚀</span>
              </button>
            </div>
          </div>
        </div>
      )}
        
      {/* ============================================================== */}
      {/* SIDE CHAT AND POPUP                                            */}
      {/* ============================================================== */}
      {!editorOpen && (
        <SideChat 
          isOpen={sideChatOpen}
          selectedText={sideChatText}
          reviewId={editorData ? editorData.reviewId : null}
          onClose={() => setSideChatOpen(false)}
        />
      )}

        {popupPos && (
          <div 
            id="selection-popup"
            className="fixed z-50 bg-surface-container border border-outline-variant/30 p-2 rounded-lg shadow-xl shadow-black/80 flex gap-2 transform -translate-x-1/2"
            style={{ top: popupPos.top + 8, left: popupPos.left }}
          >
             <button 
                onClick={() => { setSideChatText(popupText); setSideChatOpen(true); setPopupPos(null); }}
                className="text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/10 hover:bg-primary/20 transition-colors px-3 py-1.5 rounded"
             >
                <span className="material-symbols-outlined text-[12px] align-middle mr-1">chat</span>
                Side Chat
             </button>
             <button 
                onClick={() => { 
                   setReplyContext(popupText); 
                   setPopupPos(null); 
                   if (textareaRef.current) textareaRef.current.focus();
                }}
                className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest hover:bg-surface-container-high transition-colors px-3 py-1.5 rounded"
             >
                <span className="material-symbols-outlined text-[12px] align-middle mr-1">forum</span>
                Main Chat
             </button>
          </div>
        )}

        <p style={{
           position: 'fixed',
           bottom: 0,
           width: '50%',
           textAlign: 'center',
           fontSize: '11px',
           color: '#ffffffff',
           padding: '4px',
           background: '#0e0e0e',
           zIndex: 5, 
           display:'flex',
           justifyContent: 'center',
           alignItems: 'center',
           left: '50%',
           transform: 'translateX(-50%)',
           paddingtop: '12px',
           
        }} className="tracking-widest">
          AI CAN MAKE MISTAKES. VERIFY IMPORTANT INFRASTRUCTURE.
        </p>

      </div>
  )
}

