import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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
  '/admin/photos', // Admin photo management
  '/api/blog',
  '/api/blog/(.*)',
  '/api/projects',
  '/api/projects/(.*)',
  '/api/photos',
  '/api/photos/(.*)',
  '/api/webhook/(.*)', // Webhook routes should be public
]);

export default clerkMiddleware(async (auth, request) => {
  // Don't protect the signatures API in middleware - let the API route handle it
  if (request.nextUrl.pathname.startsWith('/api/signatures')) {
    return;
  }
  
  // Only protect routes that are not public
  if (!isPublicRoute(request)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect_url', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)', // Exclude static files and Next.js internals
    '/', // Include the root path
    '/(api|trpc)(.*)', // Include API and tRPC routes
  ],
};

