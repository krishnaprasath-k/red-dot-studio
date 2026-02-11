import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';

const Counter: React.FC<{ from: number; to: number; suffix?: string; duration?: number }> = ({ from, to, suffix = '', duration = 2 }) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    const controls = animate(count, to, { duration, ease: 'easeOut' });
    const unsubscribe = rounded.on('change', (v) => setDisplay(v));
    return () => { controls.stop(); unsubscribe(); };
  }, []);

  return <>{display}{suffix}</>;
};

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-between pt-24 pb-12 overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-grid-pattern bg-[length:60px_60px] opacity-[0.04] pointer-events-none" />
      
      {/* Red accent glow — subtle, bottom right */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-red-dot/[0.04] rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 flex-1 flex flex-col justify-center">
        
        {/* Top line — credibility bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center gap-4 mb-10"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-neutral-800 rounded-full text-xs font-mono uppercase text-gray-500 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Accepting new projects
          </span>
          <span className="text-xs text-gray-600 font-mono">Est. 2019 · Bangalore, India</span>
        </motion.div>

        {/* Main headline */}
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-[clamp(2.5rem,7vw,7rem)] font-bold tracking-[-0.04em] leading-[0.92] mb-6"
          >
            We build brands<br />
            that <span className="text-red-dot">outperform.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl leading-relaxed"
          >
            Strategy-led design studio helping ambitious companies ship digital products 
            that convert visitors into customers — faster than the competition.
          </motion.p>
        </div>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap gap-4 mb-20"
        >
          <a 
            href="#contact"
            className="group inline-flex items-center gap-3 px-7 py-3.5 bg-red-dot text-white font-medium rounded-full hover:bg-red-600 transition-all hover:gap-4"
          >
            Start a project <ArrowRight className="w-4 h-4" />
          </a>
          <a 
            href="#work"
            className="inline-flex items-center gap-2 px-7 py-3.5 border border-neutral-700 text-gray-300 font-medium rounded-full hover:border-white hover:text-white transition-all"
          >
            View our work
          </a>
        </motion.div>

        {/* Stats bar — social proof */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-neutral-800/80"
        >
          {[
            { value: 60, suffix: '+', label: 'Projects Delivered' },
            { value: 98, suffix: '%', label: 'Client Retention' },
            { value: 3, suffix: 'x', label: 'Avg. Conversion Lift' },
            { value: 6, suffix: '+', label: 'Years in Business' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col">
              <span className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                <Counter from={0} to={stat.value} suffix={stat.suffix} duration={2 + i * 0.3} />
              </span>
              <span className="text-sm text-gray-500 mt-1 font-mono uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="flex justify-center"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </motion.div>
      </motion.div>
    </section>
  );
};