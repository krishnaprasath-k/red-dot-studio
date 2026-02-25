import React from 'react';
import { motion } from 'framer-motion';
import { PROJECTS } from '../constants';
// import { ArrowUpRight, Github, ExternalLink } from 'lucide-react';

// interface PortfolioProject {
//   id: number;
//   title: string;
//   category: string;
//   description: string;
//   image_url: string;
//   github_url: string;
//   live_url: string;
//   year: string;
//   tags: string[];
//   sort_order: number;
//   visible: boolean;
// }

// const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

export const WorkGrid: React.FC = () => {
  // const [dbProjects, setDbProjects] = useState<PortfolioProject[] | null>(null);

  // useEffect(() => {
  //   fetch(`${API_BASE}/api/projects`)
  //     .then(r => r.ok ? r.json() : [])
  //     .then(data => {
  //       if (Array.isArray(data) && data.length > 0) {
  //         setDbProjects(data);
  //       }
  //     })
  //     .catch((err) => {
  //       console.error('[WorkGrid] Failed to fetch projects:', err);
  //     });
  // }, []);

  // Always use hardcoded constants (backend disabled)
  // const projects = dbProjects
  //   ? dbProjects
  //       .filter(p => p.visible !== false)
  //       .map(p => ({
  //         id: String(p.id),
  //         title: p.title,
  //         category: p.category,
  //         description: p.description,
  //         imageUrl: p.image_url,
  //         year: p.year,
  //         github_url: p.github_url,
  //         live_url: p.live_url,
  //       }))
  //   : PROJECTS.map(p => ({ ...p, github_url: '', live_url: '' }));
  const projects = PROJECTS.map(p => ({ ...p, github_url: '', live_url: '' }));

  return (
    <section id="work" className="py-24 border-t border-gray-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <span className="text-red-dot font-mono text-sm mb-2 block">01 / SELECTED WORK</span>
            <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight">Results, not just visuals</h2>
          </div>
          <p className="text-gray-500 max-w-sm text-sm md:text-base">
            Every project ships with measurable impact. Here's what that looks like.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-8 gap-y-16">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => {
                if (project.live_url) window.open(project.live_url, '_blank');
                else if (project.github_url) window.open(project.github_url, '_blank');
              }}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm mb-6 bg-gray-100">
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

                {/* Arrow / Links */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-gray-100/80 backdrop-blur-sm text-gray-900 p-2.5 rounded-sm hover:bg-gray-200 transition-colors"
                      >
                        <Github size={16} />
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-red-dot text-white p-2.5 rounded-sm hover:bg-red-600 transition-colors"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    {/* {!project.live_url && !project.github_url && (
                      <div className="bg-red-dot text-white p-3 rounded-sm">
                        <ArrowUpRight size={18} />
                      </div>
                    )} */}
                </div>
              </div>

              <div className="flex justify-between items-start border-t border-gray-200 pt-4 group-hover:border-red-dot transition-colors duration-300">
                <div>
                  <h3 className="text-xl font-display font-normal mb-1 text-gray-900">{project.title}</h3>
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