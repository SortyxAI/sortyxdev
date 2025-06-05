import { motion } from 'framer-motion'

const Footer = () => {
  return (
    <footer className="relative z-10 py-4 px-4 md:py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <motion.p 
              className="text-sm text-white/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Helping save our planet 🌎 one scan at a time.
            </motion.p>
          </div>
          
          <div className="text-center mb-4">
            <motion.h2 
              className="text-2xl font-bold text-emerald-300 italic font-poppins"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Sort Smarter. Recycle Better. Impact Greater.
            </motion.h2>
          </div>

          <div className="flex items-center justify-center space-x-6">
            {['Learn', 'About', 'FAQ'].map((item, index) => (
              <motion.a
                key={item}
                href="#"
                className="text-white/90 hover:text-white transition-colors text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                whileHover={{ y: -2 }}
              >
                {item}
              </motion.a>
            ))}
          </div>
        </div> 
      </div>
    </footer>
  )
}

export default Footer