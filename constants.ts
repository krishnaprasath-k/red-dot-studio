import { Project, Service } from './types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'LinkMate',
    category: 'Full-Stack Web Application',
    description: 'Built a modern portfolio builder with customizable sections, drag-and-drop link management, and real-time analytics tracking link, social, and project engagement. Boosted performance by 40% through efficient caching and optimized data flows.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
    year: '2025'
  },
  {
    id: '2',
    title: 'AI-View',
    category: 'AI-Powered Web Application',
    description: 'Engineered a smart interview simulation platform using Gemini AI to generate tailored questions based on role and company. Built post-interview analytics to score responses and deliver personalized improvement feedback.',
    imageUrl: 'https://cdn.analyticsvidhya.com/wp-content/uploads/2024/09/AI-interview-questions-scaled.webp',
    year: '2025'
  },
  {
    id: '3',
    title: 'OpenWork',
    category: 'E-Commerce & Brand Strategy',
    description: 'We are building OpenWork, a decentralized work protocol redefining the way people collaborate on the internet. Free from central authority, OpenWork introduces a new paradigm of work engagement and management.',
    imageUrl: 'https://app.openwork.technology/about-logo.svg',
    year: '2024'
  },
  // {
  //   id: '4',
  //   title: 'Conduit SaaS',
  //   category: 'Product Design & UI/UX',
  //   description: 'End-to-end design system and dashboard for a logistics SaaS platform. Reduced user onboarding time by 60%.',
  //   imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
  //   year: '2024'
  // }
];

export const SERVICES: Service[] = [
  {
    id: 's1',
    number: '01',
    title: 'Brand Strategy & Identity',
    description: 'We define your market position, craft your visual identity, and build brand systems that scale — from seed-stage startups to established enterprises pivoting into new markets.',
    tags: ['Brand Audit', 'Positioning', 'Visual Identity', 'Brand Guidelines']
  },
  {
    id: 's2',
    number: '02',
    title: 'Web Design & Development',
    description: 'High-converting marketing sites, web applications, and e-commerce platforms. We ship production-ready code — not just mockups. Every pixel is built to perform.',
    tags: ['Marketing Sites', 'E-Commerce', 'React / Next.js', 'CMS Integration']
  },
  {
    id: 's3',
    number: '03',
    title: 'Product & UX Design',
    description: 'From user research to design systems, we create interfaces that reduce friction and drive adoption. Built for teams that measure design by business outcomes.',
    tags: ['UI/UX Audit', 'Design Systems', 'Prototyping', 'User Research']
  },
  {
    id: 's4',
    number: '04',
    title: 'Growth & Conversion',
    description: 'Landing pages, A/B tested funnels, and performance-optimized storefronts. We treat every click as an opportunity and every page load as a first impression.',
    tags: ['Landing Pages', 'CRO', 'A/B Testing', 'Analytics']
  }
];