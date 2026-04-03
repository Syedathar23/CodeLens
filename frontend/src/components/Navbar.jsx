import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 gradient-primary rounded-md flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary text-sm">code</span>
        </div>
        <Link to="/" className="font-headline font-semibold text-lg hover:opacity-80">
          CodeLens AI
        </Link>
      </div>

      <div className="hidden md:flex gap-8 text-sm font-medium">
        <a href="#features" className="text-on-surface-variant hover:text-white transition-colors">Features</a>
        <a href="#how" className="text-on-surface-variant hover:text-white transition-colors">How it works</a>
        <a href="#pricing" className="text-on-surface-variant hover:text-white transition-colors">Pricing</a>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/login" className="text-sm font-medium text-on-surface hover:text-primary transition-colors">
          Login
        </Link>
        <Link to="/signup" className="gradient-primary text-on-primary text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
          Get Started
        </Link>
      </div>
    </nav>
  )
}
