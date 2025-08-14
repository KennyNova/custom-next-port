import { NextRequest } from 'next/server'
import { authOptions } from '@/lib/auth/config'
import NextAuth from 'next-auth'

// NextAuth.js automatically handles OAuth callbacks
// This route ensures the Google callback is properly processed
const handler = NextAuth(authOptions)

export async function GET(request: NextRequest) {
  return handler(request)
}

export async function POST(request: NextRequest) {
  return handler(request)
}