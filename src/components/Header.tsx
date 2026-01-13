import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="glass-header px-6 h-16 flex items-center justify-center shadow-xl backdrop-blur-md">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center font-black text-background transition-transform group-hover:rotate-12">
          Z
        </div>
        <span className="text-xl font-black tracking-tighter text-white uppercase italic">
          zetta
        </span>
      </Link>
    </header>
  )
}
