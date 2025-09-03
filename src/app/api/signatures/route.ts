import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb'
import { auth } from '@clerk/nextjs/server'
import type { Signature } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const db = await getDatabase()
    const collection = db.collection<Signature>('signatures')
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit
    
    // Get signatures with pagination, sorted by newest first
    const signatures = await collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
    
    // Get total count for pagination info
    const total = await collection.countDocuments({})
    
    return NextResponse.json({
      signatures,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching signatures:', error)
    return NextResponse.json(
      { error: 'Failed to fetch signatures' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    
    console.log('POST /api/signatures - User ID:', clerkUserId)
    
    if (!clerkUserId) {
      console.log('POST /api/signatures - No user ID found, returning 401')
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
    
    // Validate provider - allow clerk as well
    if (!['google', 'github', 'linkedin', 'clerk'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be google, github, linkedin, or clerk' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const collection = db.collection<Omit<Signature, '_id'>>('signatures')
    
    // Check if user has already signed
    const existingSignature = await collection.findOne({ userId: clerkUserId })
    if (existingSignature) {
      return NextResponse.json(
        { error: 'User has already signed the wall. Use PUT method to update.' },
        { status: 409 }
      )
    }
    
    const newSignature = {
      userId: clerkUserId,
      name,
      message,
      provider: provider as Signature['provider'],
      profileUrl: profileUrl || '',
      avatarUrl: avatarUrl || '',
      useRandomIcon: useRandomIcon || false,
      createdAt: new Date()
    }
    
    const result = await collection.insertOne(newSignature)
    
    return NextResponse.json({ id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error('Error creating signature:', error)
    return NextResponse.json(
      { error: 'Failed to create signature' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Signature ID is required' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const collection = db.collection<Signature>('signatures')
    
    // Only allow users to delete their own signatures (or add admin check here)
    const result = await collection.deleteOne({ 
      _id: id as any,
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