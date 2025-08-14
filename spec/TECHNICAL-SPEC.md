# Technical Specification

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Motion/Animation**: Framer Motion for smooth, futuristic UI/UX
- **State Management**: React Context + Local Storage for themes
- **Client-Side Caching**: SWR for data fetching

### Backend Architecture
- **API Routes**: Next.js API routes
- **Database**: MongoDB
- **Authentication**: OAuth (Google, GitHub, LinkedIn)
- **File Storage**: Local for development, Vercel Blob Storage for production

## Database Schema

### Blog Posts Collection
```typescript
interface BlogPost {
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
```

### Projects Collection
```typescript
interface Project {
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
```

### Quiz Collection
```typescript
interface Quiz {
  _id: ObjectId;
  title: string;
  description: string;
  questions: {
    id: string;
    text: string;
    type: 'multiple-choice' | 'checkbox' | 'text';
    options?: string[];
    correctPath?: string[]; // Service recommendations
  }[];
  results: {
    path: string;
    title: string;
    description: string;
    recommendations: string[];
  }[];
}
```

### Signatures Collection
```typescript
interface Signature {
  _id: ObjectId;
  userId: string;
  name: string;
  message: string;
  provider: 'google' | 'github' | 'linkedin';
  profileUrl: string;
  avatarUrl: string;
  createdAt: Date;
}
```

## API Routes

### Blog API
- `GET /api/blog` - Get all blog posts (paginated)
- `GET /api/blog/[slug]` - Get single blog post
- `GET /api/blog/tags` - Get all tags

### Projects API
- `GET /api/projects` - Get all projects
- `GET /api/projects/[slug]` - Get single project
- `GET /api/projects/github` - Get GitHub projects

### Quiz API
- `GET /api/quiz` - Get quiz questions
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/results/[id]` - Get quiz results

### Signatures API
- `GET /api/signatures` - Get all signatures (paginated)
- `POST /api/signatures` - Add new signature
- `DELETE /api/signatures/[id]` - Remove signature (admin only)

## Authentication Flow

1. User clicks "Sign Signature Wall"
2. OAuth provider selection modal opens
3. User selects provider (Google/GitHub/LinkedIn)
4. OAuth flow redirects to provider
5. After successful auth, create/update user record
6. Allow signature submission

## Theme System Implementation

```typescript
type Theme = 'light' | 'dark' | 'pastel';

interface ThemeConfig {
  name: Theme;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    // ... other color variables
  };
  fonts: {
    heading: string;
    body: string;
  };
}
```

## SEO Implementation

### Meta Tags
```typescript
interface PageMeta {
  title: string;
  description: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
}
```

### Structured Data
- Blog posts: BlogPosting schema
- Portfolio: Person schema
- Projects: CreativeWork schema

## Performance Optimization

### Image Optimization
- Next.js Image component with:
  - Automatic WebP conversion
  - Responsive sizes
  - Lazy loading
  - Blur placeholder

### Code Optimization
- Dynamic imports for heavy components
- Route prefetching
- API response caching
- Static page generation where possible

## Monitoring & Analytics

### Performance Metrics
- Core Web Vitals
- Page load times
- API response times
- Error rates

### User Analytics
- Page views
- Time on site
- Popular content
- Quiz completion rates
- Signature wall engagement

## Security Measures

### API Security
- Rate limiting
- CORS configuration
- Input validation
- XSS prevention
- CSRF protection

### Data Security
- Environment variable encryption
- Secure OAuth implementation
- MongoDB connection security
- API route protection

## Deployment Strategy

### CI/CD Pipeline
1. Code push to main branch
2. Automated tests run
3. Build process
4. Vercel deployment
5. Post-deployment checks

### Environment Configuration
- Development
- Staging (optional)
- Production

## Testing Strategy

### Unit Tests
- Components
- Utility functions
- API routes

### Integration Tests
- User flows
- API endpoints
- Authentication

### E2E Tests
- Critical user journeys
- Form submissions
- OAuth flows 

## Motion/Animation Implementation

- **Library:** Framer Motion
- **Use Cases:**
  - Page transitions (fade, slide, scale)
  - Animated cards and project showcases
  - Interactive button and form feedback
  - Signature wall animations
  - Quiz progress and results animations
  - Subtle hover and tap effects for a futuristic feel
- **Integration:**
  - Use Framer Motion's `motion` components for animating UI elements
  - Combine with Tailwind for custom transitions and effects 

## API Integration
- GitHub API for project showcase
- OAuth providers
- Cal.com API for self-hosted booking integration

## Cal.com Integration

- **Purpose:** Allow users to book consultations directly from the site.
- **Type:** Self-hosted Cal.com instance
- **Integration:**
  - Embed Cal.com booking widget or use API for custom booking UI
  - Securely pass user info (if available) to pre-fill booking forms
  - Display booking confirmation and reminders
- **Security:**
  - Use environment variables for Cal.com API keys/URLs
  - Validate and sanitize all booking data

## n8n Template Sharing

- **Purpose:** Share custom n8n automation templates with visitors
- **Storage:**
  - Templates stored as JSON files in a dedicated directory or in MongoDB
  - Each template includes: name, description, tags, use case, and import link
- **Presentation:**
  - Dedicated page to browse/search templates
  - Preview template structure and use case
  - One-click import to n8n instance (via import link or file download)
- **Security:**
  - Validate template files before sharing
  - Optionally require login for template download 