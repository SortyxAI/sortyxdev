import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const Header = ({ onInfoClick, onDashboardClick, onAuthClick, onProfileClick, onQrScanClick }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const { currentUser, logout } = useAuth()
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-20 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <motion.div 
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'loop', ease: 'linear' }}
            className="mr-3"
          >
            
            <span className="text-3xl"></span>
            <img src="/src/assets/SortyxLogoBlack.png" alt="Sortyx Logo" width="40" height="40"></img>
          </motion.div>
          <span className={`text-xl md:text-2xl font-bold transition-colors duration-300 ${
            isScrolled ? 'text-primary-800' : 'text-white'
          }`}>
            Sortyx
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Dashboard Button */}
          <button 
            onClick={onDashboardClick}
            className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 ${
              isScrolled 
                ? 'bg-primary-100 text-primary-800 hover:bg-primary-200' 
                : 'bg-green-500 text-white hover:bg-white/20'
            }`}
            aria-label="Open Dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="hidden md:inline">Dashboard</span>
          </button>

          {/* QR Code Scan Button */}
          <button
            onClick={onQrScanClick}
            className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 ${
              isScrolled 
                ? 'bg-primary-100 text-primary-800 hover:bg-primary-200' 
                : 'bg-yellow-500 text-white hover:bg-white/20'
            }`}
            aria-label="Scan QR Code"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
              <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
              <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
              <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
            <span className="hidden md:inline">Scan QR</span>
          </button>
          
          <button
            onClick={onInfoClick}
            className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 ${
              isScrolled 
                ? 'bg-primary-100 text-primary-800 hover:bg-primary-200' 
                : 'bg-green-700 text-white hover:bg-white/20'
            }`}
          >
            <span className="text-xl">ℹ️</span>
            <span className="hidden md:inline">Learn More</span>
          </button>

          {/* Authentication Section */}
          {currentUser ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onProfileClick}
                className={`px-3 py-2 rounded-full transition-all duration-300 flex items-center gap-2 ${
                  isScrolled 
                    ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline text-sm font-medium">
                  {currentUser.displayName || 'User'}
                </span>
              </button>
              
              <button
                onClick={handleLogout}
                className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 ${
                  isScrolled 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 ${
                isScrolled 
                  ? 'bg-primary-500 text-white hover:bg-primary-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden md:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header