import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        authenticated: false,
        user: null 
      })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: (session.user as any)?.id,
        name: session.user?.name,
        email: session.user?.email,
        image: session.user?.image,
      },
      provider: (session as any).account?.provider || 'unknown'
    })
  } catch (error) {
    console.error('Error getting session:', error)
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    )
  }
}