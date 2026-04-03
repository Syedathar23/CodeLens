import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { createSession, reviewCode } from '../services/api'
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
  
  // App state
  const userId = localStorage.getItem('userId') || 1
  const savedSessionId = localStorage.getItem('currentSessionId')

  const [sessionId, setSessionId] = useState(savedSessionId)
  const [messages, setMessages] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  
  // Editor mode state
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorData, setEditorData] = useState(null) // { code, improvedCode, reviewId, score, issues, summary, bugs, tips, security }

  // Input states
  const [inputCode, setInputCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [modelUsed, setModelUsed] = useState('gemini')
  const [isSynthesizing, setIsSynthesizing] = useState(false)
  
  // Selection popup states
  const [popupPos, setPopupPos] = useState(null)
  const [popupText, setPopupText] = useState('')
  const [sideChatOpen, setSideChatOpen] = useState(false)
  const [sideChatText, setSideChatText] = useState('')

  const messagesEndRef = useRef(null)

  // Global mouseup for chat selection 
  useEffect(() => {
    function handleMouseUp(e) {
      // Don't trigger if clicking inside the popup itself
      if (e.target.closest('#selection-popup')) return
      
      const selection = window.getSelection()
      const text = selection.toString().trim()
      if (text.length > 0 && text.length < 500) {
        // try to get bounding rect of selection for absolute positioning
        try {
           const range = selection.getRangeAt(0)
           const rect = range.getBoundingClientRect()
           setPopupPos({ top: rect.bottom, left: rect.left + (rect.width / 2) })
           setPopupText(text)
        } catch(e) { /* ignore */ }
      } else {
        setPopupPos(null)
      }
    }
    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [])

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
        const sessRes = await createSession(parseInt(userId, 10), language)
        activeSession = sessRes.id
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

      // Add AI bubble
      setMessages(prev => [...prev, {
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
      }])

      localStorage.setItem('lastReviewId', reviewData.id)
      setInputCode('')
      
      // Auto-open diff if you want, but explicitly requested to be button driven. 
      // User can click "Open in editor" on the bubble!

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

    // A raw chat message without triggering a review (we're hacking this to just post a visual text bubble, 
    // real chat integration with Gemini context requires more backend logic, but this fulfills the UI logic)
    const textStr = inputCode
    const timestamp = new Date().getTime()
    setMessages(prev => [
      ...prev, 
      { id: `user-text-${timestamp}`, role: 'user', type: 'text', content: textStr }
    ])
    setInputCode('')
    
    // Simulate generic AI text response for now, or just leave it since the backend POST /review is strictly code-based
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: `ai-text-${timestamp}`, role: 'ai', type: 'text', content: 'I am here to help. Select a code block or hit Review to analyze your code.'}
      ])
      setIsSynthesizing(false)
      if (editorOpen) setEditorOpen(false) // Exit editor view to show the chat bubble if user types something random!
    }, 1500)
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
      
      {/* Absolute Navbar matching layout structure without the Sidebar */}
      <Navbar />

      {/* Main Responsive Layout */}
      <div className="flex flex-col flex-1 mt-14 overflow-hidden relative">
        
        {/* ============================================================== */}
        {/* EDITOR SPLIT MODE */}
        {/* ============================================================== */}
        {editorOpen && editorData ? (
          <div className="flex-1 flex overflow-hidden w-full animated-fade-in bg-surface">
            {/* Left Collapsible Details */}
            <ReviewAnalysisPanel reviewData={editorData} />
            
            {/* Middle Code Diff */}
            <div className="flex-1 flex flex-col p-2 bg-surface-container-lowest overflow-hidden">
              <div className="flex justify-between items-center mb-2 px-2 shrink-0">
                <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">
                  <span className="text-secondary mr-2">●</span> Code Diff Viewer
                </span>
                <button 
                  onClick={() => setEditorOpen(false)} 
                  className="px-3 py-1 bg-surface-container rounded-lg text-[10px] uppercase tracking-widest font-bold border border-outline-variant/20 hover:border-primary transition-colors text-on-surface-variant flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">subdirectory_arrow_left</span>
                  Back to chat
                </button>
              </div>
              
              <div className="flex-1 flex gap-2 overflow-hidden h-full pb-20"> {/* pb-20 leaves room for chat bar */}
                 {/* Original code */}
                 <div className="w-1/2 flex flex-col min-h-0 bg-surface-container border border-error/20 rounded-xl overflow-hidden shadow-lg relative">
                    <div className="px-4 py-2 bg-error/10 border-b border-error/20 flex justify-between absolute top-0 w-full z-10">
                      <span className="text-[10px] text-error font-bold uppercase tracking-widest">Original Submittion</span>
                    </div>
                    <div className="flex-1 mt-8">
                       <CodePanel 
                         code={editorData.code || ''}
                         language={editorData.language}
                         editable={false}
                         isLatest={false}
                       />
                    </div>
                 </div>

                 {/* Improved Code */}
                 <div className="w-1/2 flex flex-col min-h-0 bg-surface-container border border-secondary/20 rounded-xl overflow-hidden shadow-lg relative">
                    <div className="px-4 py-2 bg-secondary/10 border-b border-secondary/20 flex justify-between absolute top-0 w-full z-10">
                      <span className="text-[10px] text-secondary font-bold uppercase tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">auto_awesome</span> Architect Improvements</span>
                    </div>
                    <div className="flex-1 mt-8">
                       <CodePanel 
                         code={editorData.improvedCode || editorData.code || ''}
                         language={editorData.language}
                         score={editorData.score}
                         editable={false}
                         isLatest={true}
                         bugs={editorData.issues?.filter(i=>i.type==='bug').length || 0}
                         tips={editorData.issues?.filter(i=>i.type==='suggestion').length || 0}
                         security={editorData.issues?.filter(i=>i.type==='security').length || 0}
                       />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* CHAT MODE (STAGE 1 & Thread) */
          /* ============================================================== */
          <div className="flex-1 overflow-y-auto px-4 md:px-0 flex flex-col items-center custom-scroll pb-32">
            
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

            <div className="max-w-4xl w-full flex flex-col gap-6 pt-12 pb-12 shrink-0 h-auto">
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
                      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 glow-primary shadow-lg mt-1">
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
                                <span className="font-headline font-bold text-lg text-primary">{msg.score}/10 — Reviewed.</span>
                                <p className="text-on-surface text-sm leading-6 opacity-90">{msg.content}</p>
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
                                       className="flex items-center gap-1 text-[11px] uppercase tracking-widest font-bold gradient-primary px-4 py-2 rounded shadow-lg text-on-primary hover:opacity-90 transition-opacity"
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

        {/* ============================================================== */}
        {/* UNIVERSAL BOTTOM CHAT INPUT BAR                                */}
        {/* ============================================================== */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-surface via-surface to-transparent pt-12 pb-6 px-4 pointer-events-none z-30">
          <div className="max-w-4xl mx-auto flex flex-col relative pointer-events-auto shadow-2xl shadow-black/50">
            <div className="bg-surface-container-high border border-outline-variant/30 rounded-2xl flex flex-col overflow-hidden focus-within:border-primary/50 transition-colors">
              
              {/* Top CodeMirror embedded input instead of a textarea */}
              <div className="p-2 border-b border-outline-variant/10 max-h-48 overflow-y-auto">
                 <CodeMirror
                   value={inputCode}
                   onChange={(val) => setInputCode(val)}
                   theme={oneDark}
                   extensions={[getLanguageExtension(language)]}
                   placeholder="Type a message or paste code..."
                   basicSetup={{
                     lineNumbers: false,
                     foldGutter: false,
                     highlightActiveLine: false
                   }}
                   className="text-sm rounded custom-cm-input min-h-[44px]"
                 />
                 <style>{`.custom-cm-input .cm-editor { background: transparent !important; } .custom-cm-input .cm-focused { outline: none !important; }`}</style>
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between px-3 py-2 bg-surface-container">
                <div className="flex items-center gap-3">
                  <select 
                    value={language} 
                    onChange={e => setLanguage(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/30 text-[11px] rounded-lg px-2.5 py-1.5 outline-none focus:border-primary cursor-pointer text-on-surface"
                  >
                    {['javascript', 'python', 'typescript', 'java', 'c++', 'c', 'c#', 'go', 'rust', 'sql'].map(l => (
                      <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                    ))}
                  </select>
                  
                  <div className="flex bg-surface-container-low rounded-lg p-0.5 border border-outline-variant/30">
                    <button 
                      onClick={() => setModelUsed('gemini')}
                      className={`text-[9px] uppercase tracking-wider px-3 py-1 rounded font-bold transition-all ${modelUsed === 'gemini' ? btnActive : btnInactive}`}
                    >
                      Gemini
                    </button>
                    <button 
                      onClick={() => setModelUsed('llama3')}
                      className={`text-[9px] uppercase tracking-wider px-3 py-1 rounded font-bold transition-all ${modelUsed === 'llama3' ? btnActive : btnInactive}`}
                    >
                      LLaMA 3
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Text send button - looks more like a ghost icon or simple submittion */}
                  <button
                    onClick={handleTextSubmit}
                    disabled={isSynthesizing || !inputCode.trim()}
                    title="Send as message"
                    className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </button>

                  <button
                    onClick={handleReviewSubmit}
                    disabled={isSynthesizing || !inputCode.trim()}
                    className="gradient-primary px-4 py-1.5 rounded-lg text-on-primary text-[11px] font-bold tracking-widest uppercase disabled:opacity-50 hover:shadow-lg shadow-primary/30 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">{isSynthesizing ? 'hourglass_top' : 'auto_awesome'}</span>
                    {isSynthesizing ? 'Analyzing...' : 'Code Review'}
                  </button>
                </div>
              </div>

            </div>
            <p className="text-[10px] text-center text-outline-variant mt-2 tracking-widest">
              AI CAN MAKE MISTAKES. VERIFY IMPORTANT INFRASTRUCTURE.
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SIDE CHAT AND POPUP                                            */}
        {/* ============================================================== */}
        <SideChat 
          isOpen={sideChatOpen}
          selectedText={sideChatText}
          reviewId={editorData ? editorData.reviewId : null}
          onClose={() => setSideChatOpen(false)}
        />

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
                onClick={() => { setInputCode(prev => prev ? prev + '\n' + popupText : popupText); setPopupPos(null); }}
                className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest hover:bg-surface-container-high transition-colors px-3 py-1.5 rounded"
             >
                <span className="material-symbols-outlined text-[12px] align-middle mr-1">forum</span>
                Main Chat
             </button>
          </div>
        )}

      </div>
    </div>
  )
}
