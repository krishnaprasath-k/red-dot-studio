import React from 'react';
import { motion } from 'framer-motion';

export const About: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.2, 0.65, 0.3, 0.9] // Custom pleasant ease
      }
    }
  };

  return (
    <section id="studio" className="py-24 border-t border-neutral-800 bg-neutral-900/10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12">
            {/* Left Column: Label + Image */}
            <div className="lg:col-span-4 flex flex-col gap-8">
                 <motion.span 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-red-dot font-mono text-sm block"
                 >
                    03 / STUDIO
                 </motion.span>
                 
                 <motion.div
                    initial={{ opacity: 0, clipPath: "inset(10% 0 0 0)" }}
                    whileInView={{ opacity: 1, clipPath: "inset(0% 0 0 0)" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} // smooth reveal
                    className="relative w-full aspect-[3/4] bg-neutral-800 overflow-hidden hidden lg:block rounded-sm grayscale hover:grayscale-0 transition-all duration-700"
                 >
                    <img 
                        src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop" 
                        alt="Minimal Architecture" 
                        className="w-full h-full object-cover opacity-80"
                    />
                 </motion.div>
            </div>

            {/* Content */}
            <motion.div 
                className="lg:col-span-8 flex flex-col gap-16"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                <motion.h2 
                    variants={itemVariants}
                    className="font-display text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
                >
                    Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.
                </motion.h2>

                <div className="grid md:grid-cols-2 gap-12">
                    <motion.div
                        variants={itemVariants}
                        className="text-gray-400 leading-relaxed text-lg"
                    >
                        <p className="mb-6">
                            Red Dot Studio is a digital product agency driven by clarity. 
                            We specialize in cutting through the noise to build products that are 
                            intuitive, robust, and undeniably effective.
                        </p>
                        <p>
                            We reject decorative fluff in favor of strong typography, meaningful motion, 
                            and content-first layouts. Our process is collaborative, transparent, and direct.
                        </p>
                    </motion.div>
                    
                    <div className="flex flex-col gap-8 border-l border-neutral-800 pl-8">
                        {[
                            { title: "Radical Simplicity", desc: "We reduce complexity to its absolute essence." },
                            { title: "Utility First", desc: "We design for function, form follows closely." },
                            { title: "Visual Impact", desc: "We create work that commands attention." }
                        ].map((item, i) => (
                            <motion.div 
                                key={i}
                                variants={itemVariants}
                            >
                                <h4 className="text-white font-medium mb-1 font-display text-xl">{item.title}</h4>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
      </div>
    </section>
  );
};