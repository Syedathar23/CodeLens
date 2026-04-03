import { useState } from 'react'

export default function ReviewAnalysisPanel({ reviewData }) {
  const [expanded, setExpanded] = useState(true)

  if (!expanded) {
    return (
      <div className="w-12 h-full bg-surface-container-lowest border-r border-outline-variant/20 flex flex-col items-center py-4 shrink-0 transition-all">
        <button 
          onClick={() => setExpanded(true)}
          className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
          title="Expand Review Analysis"
        >
          <span className="material-symbols-outlined text-lg">last_page</span>
        </button>
      </div>
    )
  }

  const { score = 0, issues = [] } = reviewData || {}
  
  const bugs = issues.filter(i => i.type?.toLowerCase() === 'bug')
  const warnings = issues.filter(i => i.type?.toLowerCase() === 'warning')
  const security = issues.filter(i => i.type?.toLowerCase() === 'security')
  const suggestions = issues.filter(i => i.type?.toLowerCase() === 'suggestion')

  return (
    <div className="w-72 h-full bg-surface-container-lowest border-r border-outline-variant/20 flex flex-col shrink-0 transition-all font-body">
      <div className="h-12 bg-surface-container border-b border-outline-variant/20 flex items-center justify-between px-4 shrink-0 z-10">
        <span className="font-bold text-xs uppercase tracking-widest text-on-surface">Review Analysis</span>
        <button 
          onClick={() => setExpanded(false)}
          className="w-6 h-6 rounded hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-sm">first_page</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs code-scroll">
        
        {/* Score */}
        <div className="flex items-center gap-4">
          <div className={`text-4xl font-headline font-bold ${score >= 8 ? 'text-secondary' : score >= 5 ? 'text-amber-500' : 'text-error'}`}>
            {score}
            <span className="text-sm text-on-surface-variant">/10</span>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Code Quality</p>
            <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div 
                className={`h-full ${score >= 8 ? 'bg-secondary' : score >= 5 ? 'bg-amber-500' : 'bg-error'}`}
                style={{ width: `${score * 10}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bugs */}
        {bugs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-error" />
              <span className="font-bold uppercase tracking-widest text-[10px] text-error">Bugs ({bugs.length})</span>
            </div>
            <div className="space-y-2">
              {bugs.map((bug, i) => (
                <div key={i} className="bg-error/5 border border-error/20 p-3 rounded-lg cursor-pointer hover:border-error/50 transition-colors">
                  <p className="font-bold text-error-dim mb-1 leading-5">{bug.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security */}
        {security.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-orange-500 text-[14px]">shield</span>
              <span className="font-bold uppercase tracking-widest text-[10px] text-orange-500">Security ({security.length})</span>
            </div>
            <div className="space-y-2">
              {security.map((sec, i) => (
                <div key={i} className="bg-orange-500/5 border border-orange-500/20 p-3 rounded-lg cursor-pointer hover:border-orange-500/50 transition-colors">
                  <span className="text-[9px] bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded uppercase font-bold mb-1.5 inline-block">High Severity</span>
                  <p className="text-orange-200/80 leading-5">{sec.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-bold uppercase tracking-widest text-[10px] text-amber-500">Warnings ({warnings.length})</span>
            </div>
            <div className="space-y-2">
              {warnings.map((warn, i) => (
                <div key={i} className="bg-amber-400/5 border border-amber-400/20 p-3 rounded-lg cursor-pointer hover:border-amber-400/50 transition-colors">
                  <p className="text-amber-500/80 leading-5">{warn.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-[14px]">lightbulb</span>
              <span className="font-bold uppercase tracking-widest text-[10px] text-primary">Suggestions ({suggestions.length})</span>
            </div>
            <div className="space-y-2">
              {suggestions.map((sug, i) => (
                <div key={i} className="bg-primary/5 border border-primary/20 p-3 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <p className="text-primary/80 leading-5">{sug.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`.code-scroll::-webkit-scrollbar { width: 3px; } .code-scroll::-webkit-scrollbar-thumb { background: #333; }`}</style>
    </div>
  )
}
