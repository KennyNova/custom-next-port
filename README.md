# Personal Portfolio & Blog by Navid Madani

A modern, interactive portfolio and blog website showcasing my professional work, personal projects, and hobbies. Built with Next.js and featuring interactive elements to help potential clients discover how we can work together.

## 🚀 Features

### For Visitors
- 📱 Responsive, modern design with multiple theme options (dark/light/pastel)
- 📝 Blog posts with markdown and image support for sharing insights and experiences
- 🛠️ Project showcase featuring:
  - Professional work
  - GitHub projects
  - Home lab setup
  - Gagguino project
  - other future projects
- 📅 Book a consultation directly via my self-hosted Cal.com
- 🧩 Explore and use my n8n automation templates
- 🤝 Interactive consultation quiz
- ✍️ Digital signature wall (OAuth with Google/GitHub/LinkedIn)
- 📬 Contact forms for business inquiries
- 🎯 SEO optimized for maximum visibility
- ✨ Futuristic, clean UI/UX with smooth motion and transitions (Framer Motion)

### Technical Features
- ⚡ Built with Next.js for optimal performance
- 🎨 Styled with Tailwind CSS and shadcn/ui
- 📊 MongoDB for data storage
- 🚀 Deployed on Vercel
- 📱 Mobile-first approach
- 🔒 OAuth integration for signature wall
- 🎯 **Peak UI/UX Standards:**
  - **SVG-only icons** - Never emojis, always professional Lucide React icons
  - **Skeleton loaders** - Every async content area has beautiful loading states
  - **Micro-interactions** - Subtle animations enhance user engagement
  - **Performance-first** - Optimized for Core Web Vitals and accessibility

## 🛠️ Tech Stack

- **Framework:** Next.js 14
- **Styling:** 
  - Tailwind CSS
  - shadcn/ui components
  - **Motion/Animation:**
    - Framer Motion for smooth, futuristic UI/UX
- **Database:** MongoDB
- **Authentication:** OAuth (Google, GitHub, LinkedIn)
- **Deployment:** Vercel
- **Content:** Markdown for blog posts
- **API Integration:**
  - GitHub API for project showcase
  - OAuth providers
  - Cal.com API for self-hosted booking integration

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication related pages
│   ├── blog/              # Blog related pages
│   ├── projects/          # Project showcase pages
│   ├── quiz/              # Consultation quiz
│   ├── signatures/        # Digital signature wall
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # shadcn components
│   ├── blog/             # Blog related components
│   ├── projects/         # Project related components
│   └── shared/           # Shared components
├── lib/                  # Utility functions
│   ├── db/              # Database utilities
│   ├── markdown/        # Markdown processing
│   └── oauth/           # OAuth utilities
├── types/               # TypeScript definitions
└── styles/              # Global styles
```

## 🔧 Development Setup

1. Clone the repository
```bash
git clone [repository-url]
cd [repository-name]
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Required environment variables:
- `MONGODB_URI`: MongoDB connection string
- `GITHUB_CLIENT_ID`: GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth client secret
- `GITHUB_TOKEN`: GitHub personal access token for fetching repositories
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `LINKEDIN_CLIENT_ID`: LinkedIn OAuth client ID
- `LINKEDIN_CLIENT_SECRET`: LinkedIn OAuth client secret
- `NEXTAUTH_URL`: NextAuth URL (e.g., http://localhost:3000)
- `NEXTAUTH_SECRET`: NextAuth secret key
- `CALCOM_API_KEY`: Cal.com API key
- `CALCOM_BASE_URL`: Cal.com base URL

4. Run the development server
```bash
npm run dev
```

## 📝 Content Management

### Blog Posts
Blog posts are written in Markdown format and stored in MongoDB. Each post includes:
- Title
- Content (Markdown)
- Publication date
- Tags
- Featured image
- Excerpt

### Projects
Project data is sourced from:
- **GitHub API**: Automatically fetches repositories using personal access token
  - Real-time repository data (stars, forks, languages, etc.)
  - README content with markdown rendering
  - Repository statistics and contribution metrics
  - Language usage breakdown with visual charts
- **MongoDB**: For non-GitHub projects (home lab, Gagguino, photography, etc.)

#### Individual Project Pages
Each project has a dedicated page with rich features:
- **Live Preview**: Interactive iframe with responsive device previews (desktop/tablet/mobile)
- **GitHub Integration**: README rendering, repository stats, language breakdowns
- **Image Gallery**: Screenshot carousel with thumbnail navigation
- **Interactive Elements**: Share functionality, like button, full-screen preview
- **Repository Statistics**: Stars, forks, commits, contributors, and more
- **Technology Visualization**: Animated language usage charts

### Quiz System
The consultation quiz system helps potential clients understand service offerings through interactive questions. Results are stored in MongoDB for follow-up.

## 🎨 Theme System

The website supports multiple themes:
- Light mode
- Dark mode
- Pastel mode
- [Other theme variations]

Theme preferences are stored in local storage and can be toggled via the theme switcher component.

## 🔍 SEO Implementation

- Dynamic meta tags for all pages
- Structured data for blog posts
- Optimized Open Graph tags
- Sitemap generation
- robots.txt configuration
- Performance optimization using Next.js features

## 📱 Responsive Design

The website is built with a mobile-first approach, ensuring optimal viewing experience across:
- Mobile devices
- Tablets
- Desktop computers
- Large screens

## 🚀 Deployment

The site is deployed on Vercel with:
- Automatic deployments from main branch
- Preview deployments for pull requests
- Environment variable management
- Analytics integration

## 📈 Analytics

[Describe your analytics setup - e.g., Google Analytics, Vercel Analytics]

## n8n Templates

This site features a section where you can browse, preview, and use my custom n8n automation templates for various workflows. Each template includes a description, use case, and import link.

---