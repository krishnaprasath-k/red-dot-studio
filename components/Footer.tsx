import React from 'react';
import { ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="py-24 border-t border-neutral-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
            <span className="text-red-dot font-mono text-sm mb-6">04 / GET IN TOUCH</span>
            
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6">
                Ready to grow?
            </h2>
            <p className="text-gray-400 text-lg max-w-md mb-12">
                Tell us about your project and we'll get back within 24 hours.
            </p>

            <a 
                href="mailto:info@reddotstudio.in" 
                className="group inline-flex items-center gap-3 px-8 py-4 text-base font-medium text-white bg-red-dot rounded-full hover:bg-red-600 hover:scale-105 transition-all mb-20"
            >
                info@reddotstudio.in <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <div className="w-full grid md:grid-cols-3 gap-8 text-sm text-gray-500 border-t border-neutral-800 pt-8">
                <div className="text-center md:text-left">
                    <p>© 2026 Red Dot Studio.</p>
                    <p>All rights reserved.</p>
                </div>
                
                <div className="flex justify-center gap-6">
                    <a href="#" className="hover:text-white transition-colors">Instagram</a>
                    <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                    <a href="#" className="hover:text-white transition-colors">Twitter</a>
                </div>

                <div className="text-center md:text-right">
                    <p>Bangalore, India</p>
                    <p>EST. 2019</p>
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
};