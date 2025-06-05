import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const Header = ({ onInfoClick, onDashboardClick }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
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
        </div>
      </div>
    </header>
  )
}

export default Header