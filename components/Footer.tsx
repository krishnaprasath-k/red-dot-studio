import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="py-24 border-t border-neutral-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
            <span className="text-red-dot font-mono text-sm mb-6">04 / CONTACT</span>
            
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-12 hover:text-gray-300 transition-colors cursor-pointer">
                Let's talk.
            </h2>

            <a 
                href="mailto:hello@reddot.studio" 
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-white rounded-full hover:bg-gray-200 hover:scale-105 transition-all mb-20"
            >
                hello@reddot.studio
            </a>

            <div className="w-full grid md:grid-cols-3 gap-8 text-sm text-gray-500 border-t border-neutral-800 pt-8">
                <div className="text-center md:text-left">
                    <p>© 2024 Red Dot Studio.</p>
                    <p>All rights reserved.</p>
                </div>
                
                <div className="flex justify-center gap-6">
                    <a href="#" className="hover:text-white transition-colors">Instagram</a>
                    <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                    <a href="#" className="hover:text-white transition-colors">Twitter</a>
                </div>

                <div className="text-center md:text-right">
                    <p>Brussels, BE</p>
                    <p>Av. Louise 231</p>
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
};