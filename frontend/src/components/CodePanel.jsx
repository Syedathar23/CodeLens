import { useState, useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { rust } from '@codemirror/lang-rust'
import { sql } from '@codemirror/lang-sql'
import { Decoration, EditorView } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'

export function getLanguageExtension(lang) {
  switch (lang?.toLowerCase()) {
    case 'python': return python()
    case 'javascript': case 'typescript': case 'react': return javascript({ jsx: true, typescript: true })
    case 'java': return java()
    case 'c++': case 'c': case 'c#': return cpp()
    case 'rust': return rust()
    case 'sql': return sql()
    default: return javascript()
  }
}

function lineHighlighter(diffLines) {
  return EditorView.decorations.of((view) => {
    let builder = new RangeSetBuilder()
    let doc = view.state.doc
    for (let i = 1; i <= doc.lines; i++) {
      let type = diffLines[i - 1]?.type
      if (type === 'added') {
        builder.add(doc.line(i).from, doc.line(i).from, Decoration.line({ class: 'bg-secondary/10 border-l-[3px] border-secondary' }))
      } else if (type === 'removed') {
        builder.add(doc.line(i).from, doc.line(i).from, Decoration.line({ class: 'bg-error/10 border-l-[3px] border-error text-error-dim' }))
      } else if (type === 'warning') {
        builder.add(doc.line(i).from, doc.line(i).from, Decoration.line({ class: 'bg-amber-400/10 border-l-[3px] border-amber-400' }))
      }
    }
    return builder.finish()
  })
}

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
  language = 'javascript',
  editable = false,
  onChange = () => {}
}) {
  const [copied, setCopied] = useState(false)

  const displayLines = useMemo(() => {
    return diffLines.length > 0
      ? diffLines
      : code.split('\n').map(line => ({ line, type: 'normal' }))
  }, [code, diffLines])

  const codeString = useMemo(() => {
    return displayLines.map(d => d.line).join('\n')
  }, [displayLines])

  const extensions = useMemo(() => {
    const exts = [getLanguageExtension(language)]
    if (!editable && diffLines.length > 0) {
      exts.push(lineHighlighter(displayLines))
    }
    return exts
  }, [language, editable, displayLines])

  const handleCopy = () => {
    const linesToCopy = displayLines
      .filter(d => d.type !== 'removed')
      .map(d => d.line)
      .join('\n')
    navigator.clipboard.writeText(linesToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative flex flex-col h-full bg-[#282c34] rounded-lg overflow-hidden border border-outline-variant/20">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-container border-b border-outline-variant/20 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-on-surface tracking-widest uppercase">
            Version {version}
          </span>
          {timestamp && (
            <span className="text-[10px] text-on-surface-variant">{timestamp}</span>
          )}
          {isLatest && !editable && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary tracking-widest uppercase">
              Latest
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          
          <span className="material-symbols-outlined text-sm text-on-surface-variant">
            {isLatest ? 'lock' : 'history'}
          </span>
        </div>
      </div>

      {/* ── Code Area ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto text-xs font-mono-code relative custom-cm-wrapper">
        <CodeMirror
          value={editable ? code : codeString}
          height="100%"
          theme={oneDark}
          extensions={extensions}
          readOnly={!editable}
          onChange={editable ? onChange : undefined}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
            foldGutter: false,
            indentOnInput: true
          }}
          className="text-[13px]"
          style={{ height: '100%' }}
        />
      </div>

      {/* ── Score Card (absolute bottom-right) ──────────────────────────────── */}
      {!editable && score !== undefined && (
        <div
          className={`absolute bottom-4 right-4 p-3 rounded-lg transition-transform hover:scale-105 cursor-default z-20 ${
            isLatest
              ? 'bg-surface-container-high border-2 border-secondary/50 glow-secondary shadow-xl'
              : 'bg-surface-container-high border border-outline-variant/20 shadow-xl'
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
      
      <style>{`
        .custom-cm-wrapper .cm-editor {
          height: 100%;
        }
        .custom-cm-wrapper .cm-scroller {
          font-family: 'Courier New', 'Consolas', monospace;
        }
      `}</style>
    </div>
  )
}
