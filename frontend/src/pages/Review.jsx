import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Layout from '../components/Layout'
import VersionTimeline from '../components/VersionTimeline'
import CodePanel from '../components/CodePanel'
import AIReviewSection from '../components/AIReviewSection'
import SideChat from '../components/SideChat'

export default function Review() {
  const navigate = useNavigate()
  const [stage, setStage] = useState(1) // 1 = fresh input, 2/3 = split view
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [modelUsed, setModelUsed] = useState('gemini')
  
  const [isReviewing, setIsReviewing] = useState(false)
  const [error, setError] = useState('')

  // State for split view
  const [versions, setVersions] = useState([])
  const [selectedVersion, setSelectedVersion] = useState(1)
  const [latestVersion, setLatestVersion] = useState(1)
  
  // Side chat state
  const [sideChatOpen, setSideChatOpen] = useState(false)
  const [sideChatText, setSideChatText] = useState('')
  const [sideChatAnnotationId, setSideChatAnnotationId] = useState(null)
  
  async function handleSubmitReview() {
    if (!code.trim()) return
    setIsReviewing(true)
    setError('')
    try {
      const userId = localStorage.getItem('userId')
      // Create session first if needed, but for simplicity assuming 1 review per session here or handled by backend
      const res = await axios.post('http://localhost:8000/review', {
        code,
        language,
        model_used: modelUsed,
        user_id: parseInt(userId, 10),
      })
      
      const reviewData = res.data
      
      // Update local state to show split view
      const newVersion = {
        version: latestVersion + (stage === 1 ? 0 : 1),
        code: code,
        score: reviewData.score || Math.floor(Math.random() * 5 + 5),
        timestamp: new Date().toLocaleTimeString(),
        // mock review details
        reviewText: reviewData.review_text || 'Great code! Here are slightly improved suggestions.',
      }

      setVersions(prev => [...prev, newVersion])
      const nextVer = newVersion.version
      setLatestVersion(nextVer)
      setSelectedVersion(stage === 1 ? nextVer : nextVer - 1)
      setStage(2)
      
    } catch (err) {
      setError(err.response?.data?.message || 'Review failed.')
    } finally {
      setIsReviewing(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmitReview()
    }
  }

  function handleSideChatOpen(text, annotationId) {
    setSideChatText(text)
    setSideChatAnnotationId(annotationId)
    setSideChatOpen(true)
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-56px)] flex flex-col relative font-body text-on-surface">
        
        {/* Toolbar */}
        <div className="h-12 bg-surface-container border-b border-outline-variant/20 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4">
            <select 
              value={language} 
              onChange={e => setLanguage(e.target.value)}
              className="bg-surface-container-low border border-outline-variant/20 text-xs rounded px-2 py-1 outline-none focus:border-primary"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
              <option value="react">React</option>
            </select>
            
            <div className="flex bg-surface-container-low rounded-lg p-0.5 border border-outline-variant/20">
              <button 
                onClick={() => setModelUsed('gemini')}
                className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-md font-bold transition-colors ${modelUsed === 'gemini' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
              >
                Gemini
              </button>
              <button 
                onClick={() => setModelUsed('llama3')}
                className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-md font-bold transition-colors ${modelUsed === 'llama3' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
              >
                LLaMA 3
              </button>
            </div>
          </div>
          
          {stage > 1 && (
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
              Submission #{versions.length}
            </span>
          )}
        </div>

        {error && (
          <div className="bg-error/10 text-error px-4 py-2 text-xs text-center border-b border-error/20">
            {error}
          </div>
        )}

        {/* STAGE 1: Full screen text area */}
        {stage === 1 ? (
          <div className="flex-1 flex flex-col p-4">
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="// Paste your code here..."
              className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 font-mono-code text-xs resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleSubmitReview}
              disabled={isReviewing || !code.trim()}
              className="mt-4 gradient-primary w-full py-4 rounded-xl text-on-primary font-bold tracking-widest disabled:opacity-50"
            >
              {isReviewing ? 'REVIEWING...' : 'REVIEW MY CODE (CTRL+ENTER)'}
            </button>
          </div>
        ) : (
          /* STAGE 2/3: Split View */
          <div className="flex-1 flex flex-col overflow-hidden">
            <VersionTimeline 
              versions={versions.map(v => ({ version: v.version, timestamp: v.timestamp }))}
              selectedVersion={selectedVersion}
              latestVersion={latestVersion}
              onVersionSelect={setSelectedVersion}
              deltaText="+1.5 pts"
              deltaPositive={true}
            />
            
            <div className="flex-1 flex overflow-hidden">
              {/* LEFT: Previous/Selected Version */}
              <div className="w-1/2 border-r border-outline-variant/20 p-2 overflow-auto flex flex-col">
                <CodePanel 
                  version={selectedVersion}
                  code={versions.find(v => v.version === selectedVersion)?.code || ''}
                  isLatest={false}
                  score={versions.find(v => v.version === selectedVersion)?.score}
                  bugs={1} tips={2} security={0}
                />
              </div>
              
              {/* RIGHT: Latest Version + AI Review */}
              <div className="w-1/2 p-2 overflow-auto flex flex-col gap-2">
                <div className="flex-1 min-h-[300px]">
                  <CodePanel 
                    version={latestVersion}
                    code={versions.find(v => v.version === latestVersion)?.code || ''}
                    isLatest={true}
                    score={versions.find(v => v.version === latestVersion)?.score}
                    bugs={0} tips={1} security={0}
                  />
                </div>
                <div className="bg-surface-container-low border border-outline-variant/20 p-4 rounded-lg">
                  <AIReviewSection 
                    reviewText={versions.find(v => v.version === latestVersion)?.reviewText}
                    highlights={['suggestions']}
                    onSideChatOpen={handleSideChatOpen}
                    reviewId={1}
                    userId={parseInt(localStorage.getItem('userId'), 10) || 1}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="h-14 bg-surface-container border-t border-outline-variant/20 flex items-center justify-between px-6 shrink-0 z-20">
              <span className="text-xs text-on-surface-variant font-medium">
                v{selectedVersion} viewing on left
              </span>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setCode(versions.find(v => v.version === latestVersion)?.code || ''); setStage(1); }}
                  className="px-4 py-2 rounded border border-outline-variant hover:bg-surface-container-high transition-colors text-xs font-bold"
                >
                  Edit and resubmit
                </button>
                <button 
                  disabled
                  className="px-4 py-2 rounded gradient-primary text-on-primary text-xs font-bold opacity-50 cursor-not-allowed"
                >
                  Review code
                </button>
              </div>
            </div>

            <SideChat 
              isOpen={sideChatOpen}
              selectedText={sideChatText}
              annotationId={sideChatAnnotationId}
              onClose={() => setSideChatOpen(false)}
            />
          </div>
        )}
      </div>
    </Layout>
  )
}
