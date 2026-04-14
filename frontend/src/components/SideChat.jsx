import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const aiAPI = axios.create({ baseURL: 'http://localhost:8000' })

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
  const userName = localStorage.getItem('userName') || 'Developer'
  const userId = parseInt(localStorage.getItem('userId'), 10) || 1
  const initials = userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    setCurrentAnnId(annotationId)
  }, [annotationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  useEffect(() => {
    if (isOpen && selectedText && messages.length === 0) {
      setMessages([{
        role: 'system',
        content: `Selected: "${selectedText}"\nWhat would you like to know about this?`
      }])
    }
  }, [isOpen, selectedText])

  async function handleSend() {
    if (!inputMsg.trim() || isSending) return
    const textMsg = inputMsg.trim()
    setIsSending(true)
    setMessages(prev => [...prev, { role: 'user', content: textMsg }])
    setInputMsg('')

    try {
      let annId = currentAnnId

      // Step 1: Create annotation if we don't have one yet
      if (!annId) {
        if (reviewId) {
          try {
            const annRes = await aiAPI.post('/annotations', {
              review_id: reviewId,
              user_id: userId,
              selected_text: selectedText || 'general question',
              position_start: 0,
              position_end: 0,
              chat_type: 'side'
            })
            annId = annRes.data.id
            setCurrentAnnId(annId)
          } catch (annErr) {
            console.warn('Could not create annotation, using direct chat fallback:', annErr)
          }
        }
      }

      // Step 2: If we have annotation id, use annotation endpoint
      if (annId) {
        const res = await aiAPI.post(`/annotations/${annId}/messages`, {
          annotation_id: annId,
          user_id: userId,
          message: textMsg
        })
        const aiContent = res.data.ai_response || res.data.response || res.data.content
        setMessages(prev => [...prev, { role: 'ai', content: aiContent }])
        return
      }

      // Step 3: Fallback — use /chat endpoint directly (no annotation needed)
      const res = await aiAPI.post('/chat', {
        message: selectedText
          ? `Context: "${selectedText}"\n\nQuestion: ${textMsg}`
          : textMsg,
        user_id: userId
      })
      const aiContent = res.data.response || res.data.ai_response
      setMessages(prev => [...prev, { role: 'ai', content: aiContent }])

    } catch (err) {
      console.error('SideChat error:', err)
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Something went wrong. Please try again.'
      }])
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) return null

  const renderMessageContent = (text) => {
    if (!text) return null
    const parts = text.split(/`([^`]+)`/g)
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <code key={i} style={{
            background: '#0E0E0E', color: '#aaa4ff',
            padding: '2px 6px', borderRadius: 4,
            fontFamily: 'Courier New, monospace',
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
        background: '#131313', borderLeft: '1px solid #333',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <button
          onClick={() => setRightCollapsed(false)}
          style={{
            width: '100%', padding: '14px 0', background: 'transparent',
            border: 'none', color: '#fff', cursor: 'pointer',
            borderBottom: '1px solid #222'
          }}
        >❮</button>
        <div style={{
          marginTop: 20, writingMode: 'vertical-rl',
          transform: 'rotate(180deg)', fontSize: 10,
          fontWeight: 700, color: '#8a8a8a',
          letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap'
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
    className: 'fixed top-14 bottom-0 right-0 w-[340px] bg-surface-container-lowest border-l border-outline-variant/20 flex flex-col shadow-2xl z-40'
  }

  return (
    <div {...WrapperProps}>

      {/* Header */}
      <div style={{
        height: 48, borderBottom: '1px solid #333',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 16px',
        flexShrink: 0, background: isEditorMode ? '#1e1c1c' : 'inherit'
      }}>
        <div style={{
          fontSize: 15, fontWeight: 700, letterSpacing: 1,
          color: '#FF8C42', textTransform: 'uppercase'
        }}>
          Side Chat
        </div>
        {!isEditorMode && (
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            color: '#8a8a8a', cursor: 'pointer'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        )}
        {isEditorMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="material-symbols-outlined"
              style={{ fontSize: 16, color: '#8a8a8a', cursor: 'pointer' }}>
              filter_list
            </span>
            <button
              onClick={() => setRightCollapsed(true)}
              style={{
                background: 'transparent', border: 'none',
                color: '#fff', cursor: 'pointer', padding: '0 4px', fontSize: 14
              }}
            >❯</button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="custom-scroll" style={{
        flex: 1, overflowY: 'auto', padding: '16px 12px',
        display: 'flex', flexDirection: 'column', gap: 16,
        background: '#1c1c1c'
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: m.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            {m.role === 'ai' || m.role === 'system' ? (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 8, marginBottom: 6
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#65f3b6', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: 10, color: '#131313' }}>⚡</span>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: '#65f3b6', letterSpacing: 1
                  }}>
                    SYSTEM AI
                  </span>
                </div>
                <div style={{
                  background: '#282830', borderRadius: 8,
                  padding: '10px 14px', fontSize: 13,
                  color: '#c0beb8', lineHeight: 1.6, maxWidth: '90%'
                }}>
                  {renderMessageContent(m.content)}
                </div>
              </>
            ) : (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 8, marginBottom: 6
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: '#8a8a8a', letterSpacing: 1
                  }}>YOU</span>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#F5BCAE', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, color: '#000', fontWeight: 'bold'
                  }}>
                    {initials}
                  </div>
                </div>
                <div style={{
                  background: '#333333', borderRadius: 8,
                  padding: '10px 14px', fontSize: 13,
                  color: '#e0e0e0', lineHeight: 1.6, maxWidth: '90%'
                }}>
                  {renderMessageContent(m.content)}
                </div>
              </>
            )}
          </div>
        ))}

        {isSending && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: '#65f3b6', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: 10, color: '#131313' }}>⚡</span>
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: '#65f3b6', opacity: 0.6,
                  animation: 'pulse 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: 12,
        background: isEditorMode ? '#1e1c1c' : '#191a1a',
        borderTop: '1px solid #333'
      }}>
        <div style={{
          position: 'relative', background: '#0e0e0e',
          borderRadius: 8, overflow: 'hidden'
        }}>
          <textarea
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Reply to thread..."
            style={{
              width: '100%', background: 'transparent', border: 'none',
              padding: '12px 40px 12px 14px', fontSize: 12,
              color: '#e0e0e0', outline: 'none', resize: 'none', minHeight: 44
            }}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={isSending || !inputMsg.trim()}
            style={{
              position: 'absolute', right: 8, top: '50%',
              transform: 'translateY(-50%)', background: 'transparent',
              border: 'none', cursor: 'pointer',
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