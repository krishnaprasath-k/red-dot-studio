import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { WorkGrid } from './components/WorkGrid';
import { Services } from './components/Services';
import { About } from './components/About';
import { Footer } from './components/Footer';
import { GetInTouch } from './components/GetInTouch';
import { Cursor } from './components/Cursor';

const App: React.FC = () => {

  return (
    <div className="bg-black min-h-screen text-white selection:bg-red-dot selection:text-white">
      <Cursor />
      <Header />
      <main>
        <Hero />
        <WorkGrid />
        <Services />
        <About />
        <GetInTouch />
      </main>
      <Footer />
    </div>
  );
};

export default App;