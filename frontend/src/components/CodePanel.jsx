export default function CodePanel({
  version,
  code = '',
  timestamp,
  isLatest = false,
  score,
  bugs = 0,
  tips = 0,
  security = 0,
  diffLines = [],
}) {
  const displayLines = diffLines.length > 0
    ? diffLines
    : code.split('\n').map((line) => ({ line, type: 'normal' }))

  return (
    <div className="relative flex flex-col h-full bg-surface-container-lowest rounded-lg overflow-hidden border border-outline-variant/20">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-container border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-on-surface tracking-widest uppercase">
            Version {version}
          </span>
          {timestamp && (
            <span className="text-[10px] text-on-surface-variant">{timestamp}</span>
          )}
          {isLatest && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary tracking-widest uppercase">
              Latest
            </span>
          )}
        </div>
        <span className="material-symbols-outlined text-sm text-on-surface-variant">
          {isLatest ? 'lock' : 'history'}
        </span>
      </div>

      {/* ── Code Area ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-4 font-mono-code text-xs leading-6">
        {displayLines.map(({ line, type }, idx) => (
          <div key={idx} className="flex">
            {/* Line number */}
            <span className="select-none w-8 text-right pr-3 text-outline-variant shrink-0">
              {idx + 1}
            </span>
            {/* Code line */}
            <span
              className={`flex-1 ${
                type === 'removed'
                  ? 'bg-error/10 text-error-dim border-l-2 border-error px-2 -mx-0'
                  : type === 'added'
                  ? 'bg-secondary/10 text-secondary border-l-2 border-secondary px-2'
                  : 'text-on-surface-variant'
              }`}
            >
              {type === 'removed' ? '− ' : type === 'added' ? '+ ' : '  '}
              {line}
            </span>
          </div>
        ))}
      </div>

      {/* ── Score Card (absolute bottom-right) ──────────────────────────────── */}
      {score !== undefined && (
        <div
          className={`absolute bottom-4 right-4 p-3 rounded-lg transition-transform hover:scale-105 cursor-default ${
            isLatest
              ? 'bg-surface-container-high border-2 border-secondary/50 glow-secondary'
              : 'bg-surface-container-high border border-outline-variant/20'
          }`}
        >
          <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">Score</p>
          <div className="flex items-center gap-1">
            <span
              className={`text-2xl font-bold font-headline ${
                isLatest ? 'text-secondary' : 'text-amber-500'
              }`}
            >
              {score}
            </span>
            {isLatest && (
              <span className="material-symbols-outlined text-secondary text-base">north</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-error" title={`${bugs} bugs`} />
            <span className="w-2 h-2 rounded-full bg-amber-400" title={`${tips} tips`} />
            <span className="w-2 h-2 rounded-full bg-primary" title={`${security} security`} />
          </div>
        </div>
      )}
    </div>
  )
}
