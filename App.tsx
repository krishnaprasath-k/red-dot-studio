import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { WorkGrid } from './components/WorkGrid';
import { Services } from './components/Services';
import { About } from './components/About';
import { Footer } from './components/Footer';
import { Cursor } from './components/Cursor';
import { Blog } from './components/Blog';
import { BlogPost } from './components/BlogPost';
import { BlogAdmin } from './components/BlogAdmin';
import { Analytics } from "@vercel/analytics/next"
/**
 * Simple path-based router using popstate.
 * Avoids hard dependency on react-router-dom at runtime so the site
 * works with both Vite dev AND the esm.sh import-map production build.
 */
function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return pathname;
}

const App: React.FC = () => {
  const pathname = usePathname();

  // Smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Scroll to top on route change
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  // ── Hidden admin route ──────────────────────────────
  if (pathname === '/rds-admin') {
    return (
      <div className="bg-black min-h-screen text-white selection:bg-red-dot selection:text-white">
        <BlogAdmin />
      </div>
    );
  }

  // ── Blog post detail ────────────────────────────────
  const blogMatch = pathname.match(/^\/blog\/(.+)$/);
  if (blogMatch) {
    return (
      <div className="bg-black min-h-screen text-white selection:bg-red-dot selection:text-white">
        <Cursor />
        <Header />
        <main>
          <BlogPost slug={blogMatch[1]} />
        </main>
        <Footer />
      </div>
    );
  }

  // ── Blog listing ────────────────────────────────────
  if (pathname === '/blog') {
    return (
      <div className="bg-black min-h-screen text-white selection:bg-red-dot selection:text-white">
        <Cursor />
        <Header />
        <main>
          <div className="pt-24" />
          <Blog />
        </main>
        <Footer />
      </div>
    );
  }

  // ── Home page (default) ─────────────────────────────
  return (
    <div className="bg-black min-h-screen text-white selection:bg-red-dot selection:text-white">
      <Cursor />
      <Header />
      <main>
        <Hero />
        <WorkGrid />
        <Services />
        <About />
        <Blog />
      </main>
      <Footer />
    </div>
  );
};

export default App;