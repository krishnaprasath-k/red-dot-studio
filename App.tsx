import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { WorkGrid } from './components/WorkGrid';
import { Services } from './components/Services';
import { About } from './components/About';
import { Footer } from './components/Footer';
import { Cursor } from './components/Cursor';

const App: React.FC = () => {
  // Smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="bg-black min-h-screen text-white selection:bg-red-dot selection:text-white">
      <Cursor />
      <Header />
      <main>
        <Hero />
        <WorkGrid />
        <Services />
        <About />
      </main>
      <Footer />
    </div>
  );
};

export default App;