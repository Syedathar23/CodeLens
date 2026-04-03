import { useState, useRef, useEffect } from 'react'
import { sendAnnotationMessage } from '../services/api'

export default function SideChat({
  isOpen,
  selectedText = '',
  annotationId,
  messages: initialMessages = [],
  onClose,
  onSaveBookmark,
}) {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef(null)

  // Sync messages when parent changes
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || isSending) return

    const userId = localStorage.getItem('userId')
    const userMsg = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsSending(true)

    try {
      const res = await sendAnnotationMessage(annotationId, userId, text)
      const aiMsg = { role: 'assistant', content: res?.response || res?.message || '...' }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      console.error('Side chat send error', err)
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Failed to get response.' }])
    } finally {
      setIsSending(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Render inline code and code blocks in AI messages
  function renderAIContent(content) {
    const codeBlockRegex = /```([\s\S]*?)```/g
    const inlineCodeRegex = /`([^`]+)`/g

    const parts = []
    let last = 0
    let match

    // We'll do a simple line-by-line approach
    const lines = content.split('\n')
    let inBlock = false
    let blockLines = []
    let key = 0

    for (const line of lines) {
      if (line.startsWith('```')) {
        if (!inBlock) {
          inBlock = true
          blockLines = []
        } else {
          inBlock = false
          parts.push(
            <pre key={key++} className="bg-surface-container-lowest p-2 mt-2 rounded font-mono-code text-[11px] overflow-x-auto">
              {blockLines.join('\n')}
            </pre>
          )
          blockLines = []
        }
        continue
      }
      if (inBlock) {
        blockLines.push(line)
        continue
      }
      // Inline code
      const segments = []
      let lastIdx = 0
      let m
      const re = /`([^`]+)`/g
      while ((m = re.exec(line)) !== null) {
        if (m.index > lastIdx) segments.push(line.slice(lastIdx, m.index))
        segments.push(
          <code key={key++} className="font-mono-code bg-surface-container-lowest px-1 rounded text-primary text-[10px]">
            {m[1]}
          </code>
        )
        lastIdx = m.index + m[0].length
      }
      if (lastIdx < line.length) segments.push(line.slice(lastIdx))
      parts.push(<p key={key++} className="leading-5">{segments}</p>)
    }

    return parts
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-14 bottom-0 w-[340px] bg-surface-container-low border-l border-outline-variant/20 flex flex-col z-30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/10">
        <div>
          <p className="text-sm font-bold text-on-surface">Side chat</p>
          <p className="text-[10px] text-secondary mt-0.5">LLaMA 3 via Groq · fast</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onSaveBookmark}
            className="text-[10px] text-primary hover:underline"
          >
            save as bookmark
          </button>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-white"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </div>

      {/* Context box */}
      {selectedText && (
        <div className="mx-4 mt-3 p-2 bg-surface-container-lowest rounded border border-outline-variant/20">
          <p className="text-[11px] text-on-surface-variant italic">
            Selected: &ldquo;{selectedText}&rdquo;
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-[11px] text-on-surface-variant text-center mt-4 opacity-50">
            Ask anything about the selected text…
          </p>
        )}
        {messages.map((msg, idx) =>
          msg.role === 'assistant' ? (
            <div key={idx} className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-secondary tracking-widest uppercase">
                CodeLens AI
              </span>
              <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/10 text-xs text-on-surface leading-5">
                {renderAIContent(msg.content)}
              </div>
            </div>
          ) : (
            <div key={idx} className="flex justify-end">
              <div className="bg-primary text-on-primary p-3 rounded-lg text-xs font-medium max-w-[90%]">
                {msg.content}
              </div>
            </div>
          )
        )}
        {isSending && (
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-secondary tracking-widest uppercase">
              CodeLens AI
            </span>
            <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/10 text-xs text-on-surface-variant animate-pulse">
              Thinking…
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-outline-variant/10 p-4">
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this selection…"
            className="w-full bg-surface-container-lowest border border-outline-variant/20 focus:outline-none focus:ring-1 focus:ring-primary rounded-lg py-2 px-3 pr-12 text-xs text-on-surface placeholder:text-on-surface-variant"
          />
          <button
            onClick={handleSend}
            disabled={isSending}
            className="absolute right-1 top-1 gradient-primary rounded px-2 py-1 text-on-primary"
          >
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </div>
      </div>
    </div>
  )
}
