import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

export default function SideChat({
  isOpen,
  onClose,
  selectedText,
  annotationId,
  reviewId,
  isEditorMode
}) {
  const [messages, setMessages] = useState([])
  const [inputMsg, setInputMsg] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [currentAnnId, setCurrentAnnId] = useState(annotationId)
  const [rightCollapsed, setRightCollapsed] = useState(false)

  const messagesEndRef = useRef(null)
  
  useEffect(() => {
    setCurrentAnnId(annotationId)
  }, [annotationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

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
        const aiMsgContent = res.data.ai_response || res.data.response || res.data.content || res.data.ai_message?.content
        setMessages(prev => [...prev, { role: 'ai', content: aiMsgContent }])
      } else {
        setMessages(prev => [...prev, { role: 'system', content: "Failed to connect real review id." }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', content: "Failed to connect to the architect." }])
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) return null

  // Function to render text with highlighted code spans
  const renderMessageContent = (text) => {
    // Basic markdown inline code parser (`code`)
    // Simple implementation since message.content is string
    if (!text) return null;
    const parts = text.split(/`([^`]+)`/g)
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <code key={i} style={{
            background: "#0E0E0E", color: "#aaa4ff",
            padding: "2px 6px", borderRadius: 4,
            fontFamily: "Courier New, monospace",
            fontSize: 12
          }}>
            {part}
          </code>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  if (isEditorMode && rightCollapsed) {
    return (
      <div style={{
        width: 32, flexShrink: 0, height: '100%',
        background: '#131313', borderLeft: '1px solid #333', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        fontFamily: 'Inter, sans-serif'
      }}>
        <button 
          onClick={() => setRightCollapsed(false)}
          style={{ width: '100%', padding: '14px 0', background: 'transparent', border: 'none', color: '#ffffffff', cursor: 'pointer', borderBottom: '1px solid #222' }}
        >
          ❮
        </button>
        <div style={{
          marginTop: 20,
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          fontSize: 10,
          fontWeight: 700,
          color: '#8a8a8a',
          letterSpacing: 2,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap'
        }}>
          SIDE CHAT
        </div>
      </div>
    )
  }

  const WrapperProps = isEditorMode ? {
    style: {
      width: 340, flexShrink: 0, height: '100%',
      background: '#222222', display: 'flex', flexDirection: 'column',
      borderLeft: '1px solid #333', zIndex: 10
    }
  } : {
    className: "fixed top-14 bottom-0 right-0 w-[340px] bg-surface-container-lowest border-l border-outline-variant/20 flex flex-col shadow-2xl z-40"
  }

  return (
    <div {...WrapperProps}>
      
      {/* Header */}
      <div style={{
        height: 48, borderBottom: '1px solid #333', display: 'flex', 
        alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
        flexShrink: 0, background: isEditorMode ? '#1e1c1c' : 'inherit'
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 1, color: '#FF8C42', textTransform: 'uppercase' }}>
          Side Chat
        </div>
        {!isEditorMode && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8a8a8a', cursor: 'pointer' }}>
             <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        )}
        {isEditorMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8a8a8a', cursor: 'pointer' }}>
              filter_list
            </span>
            <button 
              onClick={() => setRightCollapsed(true)}
              style={{ background: 'transparent', border: 'none', color: '#ffffffff', cursor: 'pointer', padding: '0 4px', fontSize: 14 }}
            >
              ❯
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 16, background: '#1c1c1c' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            
            {m.role === 'ai' || m.role === 'system' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#65f3b6', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: 10, color: '#131313' }}>⚡</span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#65f3b6', letterSpacing: 1 }}>
                    SYSTEM AI
                  </span>
                </div>
                <div style={{
                  background: '#282830', borderRadius: 8, padding: '10px 14px',
                  fontSize: 13, color: '#c0beb8', lineHeight: 1.6, maxWidth: '90%'
                }}>
                  {renderMessageContent(m.content)}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#8a8a8a', letterSpacing: 1 }}>
                    YOU
                  </span>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#F5BCAE', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, color: '#000', fontWeight: 'bold'
                  }}>
                    SA
                  </div>
                </div>
                <div style={{
                  background: '#333333', borderRadius: 8, padding: '10px 14px',
                  fontSize: 13, color: '#e0e0e0', lineHeight: 1.6, maxWidth: '90%'
                }}>
                  {renderMessageContent(m.content)}
                </div>
              </>
            )}

          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: 12, background: isEditorMode ? '#1e1c1c' : '#191a1a', 
        borderTop: '1px solid #333'
      }}>
        <div style={{ position: 'relative', background: '#0e0e0e', borderRadius: 8, overflow: 'hidden' }}>
          <textarea
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder="Reply to thread..."
            style={{
              width: '100%', background: 'transparent', border: 'none', 
              padding: '12px 40px 12px 14px', fontSize: 12, color: '#e0e0e0', 
              outline: 'none', resize: 'none', minHeight: 44
            }}
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={isSending || !inputMsg.trim()}
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: (isSending || !inputMsg.trim()) ? '#484848' : '#65f3b6',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>
          </button>
        </div>
      </div>

    </div>
  )
}
