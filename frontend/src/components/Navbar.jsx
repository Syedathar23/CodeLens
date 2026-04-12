import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/20 bg-surface">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8  bg-[#10A37F] rounded-md flex items-center justify-center">
          <span className="material-symbols-outlined text-black text-sm">code</span>
        </div>
        <Link to="/" className="font-headline font-semibold text-lg hover:opacity-80">
          CodeLens AI
        </Link>
      </div>

      <div className="hidden md:flex gap-8 text-sm font-medium">
        <a href="/#features" className="text-on-surface-variant hover:text-white transition-colors">Features</a>
        <a href="/#how" className="text-on-surface-variant hover:text-white transition-colors">How it works</a>
        <a href="/contact" className="text-on-surface-variant hover:text-white transition-colors">Contact Us</a>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/signup" className="text-sm font-medium text-on-surface hover:text-[#10A37F] transition-colors display flex">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 12C20 7.58 16.42 4 12 4C9.24 4 6.81 5.36 5.36 7.44L7.03 8.56C8.13 6.98 9.97 6 12 6C15.31 6 18 8.69 18 12C18 15.31 15.31 18 12 18C9.97 18 8.13 17.02 7.03 15.44L5.36 16.56C6.81 18.64 9.24 20 12 20C16.42 20 20 16.42 20 12Z"/>
            <path d="M3 11H14V8L19 12L14 16V13H3V11Z"/>
          </svg>Login/Signup  
        </Link>
      </div>
    </nav>
  )
}
