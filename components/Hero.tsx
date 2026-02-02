import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoveRight } from 'lucide-react';

export const Hero: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.1] pointer-events-none" />
      
      {/* Radial Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Text Content */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <span className="px-3 py-1 border border-neutral-800 rounded-full text-xs font-mono uppercase text-gray-400">
              Available for new work
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9]"
          >
            Show, don't <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
              just tell.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-400 max-w-lg leading-relaxed"
          >
            We build digital products that demonstrate value instantly. 
            Minimal friction, maximum utility.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <a 
              href="#work"
              className="group flex items-center gap-2 border-b border-white pb-1 text-white hover:text-red-dot hover:border-red-dot transition-all"
            >
              See our work <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>

        {/* Live Demo / Visual */}
        <div className="lg:col-span-5 relative h-[400px] lg:h-[600px] w-full flex items-center justify-center">
            {/* Interactive Card */}
            <motion.div
                className="relative w-full max-w-md aspect-[4/5] bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden cursor-pointer"
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {/* Simulated Interface Header */}
                <div className="h-10 border-b border-neutral-800 flex items-center px-4 gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500/20" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                    <div className="w-2 h-2 rounded-full bg-green-500/20" />
                </div>

                {/* Simulated Content Area */}
                <div className="p-6 relative h-full">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div 
                            className="w-32 h-32 bg-red-dot rounded-full blur-[80px]"
                            animate={{ 
                                scale: isHovered ? 1.5 : 1,
                                opacity: isHovered ? 0.6 : 0.3
                            }}
                        />
                    </div>
                    
                    <div className="relative z-10 flex flex-col gap-4 h-full">
                         {/* Skeleton UI Lines */}
                         <motion.div 
                            className="h-8 w-3/4 bg-neutral-800 rounded"
                            animate={{ width: isHovered ? "100%" : "75%" }}
                         />
                         <motion.div className="h-4 w-1/2 bg-neutral-800 rounded" />
                         <div className="flex-1" />
                         
                         {/* Interactive Elements that appear on hover */}
                         <div className="grid grid-cols-2 gap-4">
                            <motion.div 
                                className="h-32 bg-neutral-800/50 rounded-lg border border-neutral-700/50"
                                animate={{ y: isHovered ? -10 : 0 }}
                                transition={{ delay: 0.1 }}
                            />
                            <motion.div 
                                className="h-32 bg-neutral-800/50 rounded-lg border border-neutral-700/50"
                                animate={{ y: isHovered ? -20 : 0 }}
                                transition={{ delay: 0.2 }}
                            />
                         </div>
                    </div>
                </div>

                {/* Overlay Text */}
                <div className="absolute bottom-6 right-6">
                    <span className="text-xs font-mono text-neutral-500">
                        {isHovered ? 'INTERACTION_ACTIVE' : 'HOVER_TO_ACTIVATE'}
                    </span>
                </div>
            </motion.div>
        </div>
      </div>
    </section>
  );
};