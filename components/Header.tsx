import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuVariants = {
    closed: { 
      y: "-100%",
      transition: {
        duration: 0.5,
        ease: [0.76, 0, 0.24, 1]
      }
    },
    open: { 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.76, 0, 0.24, 1]
      }
    }
  };

  const linkVariants = {
    closed: { y: 20, opacity: 0 },
    open: (i: number) => ({ 
      y: 0, 
      opacity: 1,
      transition: {
        delay: 0.3 + (i * 0.1),
        duration: 0.4,
        ease: "easeOut"
      }
    })
  };

  const navItems = ['Work', 'Services', 'Studio', 'Blog', 'Contact'];

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${isOpen ? 'bg-transparent' : 'bg-black/80 backdrop-blur-md border-b border-neutral-800'}`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <a href="/" className="relative z-50 flex items-center gap-2 group" onClick={(e) => { e.preventDefault(); setIsOpen(false); window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}>
              <div className={`w-3 h-3 rounded-full transition-colors duration-300 group-hover:scale-125 ${isOpen ? 'bg-white' : 'bg-red-dot'}`}></div>
              <span className="font-display font-bold text-xl tracking-tighter mix-blend-difference">RED DOT STUDIO</span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {['Work', 'Services', 'Studio'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors uppercase tracking-wide"
                >
                  {item}
                </a>
              ))}
              <a 
                href="/blog"
                onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/blog'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors uppercase tracking-wide"
              >
                Blog
              </a>
            </nav>

            {/* CTA & Mobile Toggle */}
            <div className="flex items-center gap-4">
              <a 
                href="#contact" 
                className={`hidden md:inline-flex items-center justify-center px-6 py-2 text-sm font-medium rounded-full transition-colors ${isOpen ? 'opacity-0 pointer-events-none' : 'text-black bg-white hover:bg-gray-200'}`}
              >
                Start Project
              </a>
              
              {/* Animated Hamburger Button */}
              <button 
                onClick={toggleMenu}
                className="relative z-50 w-10 h-10 flex flex-col justify-center items-center gap-1.5 group md:hidden"
                aria-label="Toggle Menu"
              >
                <motion.span 
                  animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  className="w-6 h-0.5 bg-white block transition-colors group-hover:bg-red-dot"
                />
                <motion.span 
                  animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="w-6 h-0.5 bg-white block transition-colors group-hover:bg-red-dot"
                />
                <motion.span 
                  animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  className="w-6 h-0.5 bg-white block transition-colors group-hover:bg-red-dot"
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full Screen Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 bg-neutral-900 z-40 flex flex-col justify-center px-4 sm:px-6"
          >
             <div className="flex flex-col gap-6">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item}
                    custom={index}
                    variants={linkVariants}
                  >
                     <a 
                        href={item === 'Blog' ? '/blog' : `#${item.toLowerCase()}`}
                        onClick={(e) => {
                          setIsOpen(false);
                          if (item === 'Blog') {
                            e.preventDefault();
                            window.history.pushState({}, '', '/blog');
                            window.dispatchEvent(new PopStateEvent('popstate'));
                          }
                        }}
                        className="font-display text-5xl sm:text-7xl font-bold text-white tracking-tighter hover:text-red-dot transition-colors block"
                     >
                        {item}
                     </a>
                  </motion.div>
                ))}
             </div>

             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute bottom-12 left-0 w-full px-6 flex justify-between items-end text-sm text-gray-500 font-mono"
             >
                <div className="flex flex-col gap-1">
                   <span>Brussels, BE</span>
                   <span>Av. Louise 231</span>
                </div>
                <div className="flex gap-4">
                   <a href="#" className="hover:text-white">IG</a>
                   <a href="#" className="hover:text-white">TW</a>
                   <a href="#" className="hover:text-white">LN</a>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};