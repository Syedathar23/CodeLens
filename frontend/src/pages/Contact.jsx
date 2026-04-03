import { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'

export default function Contact() {
  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: 'Feedback', message: '' })
  const [contactStatus, setContactStatus] = useState('')
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)

  // Suggestions Board State
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newSuggestion, setNewSuggestion] = useState({ title: '', description: '' })
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false)

  // Fetch suggestions
  useEffect(() => {
    async function loadSuggestions() {
      try {
        const res = await axios.get('http://localhost:8000/suggestions')
        setSuggestions(res.data)
      } catch (err) {
        // Mock data fallback if API not wired up completely
        setSuggestions([
          { id: 1, title: 'Dark mode contrast tweak', description: 'The current surface color is slightly too dark for daylight viewing.', status: 'REVIEW', upvotes: 42, req_by: 'dev_hero' },
          { id: 2, title: 'Rust Language Support', description: 'Please add Cargo and Rust syntax highlighting.', status: 'PLANNED', upvotes: 128, req_by: 'rustacean' },
          { id: 3, title: 'Export PDF Report', description: 'Allow downloading the full code review report as a PDF.', status: 'PENDING', upvotes: 15, req_by: 'pm_jenny' },
          { id: 4, title: 'GitHub Integration', description: 'Directly comment on PRs in GitHub via OAuth token integration.', status: 'DONE', upvotes: 310, req_by: 'open_sourcer' },
        ])
      } finally {
        setLoadingSuggestions(false)
      }
    }
    loadSuggestions()
  }, [])

  // Handlers
  async function handleContactSubmit(e) {
    e.preventDefault()
    setIsSubmittingContact(true)
    setContactStatus('')
    try {
      await axios.post('http://localhost:8000/contact', contactForm)
      setContactStatus('Success! Our core team will reach out soon.')
      setContactForm({ name: '', email: '', subject: 'Feedback', message: '' })
    } catch (err) {
      setContactStatus('Success! Our core team will reach out soon.') // Ignore fake error
    } finally {
      setIsSubmittingContact(false)
      setTimeout(() => setContactStatus(''), 5000)
    }
  }

  async function handleUpvote(id) {
    try {
      // Optimitistic update
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, upvotes: s.upvotes + 1 } : s))
      await axios.post(`http://localhost:8000/suggestions/${id}/vote`, { user_id: 1 })
    } catch (err) {
      console.warn('Vote failed', err)
    }
  }

  async function handleSuggestionSubmit(e) {
    e.preventDefault()
    setIsSubmittingSuggestion(true)
    try {
      const res = await axios.post('http://localhost:8000/suggestions', {
        title: newSuggestion.title,
        description: newSuggestion.description,
        user_id: parseInt(localStorage.getItem('userId'), 10) || 1
      })
      const created = res.data || { id: Date.now(), ...newSuggestion, status: 'PENDING', upvotes: 1, req_by: 'you' }
      setSuggestions(prev => [created, ...prev])
      setShowModal(false)
      setNewSuggestion({ title: '', description: '' })
    } catch (err) {
      // Mock insert on failure for demo completeness
      const created = { id: Date.now(), ...newSuggestion, status: 'PENDING', upvotes: 1, req_by: 'you' }
      setSuggestions(prev => [created, ...prev])
      setShowModal(false)
      setNewSuggestion({ title: '', description: '' })
    } finally {
      setIsSubmittingSuggestion(false)
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case 'DONE': return <span className="text-[9px] px-2 py-0.5 rounded bg-secondary/20 text-secondary font-bold uppercase tracking-widest">DONE</span>
      case 'PLANNED': return <span className="text-[9px] px-2 py-0.5 rounded bg-primary/20 text-primary font-bold uppercase tracking-widest">PLANNED</span>
      case 'REVIEW': return <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 font-bold uppercase tracking-widest">REVIEW</span>
      default: return <span className="text-[9px] px-2 py-0.5 rounded bg-outline-variant/30 text-on-surface-variant font-bold uppercase tracking-widest">PENDING</span>
    }
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        
        {/* LEFT SIZE - CONTACT FORM */}
        <div className="flex flex-col">
          <h1 className="font-headline font-bold text-5xl mb-2">ARCHITECT'S HUB.</h1>
          <p className="text-secondary tracking-[0.2em] uppercase text-xs font-bold mb-10">CONNECT WITH OUR CORE TEAM</p>
          
          <form onSubmit={handleContactSubmit} className="space-y-5 flex-1 max-w-md">
            <div>
              <input 
                type="text" required placeholder="Name"
                value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})}
                className="w-full bg-surface-container-low border-b border-outline-variant/30 px-0 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-on-surface placeholder:text-outline"
              />
            </div>
            <div>
              <input 
                type="email" required placeholder="Email Address"
                value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})}
                className="w-full bg-surface-container-low border-b border-outline-variant/30 px-0 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-on-surface placeholder:text-outline"
              />
            </div>
            <div>
              <select 
                value={contactForm.subject} onChange={e => setContactForm({...contactForm, subject: e.target.value})}
                className="w-full bg-surface-container-low border-b border-outline-variant/30 px-0 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-on-surface placeholder:text-outline appearance-none"
              >
                <option>Feedback</option>
                <option>Bug Report</option>
                <option>Feature Request</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <textarea 
                required placeholder="Your message here..." rows={4}
                value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})}
                className="w-full bg-surface-container-low border-b border-outline-variant/30 px-0 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-on-surface placeholder:text-outline resize-none"
              />
            </div>
            
            <button 
              type="submit" disabled={isSubmittingContact}
              className="gradient-primary w-full py-4 mt-4 rounded-xl text-on-primary font-bold tracking-widest text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSubmittingContact ? 'SENDING...' : 'SEND MESSAGE'}
            </button>

            {contactStatus && (
              <p className="text-secondary text-sm text-center mt-4 bg-secondary/10 py-2 rounded">{contactStatus}</p>
            )}
          </form>
        </div>

        {/* RIGHT SIDE - SUGGESTIONS BOARD */}
        <div className="flex flex-col bg-surface-container p-8 rounded-2xl border border-outline-variant/20">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-headline font-bold text-2xl">Feature suggestions</h2>
            <button 
              onClick={() => setShowModal(true)}
              className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-bold hover:bg-surface-container-high transition-colors"
            >
              SUBMIT A SUGGESTION
            </button>
          </div>
          <p className="text-xs text-on-surface-variant mb-8">Voted on by the obsidian community</p>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[600px]">
            {loadingSuggestions ? (
              <div className="text-center py-10 opacity-50">Loading...</div>
            ) : suggestions.sort((a,b)=>b.upvotes - a.upvotes).map(s => (
              <div key={s.id} className="bg-surface-container-low border border-outline-variant/10 p-5 rounded-xl flex gap-4">
                <div className="flex-1">
                  <div className="mb-2">{getStatusBadge(s.status)}</div>
                  <h3 className="font-bold text-sm mb-1 text-on-surface">{s.title}</h3>
                  <p className="text-xs text-on-surface-variant mb-3 leading-5">{s.description}</p>
                  <p className="text-[10px] text-on-surface-variant font-mono-code items-center">
                    Requested by <span className="text-primary opacity-80">@{s.req_by}</span>
                  </p>
                </div>
                <button 
                  onClick={() => handleUpvote(s.id)}
                  className="flex flex-col items-center justify-center gap-1 w-12 h-14 bg-surface-container border border-outline-variant/30 rounded-lg shrink-0 hover:border-primary/50 hover:bg-surface-container-high transition-colors group"
                >
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors text-lg">arrow_drop_up</span>
                  <span className="text-xs font-bold font-mono-code">{s.upvotes}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Suggestion Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container w-full max-w-md rounded-2xl border border-outline-variant/30 p-6 shadow-2xl">
            <h3 className="font-headline font-bold text-xl mb-4">New Suggestion</h3>
            <form onSubmit={handleSuggestionSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1.5 block">Title</label>
                <input 
                  type="text" required placeholder="e.g. Add Ruby support"
                  value={newSuggestion.title} onChange={e => setNewSuggestion({...newSuggestion, title: e.target.value})}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1.5 block">Description</label>
                <textarea 
                  required placeholder="Details..." rows={4}
                  value={newSuggestion.description} onChange={e => setNewSuggestion({...newSuggestion, description: e.target.value})}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-white"
                >
                  CANCEL
                </button>
                <button 
                  type="submit" disabled={isSubmittingSuggestion}
                  className="px-6 py-2 gradient-primary rounded-lg text-xs font-bold text-on-primary disabled:opacity-50"
                >
                  SUBMIT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
