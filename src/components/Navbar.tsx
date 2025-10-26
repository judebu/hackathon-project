import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import terrierLogo from '../assets/terrierlogo.svg'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isLoading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const navStyles = {
    nav: {
      backgroundColor: '#7a0c22',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      position: 'sticky' as const,
      top: 0,
      zIndex: 50
    },
    container: {
      maxWidth: 'auto',
      margin: '0 auto',
      padding: '0 1rem'
    },
    innerContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      // alignItems: 'center',
      height: '70px',
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none'
    },
    logoImage: {
      marginLeft: '0',
      height: '96px',
      width: 'auto',
      // objectFit: 'contain' as const,
    },
    logoText: {
      fontSize: '1.35rem',
      fontWeight: 700,
      color: 'white',
      letterSpacing: '0.02em'
    },
    links: {
      display: isMobile ? 'none' : 'flex',
      gap: '0.5rem'
    },
    link: (isActive: boolean): React.CSSProperties => ({
      padding: '0.75rem 1.5rem',
      textDecoration: 'none',
      borderRadius: '0.5rem',
      transition: 'all 0.2s',
      backgroundColor: isActive ? '#dc143c' : 'transparent',
      color: 'white',
      fontWeight: '500',
      cursor: 'pointer'
    }),
    actions: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center'
    },
    signOutButton: {
      padding: '0.6rem 1.2rem',
      borderRadius: '0.5rem',
      border: '1px solid rgba(255, 255, 255, 0.55)',
      backgroundColor: 'transparent',
      color: 'white',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    mobileButton: {
      display: isMobile ? 'block' : 'none',
      padding: '0.5rem',
      borderRadius: '0.375rem',
      border: 'none',
      backgroundColor: 'transparent',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    mobileNav: {
      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
      backgroundColor: '#7a0c22'
    },
    mobileInner: {
      padding: '0.5rem'
    },
    mobileLink: (isActive: boolean): React.CSSProperties => ({
      display: 'block',
      padding: '0.75rem 1rem',
      textDecoration: 'none',
      backgroundColor: isActive ? '#dc143c' : 'transparent',
      color: 'white',
      borderRadius: '0.375rem',
      marginBottom: '0.25rem',
      transition: 'all 0.2s',
      fontWeight: '500'
    })
  }

  const handleLogout = async () => {
    try {
      await logout()
      setIsMenuOpen(false)
      navigate('/')
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  return (
    <nav style={navStyles.nav}>
      <div style={navStyles.container}>
        <div style={navStyles.innerContainer}>
          <Link to="/" style={navStyles.logoContainer}>
            <img src={terrierLogo} alt="Terrier Taste" style={navStyles.logoImage} />
          </Link>

          <div style={navStyles.actions}>
            <div style={navStyles.links}>
              <Link to="/" style={navStyles.link(location.pathname === '/')}>Home</Link>
              <Link to="/explore" style={navStyles.link(location.pathname === '/explore')}>Explore</Link>
              <Link to="/dashboard" style={navStyles.link(location.pathname === '/dashboard')}>Dashboard</Link>
              {!user && (
                <Link to="/auth" style={navStyles.link(location.pathname === '/auth')}>
                  Sign In / Up
                </Link>
              )}
            </div>
            {user && !isMobile && !isLoading && (
              <button type="button" onClick={handleLogout} style={navStyles.signOutButton}>
                Sign Out
              </button>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={navStyles.mobileButton}
              aria-label="Toggle menu"
            >
              <svg
                width="28"
                height="28"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && isMobile && (
        <div style={navStyles.mobileNav}>
          <div style={navStyles.mobileInner}>
            <Link
              to="/"
              style={navStyles.mobileLink(location.pathname === '/')}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/explore"
              style={navStyles.mobileLink(location.pathname === '/explore')}
              onClick={() => setIsMenuOpen(false)}
            >
              Explore
            </Link>
            <Link
              to="/dashboard"
              style={navStyles.mobileLink(location.pathname === '/dashboard')}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            {!user && (
              <Link
                to="/auth"
                style={navStyles.mobileLink(location.pathname === '/auth')}
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In / Up
              </Link>
            )}
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                style={{ ...navStyles.mobileLink(false), width: '100%', textAlign: 'left' }}
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
