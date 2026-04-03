export default function VersionTimeline({
  versions = [],
  selectedVersion,
  latestVersion,
  onVersionSelect,
  deltaText,
  deltaPositive,
}) {
  return (
    <div className="px-6 py-3 bg-surface-container-low border-b border-outline-variant/20">
      <p className="text-[9px] font-bold text-primary tracking-[0.2em] uppercase mb-3">
        Version History
      </p>

      <div className="flex items-center gap-0">
        {versions.map((v, idx) => {
          const isLatest = v.version === latestVersion
          const isSelected = v.version === selectedVersion
          const isLast = idx === versions.length - 1

          return (
            <div key={v.version} className="flex items-center">
              {/* Dot */}
              <button
                onClick={() => !isLatest && onVersionSelect(v.version)}
                className="relative flex items-center justify-center focus:outline-none"
                title={`v${v.version} — ${v.timestamp || ''}`}
              >
                {isLatest ? (
                  /* Latest: large filled primary */
                  <span className="w-4 h-4 rounded-full bg-primary glow-primary block" />
                ) : isSelected ? (
                  /* Selected: bordered with inner dot */
                  <span className="w-3 h-3 rounded-full border-2 border-primary flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary block" />
                  </span>
                ) : (
                  /* Inactive */
                  <span className="w-3 h-3 rounded-full border-2 border-outline-variant cursor-pointer hover:border-primary transition-colors block" />
                )}
              </button>

              {/* Line between dots */}
              {!isLast && (
                <span
                  className={`h-0.5 w-8 ${
                    idx < versions.findIndex((x) => x.version === latestVersion)
                      ? 'bg-primary'
                      : 'bg-outline-variant'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Version labels */}
      <div className="flex items-center gap-0 mt-1">
        {versions.map((v, idx) => {
          const isLast = idx === versions.length - 1
          return (
            <div key={v.version} className="flex items-center">
              <span className="text-[9px] text-on-surface-variant w-4 text-center inline-block">
                v{v.version}
              </span>
              {!isLast && <span className="w-8 inline-block" />}
            </div>
          )
        })}
      </div>

      {/* Delta pills */}
      <div className="flex gap-2 mt-2">
        {deltaText && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              deltaPositive
                ? 'bg-secondary/10 text-secondary'
                : 'bg-error/10 text-error'
            }`}
          >
            {deltaText}
          </span>
        )}
      </div>
    </div>
  )
}
