import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/signatures',
  '/blog',
  '/blog/(.*)',
  '/projects',
  '/projects/(.*)',
  '/design-system',
  '/coming-soon',
  '/consultation',
  '/quiz',
  '/templates',
  '/privacy',
  '/terms',
  '/sign-in',
  '/sign-up',
  '/api/blog',
  '/api/blog/(.*)',
  '/api/projects',
  '/api/projects/(.*)',
  '/api/webhook/(.*)', // Webhook routes should be public
]);

export default clerkMiddleware((auth, request) => {
  // Don't protect the signatures API in middleware - let the API route handle it
  if (request.nextUrl.pathname.startsWith('/api/signatures')) {
    return;
  }
  
  // Only protect routes that are not public
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)', // Exclude static files and Next.js internals
    '/', // Include the root path
    '/(api|trpc)(.*)', // Include API and tRPC routes
  ],
};

