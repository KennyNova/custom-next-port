import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isClerkConfigured } from '@/lib/clerk-config'

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
  '/podcast-pricing',
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
  '/api/photos',
  '/api/photos/(.*)',
  '/api/tabreeze-feedback',
  '/api/webhook/(.*)',
])

function passthroughMiddleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (process.env.ENABLE_ADMIN !== 'true') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

const clerkHandler = clerkMiddleware(async (auth, request) => {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (process.env.ENABLE_ADMIN !== 'true') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (request.nextUrl.pathname.startsWith('/api/signatures')) {
    return
  }

  if (!isPublicRoute(request)) {
    const { userId } = await auth()
    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
    }
  }
})

export default isClerkConfigured() ? clerkHandler : passthroughMiddleware

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
}
