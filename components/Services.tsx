import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVICES } from '../constants';
import { Plus, Minus } from 'lucide-react';

export const Services: React.FC = () => {
  const [openService, setOpenService] = useState<string | null>(SERVICES[0].id);

  return (
    <section id="services" className="py-24 border-t border-gray-200 bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Left Column: Title */}
            <div className="lg:col-span-4">
                 <span className="text-red-dot font-mono text-sm mb-4 block">02 / CAPABILITIES</span>
                 <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight mb-6">
                    What we deliver
                 </h2>
                 <p className="text-gray-500 max-w-xs">
                    End-to-end — from the first whiteboard sketch to the last line of production code.
                 </p>
            </div>

            {/* Right Column: Accordion */}
            <div className="lg:col-span-8">
                {SERVICES.map((service) => (
                    <div 
                        key={service.id} 
                        className="border-b border-gray-200"
                    >
                        <button 
                            onClick={() => setOpenService(openService === service.id ? null : service.id)}
                            className="w-full py-8 flex items-start justify-between text-left group"
                        >
                            <div className="flex items-baseline gap-8">
                                <span className="font-mono text-sm text-gray-500">{service.number}</span>
                                <h3 className={`text-2xl md:text-3xl font-display transition-colors duration-300 ${openService === service.id ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-900'}`}>
                                    {service.title}
                                </h3>
                            </div>
                            <span className="text-gray-500 group-hover:text-gray-900 transition-colors pt-2">
                                {openService === service.id ? <Minus size={20} /> : <Plus size={20} />}
                            </span>
                        </button>
                        
                        <AnimatePresence>
                            {openService === service.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <div className="pl-[calc(2rem+20px)] pb-8 pr-8">
                                        <p className="text-lg text-gray-400 mb-6 max-w-2xl">
                                            {service.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {service.tags.map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-gray-200 rounded-sm text-xs text-gray-600 font-mono uppercase tracking-wider">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
};