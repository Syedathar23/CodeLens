import { useState, useMemo, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import * as Diff from 'diff'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { rust } from '@codemirror/lang-rust'
import { sql } from '@codemirror/lang-sql'
import { Decoration, EditorView } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'
import { tags as t } from '@lezer/highlight'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'

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

function extractErrorLines(issues = []) {
  return issues
    .filter(i => i.type === 'bug' || i.type === 'error')
    .map(i => {
      const match = i.description?.match(/[Ll]ine\s*(\d+)/)
      return match ? parseInt(match[1]) : null
    })
    .filter(Boolean)
}

function extractBugLines(issues = []) {
  return issues
    .filter(i => i.type === 'bug')
    .map(i => {
      const match = i.description?.match(/[Ll]ine\s*(\d+)/)
      return match ? parseInt(match[1]) : null
    })
    .filter(Boolean)
}

function lineHighlighter(errorLines) {
  return EditorView.decorations.of((view) => {
    let builder = new RangeSetBuilder()
    let doc = view.state.doc
    for (let i = 1; i <= doc.lines; i++) {
      const isError = errorLines.includes(i)
      if (isError) {
        builder.add(doc.line(i).from, doc.line(i).from, Decoration.line({
          class: 'bg-[rgba(255,110,132,0.1)] border-l-2 border-[#ff6e84]'
        }))
      }
    }
    return builder.finish()
  })
}

const lineStyles = {
  added:   { bg: 'rgba(101,243,182,0.12)',  border: '#65f3b6', color: '#9FE1CB' },
  removed: { bg: 'rgba(255,110,132,0.08)',  border: '#ff6e84', color: '#F09595' },
  bug:     { bg: 'rgba(239,159,39,0.12)',   border: '#EF9F27', color: '#FAC775' },
  normal:  { bg: 'transparent',             border: 'transparent', color: '#adaaaa' }
}

const customTheme = EditorView.theme({
  "&": {
    fontFamily: "'JetBrains Mono', 'Courier New', monospace"
  }
})

const customHighlighting = HighlightStyle.define([
  { tag: [t.keyword, t.modifier, t.operatorKeyword, t.controlKeyword], color: "#ff6e84" },
  { tag: [t.string, t.special(t.string)], color: "#65f3b6" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#aaa4ff" },
  { tag: [t.number, t.bool, t.null], color: "#EF9F27" },
  { tag: [t.comment, t.lineComment, t.blockComment], color: "#6A7A82", fontStyle: "italic" }
])

const customSetup = [customTheme, syntaxHighlighting(customHighlighting)]

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
  originalCode = null,
  language = 'javascript',
  editable = false,
  onChange = () => {},
  issues = []
}) {
  const [copied, setCopied] = useState(false)
  const [computedDiff, setComputedDiff] = useState([])

  const errorLines = useMemo(() => extractErrorLines(issues), [issues])
  const bugLines   = useMemo(() => extractBugLines(issues), [issues])

  useEffect(() => {
    if (originalCode && code && originalCode !== code && diffLines.length === 0) {
      const diffs = Diff.diffLines(originalCode, code)
      const result = []
      diffs.forEach(part => {
        const type = part.added ? 'added' : part.removed ? 'removed' : 'normal'
        const lines = part.value.replace(/\n$/, '').split('\n')
        lines.forEach(line => result.push({ line, type }))
      })
      setComputedDiff(result)
    } else {
      setComputedDiff(diffLines)
    }
  }, [originalCode, code, diffLines])

  const displayLines = useMemo(() => {
    return computedDiff.length > 0
      ? computedDiff
      : code.split('\n').map(line => ({ line, type: 'normal' }))
  }, [code, computedDiff])

  const codeString = useMemo(() => {
    return displayLines.map(d => d.line).join('\n')
  }, [displayLines])

  const extensions = useMemo(() => {
    const exts = [getLanguageExtension(language), customSetup]
    if (!editable && errorLines.length > 0 && !originalCode) {
      exts.push(lineHighlighter(errorLines))
    }
    return exts
  }, [language, editable, errorLines, originalCode])

  const handleCopy = () => {
    const lines = code.split('\n')
    const copyableLines = diffLines && diffLines.length > 0
      ? diffLines
          .filter(d => d.type !== 'removed')
          .map(d => d.line)
      : lines
    const textToCopy = copyableLines.join('\n')
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isDiffMode = computedDiff.length > 0 && originalCode && code !== originalCode

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
        {isDiffMode ? (
          /* ── Right Panel: Diff View with bug-yellow support ── */
          <div style={{ 
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 12,
            lineHeight: "1.6",
            padding: "16px",
            height: "100%",
            overflow: "auto",
            background: "#282c34"
          }} className="custom-scroll">
            {computedDiff.map((d, i) => {
              const lineNum = i + 1
              let lineType = d.type
              if (lineType === 'normal' && bugLines.includes(lineNum)) {
                lineType = 'bug'
              }
              const style = lineStyles[lineType] || lineStyles.normal
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    paddingLeft: 8,
                    paddingRight: 8,
                    marginLeft: -8,
                    marginRight: -8,
                    background: style.bg,
                    borderLeft: `2px solid ${style.border}`,
                    textDecoration: lineType === 'removed' ? 'line-through' : 'none',
                    opacity: lineType === 'removed' ? 0.6 : 1
                  }}
                >
                  <span style={{ 
                    color: "#484848", 
                    minWidth: 32, 
                    userSelect: "none",
                    fontSize: 11
                  }}>
                    {lineType !== 'removed' ? lineNum : ''}
                  </span>
                  <span style={{ 
                    color: style.color,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all"
                  }}>
                    {d.line || " "}
                  </span>
                </div>
              )
            })}
          </div>
        ) : editable ? (
          /* ── Left Panel when editable ── */
          <CodeMirror
            value={code}
            height="100%"
            theme={oneDark}
            extensions={extensions}
            readOnly={false}
            onChange={onChange}
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
        ) : errorLines.length > 0 && !originalCode ? (
          /* ── Left Panel: Custom renderer with error line highlights ── */
          <div style={{ 
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 12,
            lineHeight: "1.6",
            padding: "16px",
            height: "100%",
            overflow: "auto",
            background: "#282c34"
          }} className="custom-scroll">
            {code.split('\n').map((line, index) => {
              const lineNum = index + 1
              const isError = errorLines.includes(lineNum)
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    background: isError ? 'rgba(255,110,132,0.1)' : 'transparent',
                    borderLeft: isError ? '2px solid #ff6e84' : '2px solid transparent',
                    paddingLeft: 8,
                    position: 'relative'
                  }}
                >
                  <span style={{ color: '#484848', minWidth: 32, userSelect: 'none', fontSize: 11 }}>
                    {lineNum}
                  </span>
                  <span style={{
                    color: isError ? '#F09595' : '#adaaaa',
                    whiteSpace: 'pre-wrap',
                    textDecoration: isError ? 'underline wavy #ff6e84' : 'none',
                    wordBreak: 'break-all'
                  }}>
                    {line || ' '}
                  </span>
                  {isError && (
                    <span style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#ff6e84',
                      flexShrink: 0
                    }} />
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          /* ── Default CodeMirror view ── */
          <CodeMirror
            value={codeString}
            height="100%"
            theme={oneDark}
            extensions={extensions}
            readOnly={true}
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
        )}
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
          min-height: 300px;
        }
        .custom-cm-wrapper .cm-scroller {
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          overflow: auto;
          max-height: calc(100vh - 200px);
        }
      `}</style>
    </div>
  )
}
