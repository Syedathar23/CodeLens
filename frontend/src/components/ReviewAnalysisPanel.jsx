import { useState } from 'react'

export default function ReviewAnalysisPanel({ reviewData }) {
  const [openSections, setOpenSections] = useState({ bug: true, suggestion: false, security: false, error: false })
  const [leftCollapsed, setLeftCollapsed] = useState(false)

  const { score = 0, issues = [] } = reviewData || {}

  const toggleSection = (type) => {
    setOpenSections(prev => ({ ...prev, [type]: !prev[type] }))
  }

  const getDotColor = (type) => {
    switch (type) {
      case 'bug':        return '#bb122bff'
      case 'error':      return '#ff6e84'
      case 'security':   return '#F97316'
      case 'suggestion': return '#9dc3feff'
      default:           return '#aaa4ff'
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

  const scoreLabel = score >= 7 ? 'Good' : score >= 5 ? 'Fair' : 'Poor'
  const scoreColor = score >= 7 ? '#1D9E75' : score >= 5 ? '#EF9F27' : '#ff6e84'
  const barColor   = score >= 7 ? '#1D9E75' : score >= 5 ? '#EF9F27' : '#ff6e84'

  const renderSection = (type, items) => {
    if (items.length === 0) return null
    const dot   = getDotColor(type)
    const label = getLabel(type)
    const isOpen = openSections[type]

    return (
      <div key={type} style={{ marginBottom: 2 }}>
        <div
          style={{
            display: 'flex', alignItems: 'center',
            padding: '8px 12px', cursor: 'pointer',
            borderRadius: 6, marginBottom: 2,
            background: isOpen ? 'rgba(255,255,255,0.04)' : 'transparent',
            transition: 'background 0.15s'
          }}
          onClick={() => toggleSection(type)}
        >
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: dot, marginRight: 10, flexShrink: 0
          }} />
          <span style={{ fontSize: 13, color: '#e0e0e0' }}>
            {label} ({items.length})
          </span>
          <span style={{ marginLeft: 'auto', color: '#484848', fontSize: 11 }}>
            {isOpen ? '▲' : '▼'}
          </span>
        </div>

        {isOpen && (
          <div style={{ paddingLeft: 8, marginBottom: 4 }}>
            {items.map((item, i) => (
              <div key={i} style={{
                padding: '8px 10px',
                borderRadius: 6,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${dot}22`,
                marginBottom: 4,
                fontSize: 11,
                color: '#8a8a8a',
                lineHeight: 1.5 
              }}>
                {item.description}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (leftCollapsed) {
    return (
      <div style={{
        width: 32,
        flexShrink: 0,
        height: '100%',
        background: '#131313',
        borderRight: '1px solid #222',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Inter, sans-serif'
      }}>
        <button 
          onClick={() => setLeftCollapsed(false)}
          style={{ width: '100%', padding: '14px 0', background: 'transparent', border: 'none', color: '#ffffffff', cursor: 'pointer', borderBottom: '1px solid #222' }}
        >
          ❯
        </button>
        <div style={{
          marginTop: 20,
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          fontSize: 10,
          fontWeight: 700,
          color: '#65f3b6',
          letterSpacing: 2,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap'
        }}>
          REVIEW ANALYSIS
        </div>
      </div>
    )
  }

  return (
    <div style={{
      width: 220,
      flexShrink: 0,
      height: '100%',
      background: '#131313',
      borderRight: '1px solid #222',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden'
    }}>

      {/* Header */}
      <div style={{
        padding: '14px 16px 10px',
        borderBottom: '1px solid #222',
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#65f3b6', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
            Review Analysis
          </div>
        </div>
        <button 
          onClick={() => setLeftCollapsed(true)}
          style={{ background: 'transparent', border: 'none', color: '#ffffffff', cursor: 'pointer', padding: '0 4px', fontSize: 14 }}
        >
          ❮
        </button>
      </div>

      {/* Score Block */}
      <div style={{ padding: '14px 16px 10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 44, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
            {score}
          </span>
          <div style={{ paddingBottom: 6 }}>
            <span style={{ fontSize: 14, color: '#ffffffff' }}>/10</span>
          </div>
          <div style={{
            marginLeft: 'auto', paddingBottom: 6,
            fontSize: 11, fontWeight: 600,
            color: scoreColor
          }}>
            {scoreLabel}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 4, background: '#222', borderRadius: 4, overflow: 'hidden', marginBottom: 14
        }}>
          <div style={{
            height: '100%',
            width: `${score * 10}%`,
            background: barColor,
            borderRadius: 4,
            transition: 'width 0.6s ease'
          }} />
        </div>

        {/* METRICS label */}
        <div style={{
          fontSize: 9, fontWeight: 700, color: '#484848',
          letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8
        }}>
          Metrics
        </div>
      </div>

      {/* Collapsible Sections */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 4px' }} className="left-panel-scroll">
        {renderSection('bug', bugs)}
        {renderSection('suggestion', suggestions)}
        {renderSection('security', security)}
        {renderSection('error', errors)}

        {issues.length === 0 && (
          <div style={{ padding: '16px 12px', fontSize: 11, color: '#484848', textAlign: 'center' }}>
            No issues detected
          </div>
        )}
      </div>

      <style>{`
        .left-panel-scroll::-webkit-scrollbar { width: 3px; }
        .left-panel-scroll::-webkit-scrollbar-thumb { background: #333; }
      `}</style>
    </div>
  )
}
