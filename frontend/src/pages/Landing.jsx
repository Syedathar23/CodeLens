import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center max-w-5xl mx-auto w-full">
        {/* Hero */}
        <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6 text-on-surface tracking-tight">
          Your AI-powered <br/><span className="text-[#dfe74e]">code mentor</span>
        </h1>
        <p className="text-xl text-on-surface-variant mb-12 max-w-2xl">
          Monolithic Intelligence that reviews your code, suggests real-time edits, and helps you grow as a developer with deep insights.
        </p>

        <div className="flex gap-4 mb-24">
          <button 
            onClick={() => navigate('/signup')} 
            className="bg-[#10A37F] text-black text-base font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Start for free
          </button>
          <button 
            onClick={() => navigate('/login')} 
            className="border border-outline-variant text-on-surface text-base font-bold px-8 py-3 rounded-lg hover:bg-surface-container transition-colors"
          >
            Login to dashboard
          </button>
        </div>

        {/* Features */}
        <div id="features" className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {[
            { title: 'Iterative Review Loop', icon: 'sync', desc: 'Continuous feedback on every commit.' },
            { title: 'Developer Skill Profile', icon: 'analytics', desc: 'Track your growth and code quality over time.' },
            { title: 'Code Diff View', icon: 'difference', desc: 'Exact line-by-line breakdown of AI suggestions.' },
            { title: 'Inline Side Chat', icon: 'chat', desc: 'Highlight code and ask follow-up questions.' }
          ].map((f) => (
            <div key={f.title} className="bg-surface-container border border-outline-variant/20 p-6 rounded-xl text-left hover:border-[#10A37F] transition-colors">
              <span className="material-symbols-outlined text-white  text-4xl mb-4 block">{f.icon}</span>
              <h3 className="font-headline font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-on-surface-variant">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div id="how" className="w-full mb-24">
          <h2 className="text-3xl font-headline font-bold mb-12">How it works</h2>
          <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16">
            {[
              { step: '1', title: 'Paste', desc: 'Drop your code into the secure editor.' },
              { step: '2', title: 'Review', desc: 'Get deep AI analysis in seconds.' },
              { step: '3', title: 'Grow', desc: 'Learn from suggestions and improve.' }
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center justify-center border-4 border-[#10A37F] rounded-full w-56 h-56 p-6 hover:shadow-lg hover:shadow-[#10A37F]/10 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-[#10A37F]/10 flex items-center justify-center text-[#10A37F] font-bold text-lg mb-2">
                  {s.step}
                </div>
                <h3 className="font-headline font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-[13px] text-on-surface-variant text-center max-w-[160px] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant/20 py-8 text-center text-on-surface-variant text-sm">
        <p>© 2026 CodeLens AI. All rights reserved.</p>
      </footer>
    </div>
  )
}