import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const About: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    }
  };

  return (
    <section id="studio" className="py-24 border-t border-neutral-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Label */}
        <motion.span 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-red-dot font-mono text-sm block mb-12"
        >
          03 / WHY RED DOT
        </motion.span>

        {/* Big statement */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-20"
        >
          <motion.h2 
            variants={itemVariants}
            className="font-display text-3xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1] max-w-4xl mb-8"
          >
            Most agencies sell you deliverables.
            <span className="text-gray-500"> We sell you outcomes.</span>
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-lg text-gray-400 max-w-2xl leading-relaxed"
          >
            Red Dot Studio exists for one reason: to make your business look as good as it actually is.
            We combine sharp strategy with meticulous execution so every brand touchpoint earns trust, 
            drives action, and compounds over time.
          </motion.p>
        </motion.div>

        {/* Process / Differentiators grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-3 gap-px bg-neutral-800 mb-20"
        >
          {[
            {
              num: '01',
              title: 'Strategy Before Pixels',
              desc: 'We start with your revenue goals, competitive landscape, and customer journey — then design backwards from results.'
            },
            {
              num: '02',
              title: 'Built to Convert',
              desc: 'Every layout decision, color choice, and interaction is pressure-tested against one question: does this move the needle?'
            },
            {
              num: '03',
              title: 'Ship-Ready Output',
              desc: 'No hand-off gaps. We deliver production code, not static comps. Your team gets assets they can deploy, not interpret.'
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              variants={itemVariants}
              className="bg-black p-8 md:p-10 flex flex-col"
            >
              <span className="text-red-dot font-mono text-sm mb-6">{item.num}</span>
              <h4 className="text-white font-display font-semibold text-xl mb-3">{item.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed flex-1">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="border-l-2 border-red-dot pl-8 md:pl-12 py-4 mb-20 max-w-3xl"
        >
          <blockquote className="text-xl md:text-2xl text-gray-300 leading-relaxed font-display mb-6">
            "Red Dot didn't just redesign our site — they redesigned our pipeline. 
            Inbound leads doubled in the first quarter."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold text-red-dot">MK</div>
            <div>
              <p className="text-white text-sm font-medium">Marc Kellner</p>
              <p className="text-gray-500 text-xs">CEO, Velta Finance</p>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-10 border-t border-neutral-800"
        >
          <p className="text-gray-400 text-lg">Ready to see what Red Dot can do for you?</p>
          <a 
            href="#contact"
            className="group inline-flex items-center gap-2 text-white font-medium hover:text-red-dot transition-colors"
          >
            Let's talk <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

      </div>
    </section>
  );
};