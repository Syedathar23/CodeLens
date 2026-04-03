import { useState, useRef, useEffect, useCallback } from 'react'
import { saveAnnotation } from '../services/api'

export default function AIReviewSection({
  reviewText = '',
  highlights = [],
  annotations = [],
  onSideChatOpen,
  onMainChatAsk,
  reviewId,
  userId,
}) {
  const [popup, setPopup] = useState(null) // { x, y, text, range }
  const [bookmarks, setBookmarks] = useState([]) // [{ text, annotationId }]
  const containerRef = useRef(null)

  // ── Build bookmarked positions from existing annotations ─────────────────
  useEffect(() => {
    if (annotations.length > 0) {
      setBookmarks(annotations.map((a) => ({ text: a.selected_text, annotationId: a.id })))
    }
  }, [annotations])

  // ── mouseup: detect text selection ──────────────────────────────────────
  const handleMouseUp = useCallback((e) => {
    const selection = window.getSelection()
    const selected = selection?.toString().trim()
    if (!selected || selected.length === 0) {
      setPopup(null)
      return
    }
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    setPopup({
      x: rect.left + rect.width / 2 - (containerRect?.left || 0),
      y: rect.top - (containerRect?.top || 0) - 8,
      text: selected,
    })
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('mouseup', handleMouseUp)
      return () => container.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseUp])

  // ── Ask in side chat ─────────────────────────────────────────────────────
  async function handleSideChat() {
    if (!popup) return
    const { text } = popup
    setPopup(null)
    window.getSelection()?.removeAllRanges()

    // Save annotation to DB
    let annotationId = null
    try {
      const ann = await saveAnnotation(reviewId, userId, text, 0, text.length, 'side')
      annotationId = ann?.id
      setBookmarks((prev) => [...prev, { text, annotationId }])
    } catch (err) {
      console.error('Failed to save annotation', err)
    }

    onSideChatOpen?.(text, annotationId)
  }

  // ── Ask in main chat ─────────────────────────────────────────────────────
  function handleMainChat() {
    if (!popup) return
    const { text } = popup
    setPopup(null)
    window.getSelection()?.removeAllRanges()
    onMainChatAsk?.(text)
  }

  // ── Dismiss popup when clicking outside ─────────────────────────────────
  function handleContainerClick(e) {
    if (popup && !e.target.closest('[data-popup]')) {
      setPopup(null)
    }
  }

  // ── Render text with highlights and bookmarks ────────────────────────────
  function renderText() {
    if (!reviewText) return null

    let parts = [{ text: reviewText, type: 'normal' }]

    // Highlight known phrases
    highlights.forEach((phrase) => {
      parts = parts.flatMap((part) => {
        if (part.type !== 'normal') return [part]
        const idx = part.text.indexOf(phrase)
        if (idx === -1) return [part]
        return [
          { text: part.text.slice(0, idx), type: 'normal' },
          { text: phrase, type: 'highlight' },
          { text: part.text.slice(idx + phrase.length), type: 'normal' },
        ].filter((p) => p.text)
      })
    })

    return parts.map((part, i) => {
      if (part.type === 'highlight') {
        const isBookmarked = bookmarks.some((b) => b.text === part.text)
        return (
          <span
            key={i}
            className="bg-[#2a1a3a] text-primary px-1 cursor-pointer rounded"
            onClick={() => {
              const bm = bookmarks.find((b) => b.text === part.text)
              if (bm) onSideChatOpen?.(part.text, bm.annotationId)
            }}
          >
            {part.text}
            {isBookmarked && (
              <span className="inline-block w-2 h-2 bg-primary ml-1 rounded-[1px] align-middle" />
            )}
          </span>
        )
      }
      return <span key={i}>{part.text}</span>
    })
  }

  return (
    <div ref={containerRef} className="relative select-text" onClick={handleContainerClick}>
      {/* Header */}
      <p className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase mb-3">
        AI Review — Select text to ask
      </p>

      {/* Review text */}
      <p className="text-xs text-on-surface-variant leading-6">
        {renderText()}
      </p>

      {/* Floating popup */}
      {popup && (
        <div
          data-popup
          className="absolute z-50 glass-panel border border-primary/20 rounded-full px-1 py-1 flex gap-1 shadow-xl"
          style={{
            left: popup.x,
            top: popup.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <button
            className="gradient-primary text-on-primary text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap"
            onMouseDown={(e) => { e.preventDefault(); handleSideChat() }}
          >
            Ask in side chat
          </button>
          <button
            className="border border-primary text-primary text-[10px] font-medium px-3 py-1 rounded-full whitespace-nowrap"
            onMouseDown={(e) => { e.preventDefault(); handleMainChat() }}
          >
            Ask in main chat
          </button>
        </div>
      )}
    </div>
  )
}
