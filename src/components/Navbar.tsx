import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const linkStyle = (path: string) =>
    `px-4 py-2 transition ${
      location.pathname === path
        ? 'text-white bg-blue-600 rounded-md'
        : 'hover:text-blue-600'
    }`

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
      <Link to="/" className="text-2xl font-bold text-blue-600">Terrier Taste</Link>
      <div className="flex gap-6">
        <Link to="/" className={linkStyle('/')}>Home</Link>
        <Link to="/signup" className={linkStyle('/signup')}>Sign Up</Link>
        <Link to="/explore" className={linkStyle('/explore')}>Explore</Link>
        <Link to="/dashboard" className={linkStyle('/dashboard')}>Dashboard</Link>
      </div>
    </nav>
  )
}
