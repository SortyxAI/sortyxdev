import { useState, useEffect } from 'react'

const BackgroundVideo = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Static image background */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${isLoaded ? 'opacity-70' : 'opacity-0'}`}
        style={{ backgroundImage: 'url(/src/assets/greenbg.avif)', zIndex: 0 }}
      />
      
      <div className={`absolute inset-0 bg-primary-800 transition-opacity duration-1000 ${isLoaded ? 'opacity-0' : 'opacity-100'}`} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60 z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)] z-[2]" />
      <video
        src="/src/assets/SortyxVideo.mp4"
        className="absolute inset-0 object-cover w-full h-full transition-opacity duration-1000"
        style={{ zIndex: 0 }}
        autoPlay
        loop
        muted
      ></video>
    </div>
  )
}

export default BackgroundVideo