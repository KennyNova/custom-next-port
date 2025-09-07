import { NextRequest, NextResponse } from 'next/server';
import { getPhotos, deletePhoto, updatePhoto, getPhotoTags } from '@/lib/blob-storage';
import type { PhotosApiResponse } from '@/types';
import { ObjectId } from 'mongodb';

// GET - Fetch photos with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const featured = searchParams.get('featured');
    const tags = searchParams.get('tags');
    const limit = searchParams.get('limit');
    const skip = searchParams.get('skip');
    const sort = searchParams.get('sort') as 'newest' | 'oldest' | 'order' | null;
    const action = searchParams.get('action'); // For getting tags

    // Handle special actions
    if (action === 'tags') {
      const allTags = await getPhotoTags();
      return NextResponse.json({
        success: true,
        tags: allTags,
      });
    }

    // Build options for getPhotos
    const options: Parameters<typeof getPhotos>[0] = {};
    
    if (featured !== null) {
      options.featured = featured === 'true';
    }
    
    if (tags) {
      options.tags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0 && limitNum <= 100) {
        options.limit = limitNum;
      }
    }
    
    if (skip) {
      const skipNum = parseInt(skip, 10);
      if (!isNaN(skipNum) && skipNum >= 0) {
        options.skip = skipNum;
      }
    }
    
    if (sort && ['newest', 'oldest', 'order'].includes(sort)) {
      options.sort = sort;
    }

    // Fetch photos
    const result = await getPhotos(options);

    return NextResponse.json({
      success: true,
      photos: result.photos,
      total: result.total,
    } as PhotosApiResponse);

  } catch (error) {
    console.error('Error fetching photos:', error);
    
    return NextResponse.json(
      {
        success: false,
        photos: [],
        total: 0,
        error: error instanceof Error ? error.message : 'Failed to fetch photos',
      } as PhotosApiResponse,
      { status: 500 }
    );
  }
}

// PUT - Update photo metadata
export async function PUT(request: NextRequest) {
  try {
    // Check for authentication if needed
    // const { userId } = auth();
    // if (!userId) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const body = await request.json();
    const { photoId, ...updates } = body;

    if (!photoId) {
      return NextResponse.json(
        { success: false, error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!ObjectId.isValid(photoId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid photo ID' },
        { status: 400 }
      );
    }

    // Update photo
    const updatedPhoto = await updatePhoto(photoId, updates);

    if (!updatedPhoto) {
      return NextResponse.json(
        { success: false, error: 'Photo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      photo: updatedPhoto,
    });

  } catch (error) {
    console.error('Error updating photo:', error);
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update photo' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a photo
export async function DELETE(request: NextRequest) {
  try {
    // Check for authentication if needed
    // const { userId } = auth();
    // if (!userId) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('id');

    if (!photoId) {
      return NextResponse.json(
        { success: false, error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!ObjectId.isValid(photoId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid photo ID' },
        { status: 400 }
      );
    }

    // Delete photo
    const success = await deletePhoto(photoId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete photo or photo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting photo:', error);
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete photo' },
      { status: 500 }
    );
  }
}
