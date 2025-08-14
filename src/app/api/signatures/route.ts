import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb'
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
    const body = await request.json()
    const { userId, name, message, provider, profileUrl, avatarUrl } = body
    
    if (!userId || !name || !message || !provider) {
      return NextResponse.json(
        { error: 'UserId, name, message, and provider are required' },
        { status: 400 }
      )
    }
    
    // Validate provider
    if (!['google', 'github', 'linkedin'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be google, github, or linkedin' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const collection = db.collection<Omit<Signature, '_id'>>('signatures')
    
    // Check if user has already signed
    const existingSignature = await collection.findOne({ userId })
    if (existingSignature) {
      return NextResponse.json(
        { error: 'User has already signed the wall' },
        { status: 409 }
      )
    }
    
    const newSignature = {
      userId,
      name,
      message,
      provider: provider as Signature['provider'],
      profileUrl: profileUrl || '',
      avatarUrl: avatarUrl || '',
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
    
    const result = await collection.deleteOne({ _id: id as any })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Signature not found' },
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