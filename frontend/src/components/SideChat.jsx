import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

export default function SideChat({
  isOpen,
  onClose,
  selectedText,
  annotationId,
  reviewId
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMsg, setInputMsg] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [currentAnnId, setCurrentAnnId] = useState(annotationId)

  const messagesEndRef = useRef(null)
  
  useEffect(() => {
    setCurrentAnnId(annotationId)
  }, [annotationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, collapsed, isOpen])

  // If newly opened with text, prompt AI
  useEffect(() => {
    if (isOpen && selectedText && !currentAnnId && messages.length === 0) {
      setMessages([
        { role: 'system', content: `Selected: "${selectedText}"\nWhat would you like to know about this?` }
      ])
    }
  }, [isOpen, selectedText, currentAnnId])

  async function handleSend() {
    if (!inputMsg.trim() || !isOpen) return
    setIsSending(true)
    const textMsg = inputMsg
    
    setMessages(prev => [...prev, { role: 'user', content: textMsg }])
    setInputMsg('')

    try {
      let annId = currentAnnId
      // Create annotation mapping if it doesn't exist
      if (!annId && reviewId) {
        const annRes = await axios.post('http://localhost:8000/annotations', {
          review_id: reviewId,
          user_id: parseInt(localStorage.getItem('userId'), 10) || 1,
          selected_text: selectedText,
          position_start: 0,
          position_end: 0,
          chat_type: 'side'
        })
        annId = annRes.data.id
        setCurrentAnnId(annId)
      }

      if (annId) {
        const res = await axios.post(`http://localhost:8000/annotations/${annId}/messages`, {
          annotation_id: annId,
          user_id: parseInt(localStorage.getItem('userId'), 10) || 1,
          message: textMsg
        })
        setMessages(prev => [...prev, { role: 'ai', content: res.data.ai_message.content }])
      } else {
        // Fallback for visual mock
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'ai', content: "I see your snippet. Need to connect real review id." }])
        }, 1000)
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', content: "Failed to connect to the architect." }])
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) return null

  if (collapsed) {
    return (
      <div 
        className="fixed top-1/2 right-0 -translate-y-1/2 w-8 h-24 bg-surface-container-high border-y border-l border-outline-variant/30 rounded-l-lg cursor-pointer flex items-center justify-center shadow-2xl hover:bg-surface-container-highest transition-colors z-50 overflow-hidden"
        onClick={() => setCollapsed(false)}
      >
        <span className="material-symbols-outlined text-on-surface-variant text-sm transform -rotate-90">unfold_more</span>
      </div>
    )
  }

  return (
    <div className="fixed top-14 bottom-0 right-0 w-[340px] bg-surface-container-lowest border-l border-outline-variant/20 flex flex-col shadow-2xl z-40 transform transition-transform duration-300">
      
      {/* Header */}
      <div className="h-12 border-b border-outline-variant/20 flex items-center justify-between px-4 bg-surface-container shrink-0">
         <div className="flex items-center gap-2">
           <span className="material-symbols-outlined text-secondary text-sm">chat_bubble</span>
           <h3 className="font-bold text-xs uppercase tracking-widest text-on-surface">Thread</h3>
         </div>
         <div className="flex items-center gap-1">
           <button onClick={() => setCollapsed(true)} className="w-6 h-6 rounded hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant">
             <span className="material-symbols-outlined text-sm">last_page</span>
           </button>
           <button onClick={onClose} className="w-6 h-6 rounded hover:bg-surface-container-high flex items-center justify-center text-error">
             <span className="material-symbols-outlined text-sm">close</span>
           </button>
         </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-[9px] text-on-surface-variant mb-1 uppercase tracking-widest px-1">
              {m.role === 'ai' ? 'Architect' : m.role === 'user' ? 'You' : 'System'}
            </span>
            <div className={`p-3 rounded-xl max-w-[90%] leading-5 whitespace-pre-wrap ${
              m.role === 'user' ? 'bg-surface-container-high border border-outline-variant/20 text-on-surface' :
              m.role === 'system' ? 'bg-primary/5 border border-primary/20 text-primary/80 font-mono-code text-[11px]' :
              'bg-transparent border border-secondary/20 glow-secondary text-on-surface'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-surface-container-low border-t border-outline-variant/20">
        <div className="relative">
          <textarea
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder="Ask about this code..."
            className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg pl-3 pr-10 py-2.5 text-xs text-on-surface focus:border-primary focus:outline-none resize-none"
            rows={2}
          />
          <button 
            onClick={handleSend}
            disabled={isSending || !inputMsg.trim()}
            className="absolute right-2 bottom-2 w-7 h-7 flex items-center justify-center rounded-md bg-primary text-on-primary disabled:opacity-50 transition-opacity"
          >
            <span className="material-symbols-outlined text-[14px]">send</span>
          </button>
        </div>
      </div>

    </div>
  )
}
