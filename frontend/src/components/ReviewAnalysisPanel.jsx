import { useState } from 'react'

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

export default function ReviewAnalysisPanel({ reviewData }) {
  const [openSections, setOpenSections] = useState({ bug: true, suggestion: true, security: true, error: true })

  const { score = 0, issues = [] } = reviewData || {}

  const toggleSection = (type) => {
    setOpenSections(prev => ({ ...prev, [type]: !prev[type] }))
  }

  const getDotColor = (type) => {
    switch (type) {
      case 'bug':        return '#EF4444' // Red
      case 'error':      return '#EF4444' // Red
      case 'security':   return C.orange
      case 'suggestion': return '#3B82F6' // Blue
      default:           return C.black
    }
  }

  const getLabel = (type) => {
    switch (type) {
      case 'bug':        return 'Bugs'
      case 'error':      return 'Errors'
      case 'security':   return 'Security'
      case 'suggestion': return 'Performance'
      default:           return type
    }
  }

  const errors      = issues.filter(i => i.type?.toLowerCase() === 'error')
  const bugs        = issues.filter(i => i.type?.toLowerCase() === 'bug')
  const security    = issues.filter(i => i.type?.toLowerCase() === 'security')
  const suggestions = issues.filter(i => !['error', 'bug', 'security'].includes(i.type?.toLowerCase()))

  const scoreLabel = score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : score >= 4 ? 'Fair' : 'Needs Work'
  const scoreColor = score >= 8 ? '#16A34A' : score >= 6 ? C.yellow : score >= 4 ? C.orange : '#EF4444'

  const renderSection = (type, items) => {
    if (items.length === 0) return null
    const dot   = getDotColor(type)
    const label = getLabel(type)
    const isOpen = openSections[type]

    return (
      <div key={type} style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => toggleSection(type)}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.5rem 0',
            background: 'transparent', border: 'none',
            cursor: 'pointer', fontFamily: C.font,
            borderBottom: C.thinBorder,
            marginBottom: isOpen ? '0.5rem' : 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 12, height: 12, background: dot, border: '2px solid #0A0A0A' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: C.black }}>
              {label} ({items.length})
            </span>
          </div>
          <span style={{ color: C.black, fontSize: '0.8rem', fontWeight: 900 }}>
            {isOpen ? '−' : '+'}
          </span>
        </button>

        {isOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {items.map((item, i) => (
              <div key={i} style={{
                padding: '0.65rem',
                background: C.grayLight,
                border: C.thinBorder,
                fontSize: '0.75rem',
                color: C.black,
                fontFamily: C.body,
                lineHeight: 1.5,
                boxShadow: '2px 2px 0 #0A0A0A'
              }}>
                {item.description}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      fontFamily: C.body,
      height: '100%',
    }}>

      {/* Header */}
      <div style={{
        marginBottom: '1.5rem',
      }}>
        <div style={{ 
          fontSize: '1rem', fontWeight: 900, fontFamily: C.font, 
          textTransform: 'uppercase', color: C.black, 
          marginBottom: '0.25rem', letterSpacing: '0.05em' 
        }}>
          Analysis
        </div>
      </div>

      {/* Score Block */}
      <div style={{ 
        background: C.cream, 
        border: C.border, 
        boxShadow: C.shadow, 
        padding: '1.25rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, fontFamily: C.font, textTransform: 'uppercase', marginBottom: '0.5rem', color: C.muted }}>
          Code Score
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '3rem', fontWeight: 900, fontFamily: C.font, color: scoreColor, lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: C.muted, fontFamily: C.font }}>
            /10
          </span>
        </div>
        <div style={{
          display: 'inline-block',
          padding: '0.25rem 0.5rem',
          background: C.black,
          color: '#fff',
          fontSize: '0.65rem',
          fontWeight: 800,
          fontFamily: C.font,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {scoreLabel}
        </div>
      </div>

      {/* Issues Section */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '0.7rem', fontWeight: 800, fontFamily: C.font,
          textTransform: 'uppercase', color: C.muted, marginBottom: '1rem',
          letterSpacing: '0.05em'
        }}>
          Identified Issues
        </div>
        
        {renderSection('error', errors)}
        {renderSection('bug', bugs)}
        {renderSection('security', security)}
        {renderSection('suggestion', suggestions)}

        {issues.length === 0 && (
          <div style={{ 
            padding: '1.5rem', 
            background: C.grayLight, 
            border: C.thinBorder, 
            textAlign: 'center',
            fontSize: '0.75rem',
            fontFamily: C.font,
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            No issues detected
          </div>
        )}
      </div>
    </div>
  )
}
