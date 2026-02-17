import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="py-8 border-t border-neutral-800">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="w-full grid md:grid-cols-3 gap-8 text-sm text-gray-500">
                    <div className="text-center md:text-left">
                        <p>© 2026 Red Dot Studio.</p>
                        <p>All rights reserved.</p>
                    </div>

                    <div className="flex justify-center gap-6">
                        {/* <a href="https://linkedin.com/in/reddot-technology-27b2793b1" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a> */}
                        <a href="https://www.linkedin.com/company/reddotstudio" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
                        {/* <a href="https://twitter.com/reddotstudio" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a> */}
                    </div>

                    <div className="text-center md:text-right">
                        <p>Bangalore, India</p>
                        {/* <p>EST. 2019</p> */}
                    </div>
                </div>
            </div>
        </footer>
    );
};