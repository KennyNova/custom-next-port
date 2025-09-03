import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb'
import { auth } from '@clerk/nextjs/server'
import type { Signature } from '@/types'
import { ObjectId } from 'mongodb'

// Force dynamic rendering for this route since it uses auth headers
export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { name, message, provider, profileUrl, avatarUrl, useRandomIcon } = body
    
    if (!name || !message || !provider) {
      return NextResponse.json(
        { error: 'Name, message, and provider are required' },
        { status: 400 }
      )
    }
    
    // Validate provider
    if (!['google', 'github', 'linkedin', 'clerk'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be google, github, linkedin, or clerk' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const collection = db.collection<Signature>('signatures')
    
    // Verify the signature belongs to the authenticated user
    const existingSignature = await collection.findOne({ 
      _id: new ObjectId(params.id),
      userId: clerkUserId 
    })
    
    if (!existingSignature) {
      return NextResponse.json(
        { error: 'Signature not found or unauthorized' },
        { status: 404 }
      )
    }
    
    const updateData = {
      name,
      message,
      provider: provider as Signature['provider'],
      profileUrl: profileUrl || '',
      avatarUrl: avatarUrl || '',
      useRandomIcon: useRandomIcon || false,
      updatedAt: new Date()
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(params.id), userId: clerkUserId },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Signature not found or unauthorized' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating signature:', error)
    return NextResponse.json(
      { error: 'Failed to update signature' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const db = await getDatabase()
    const collection = db.collection<Signature>('signatures')
    
    // Only allow users to delete their own signatures
    const result = await collection.deleteOne({ 
      _id: new ObjectId(params.id),
      userId: clerkUserId
    })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Signature not found or unauthorized' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting signature:', error)
    return NextResponse.json(
      { error: 'Failed to delete signature' },
      { status: 500 }
    )
  }
}
