import React from 'react';
import { motion } from 'framer-motion';
import { PROJECTS } from '../constants';
import { ArrowUpRight } from 'lucide-react';

export const WorkGrid: React.FC = () => {
  return (
    <section id="work" className="py-24 border-t border-neutral-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <span className="text-red-dot font-mono text-sm mb-2 block">01 / SELECTED WORK</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Results, not just visuals</h2>
          </div>
          <p className="text-gray-400 max-w-sm text-sm md:text-base">
            Every project ships with measurable impact. Here's what that looks like.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-8 gap-y-16">
          {PROJECTS.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm mb-6 bg-neutral-900">
                <img 
                  src={project.imageUrl} 
                  alt={project.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500" />
                
                {/* Hover overlay with description */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                  <p className="text-white/90 text-sm leading-relaxed max-w-xs">{project.description}</p>
                </div>

                {/* Arrow */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-red-dot text-white p-3 rounded-full">
                        <ArrowUpRight size={18} />
                    </div>
                </div>
              </div>

              <div className="flex justify-between items-start border-t border-neutral-800 pt-4 group-hover:border-red-dot transition-colors duration-300">
                <div>
                  <h3 className="text-xl font-display font-medium mb-1">{project.title}</h3>
                  <p className="text-gray-500 text-sm">{project.category}</p>
                </div>
                <span className="text-gray-500 font-mono text-sm">{project.year}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};