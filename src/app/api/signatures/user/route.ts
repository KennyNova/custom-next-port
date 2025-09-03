import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb'
import { auth } from '@clerk/nextjs/server'
import type { Signature } from '@/types'

// Force dynamic rendering for this route since it uses auth headers
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      )
    }
    
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const db = await getDatabase()
    const collection = db.collection<Signature>('signatures')
    
    // Find existing signature for this user
    const signature = await collection.findOne({ userId: clerkUserId })
    
    if (signature) {
      return NextResponse.json({ signature })
    } else {
      return NextResponse.json({ signature: null })
    }
  } catch (error) {
    console.error('Error in /signatures/user:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch user signature',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
