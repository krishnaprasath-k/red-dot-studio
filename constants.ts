import { Project, Service } from './types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Velta Finance',
    category: 'Brand Identity & Web Platform',
    description: 'Complete rebrand and investor-facing web platform for a Series B fintech. Resulted in 40% more qualified leads within 90 days.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
    year: '2025'
  },
  {
    id: '2',
    title: 'Arkhaus Group',
    category: 'Web Design & Development',
    description: 'Award-winning portfolio site for a Copenhagen architecture firm. 4.2s avg. session duration, 2x industry benchmark.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
    year: '2025'
  },
  {
    id: '3',
    title: 'Maison Claret',
    category: 'E-Commerce & Brand Strategy',
    description: 'Luxury skincare DTC launch — from naming to Shopify build. €180K revenue in the first quarter post-launch.',
    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1200&auto=format&fit=crop',
    year: '2024'
  },
  {
    id: '4',
    title: 'Conduit SaaS',
    category: 'Product Design & UI/UX',
    description: 'End-to-end design system and dashboard for a logistics SaaS platform. Reduced user onboarding time by 60%.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
    year: '2024'
  }
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