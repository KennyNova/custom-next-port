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
export interface N8nTemplateNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
}

export interface N8nTemplateConnection {
  from: string;
  to: string;
  type: string;
  fromType: string;
  toType: string;
}

export interface N8nTemplateIndexItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  filePath: string;
  rawUrl: string;
  localPath: string;
  nodeCount: number;
  edgeCount: number;
  nodeTypes: string[];
  services: string[];
  hasAI: boolean;
  hasEmail: boolean;
  hasVectorStore: boolean;
  nodes: N8nTemplateNode[];
  connections: N8nTemplateConnection[];
}

export interface N8nTemplateIndexData {
  generatedAt: string;
  source: {
    repo: string;
    branch: string;
    treeApi: string;
  };
  stats: {
    totalTemplates: number;
    categories: number;
    services: number;
  };
  categories: string[];
  services: string[];
  templates: N8nTemplateIndexItem[];
}

export interface N8nWorkflowNode {
  id: string;
  name: string;
  type: string;
  typeVersion?: number | string;
  position?: [number, number];
  parameters?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface N8nWorkflowTemplate {
  name: string;
  nodes: N8nWorkflowNode[];
  connections?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  triggerCount?: number;
  [key: string]: unknown;
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
  replaces?: string; // what technologies/services this replaces
}

export interface HomelabHardwareSpec {
  cpu: string;
  memory: string;
  storage: string;
  motherboard: string;
  gpu?: string;
  cores?: string;
  baseClockPowerSpecStorage?: string;
}

export interface HomelabNode {
  id: string;
  name: string;
  type: 'hardware' | 'hypervisor' | 'vm' | 'service' | 'app';
  description: string;
  icon: string;
  color: string;
  position: { x: number; y: number };
  parentId?: string;
  children?: string[];
  url?: string;
  category?: string;
}

// Photo Types for Blob Storage
export interface Photo {
  _id: ObjectId;
  filename: string;
  originalName: string;
  blobUrl: string;
  thumbnailUrl?: string;
  alt: string;
  description?: string;
  tags: string[];
  metadata: {
    size: number; // bytes
    width: number;
    height: number;
    format: string; // jpg, png, etc.
    camera?: string;
    lens?: string;
    settings?: {
      aperture?: string;
      shutterSpeed?: string;
      iso?: number;
      focalLength?: string;
    };
    location?: {
      name?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
  };
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotoUploadResponse {
  success: boolean;
  photo?: Photo;
  error?: string;
}

export interface PhotosApiResponse {
  success: boolean;
  photos: Photo[];
  total: number;
  error?: string;
}