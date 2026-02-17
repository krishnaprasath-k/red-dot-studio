export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  year: string;
}

export interface Service {
  id: string;
  number: string;
  title: string;
  description: string;
  tags: string[];
}

export enum ViewMode {
  GRID = 'GRID',
  LIST = 'LIST'
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  tags: string[];
  published: boolean;
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
}