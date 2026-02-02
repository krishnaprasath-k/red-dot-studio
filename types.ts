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