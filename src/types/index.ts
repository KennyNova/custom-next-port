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
  type: 'github' | 'homelab' | 'photography' | 'videography' | 'other';
  images: string[]; // URLs for thumbnails/photos
  
  // Mux video fields
  videos?: {
    muxAssetId: string;
    muxPlaybackId: string;
    thumbnailUrl?: string;
    duration?: number;
    status: 'uploading' | 'preparing' | 'ready' | 'error';
    aspectRatio?: string; // e.g., "16:9", "9:16"
    createdAt: Date;
  }[];
  
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
  orientation?: 'vertical' | 'horizontal';
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
export type Theme = 'light' | 'dark' | 'pastel' | 'coffee' | 'developer' | 'system';

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

// Mux Types
export interface MuxAsset {
  id: string;
  status: 'preparing' | 'ready' | 'error';
  playback_ids: Array<{
    id: string;
    policy: 'public' | 'signed';
  }>;
  duration?: number;
  aspect_ratio?: string;
  tracks: Array<{
    type: 'video' | 'audio';
    max_width?: number;
    max_height?: number;
  }>;
}

export interface MuxUpload {
  id: string;
  url: string;
  status: 'waiting' | 'asset_created' | 'error' | 'cancelled';
  new_asset_settings: {
    playback_policy: 'public' | 'signed';
  };
}

// Homelab Types
export interface HomelabTechnologyLink {
  label: string;
  url: string;
}

export type HomelabTechnologyKind = 'hypervisor' | 'os' | 'cpu' | 'container' | 'driver' | 'distro' | 'service' | 'other';

export interface HomelabTechnology {
  slug: string;
  name: string;
  kind: HomelabTechnologyKind;
  shortDescription: string;
  whatItIs: string;
  whyChosen: string;
  howItFits: string;
  keyDetails?: string[];
  links?: HomelabTechnologyLink[];
  iconKey: string; // maps to a UI icon
  brandColor?: string; // hex color for accent
}

export interface HomelabHardwareSpec {
  cpu: string;
  memory: string;
  storage: string;
  motherboard: string;
  gpu?: string;
}