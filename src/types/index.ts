import { ObjectId } from 'mongodb';

// Blog Types
export interface BlogPost {
  _id: ObjectId;
  title: string;
  slug: string;
  content: string; // Markdown
  excerpt: string;
  featuredImage: string; // URL
  tags: string[];
  publishedAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  readingTime: number; // minutes
  metadata: {
    views: number;
    likes: number;
  };
}

// Project Types
export interface Project {
  _id: ObjectId;
  title: string;
  slug: string;
  description: string;
  type: 'github' | 'homelab' | 'photography' | 'other';
  images: string[]; // URLs
  technologies: string[];
  links: {
    github?: string;
    live?: string;
    demo?: string;
  };
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Quiz Types
export interface Quiz {
  _id: ObjectId;
  title: string;
  description: string;
  questions: QuizQuestion[];
  results: QuizResult[];
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'checkbox' | 'text';
  options?: string[];
  correctPath?: string[]; // Service recommendations
}

export interface QuizResult {
  path: string;
  title: string;
  description: string;
  recommendations: string[];
}

// Signature Types
export interface Signature {
  _id: ObjectId;
  userId: string;
  name: string;
  message: string;
  provider: 'google' | 'github' | 'linkedin' | 'clerk';
  profileUrl: string;
  avatarUrl: string;
  useRandomIcon?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'pastel' | 'system';

export interface ThemeConfig {
  name: Theme;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

// SEO Types
export interface PageMeta {
  title: string;
  description: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
}

// n8n Template Types
export interface N8nTemplate {
  _id: ObjectId;
  name: string;
  description: string;
  tags: string[];
  useCase: string;
  templateData: object; // JSON template
  downloadUrl: string;
  createdAt: Date;
  updatedAt: Date;
}