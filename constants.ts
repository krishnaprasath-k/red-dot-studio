import { Project, Service } from './types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Neon Horizon',
    category: 'Digital Branding',
    description: 'A complete identity overhaul for a fintech startup focusing on speed and transparency.',
    imageUrl: 'https://picsum.photos/800/600?random=1',
    year: '2024'
  },
  {
    id: '2',
    title: 'Aero Structure',
    category: 'Web Development',
    description: 'High-performance architectural portfolio with WebGL interactions.',
    imageUrl: 'https://picsum.photos/800/800?random=2',
    year: '2023'
  },
  {
    id: '3',
    title: 'Mono Type',
    category: 'Typography',
    description: 'Custom bespoke typeface design for a luxury fashion house.',
    imageUrl: 'https://picsum.photos/800/500?random=3',
    year: '2024'
  },
  {
    id: '4',
    title: 'Carbon Labs',
    category: 'Product Design',
    description: 'SaaS dashboard UI/UX for climate data analysis.',
    imageUrl: 'https://picsum.photos/800/700?random=4',
    year: '2023'
  }
];

export const SERVICES: Service[] = [
  {
    id: 's1',
    number: '01',
    title: 'Brand Strategy',
    description: 'We distill your essence into a visual language that speaks louder than words.',
    tags: ['Identity', 'Positioning', 'Voice']
  },
  {
    id: 's2',
    number: '02',
    title: 'Digital Experience',
    description: 'Websites and applications built on performance, accessibility, and motion.',
    tags: ['Web Design', 'Development', 'WebGL']
  },
  {
    id: 's3',
    number: '03',
    title: 'Product Design',
    description: 'Functional, beautiful interfaces for complex systems.',
    tags: ['UI/UX', 'Prototyping', 'Design Systems']
  }
];