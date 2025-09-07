import { NextRequest, NextResponse } from 'next/server';
import { uploadPhoto } from '@/lib/blob-storage';
import type { PhotoUploadResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Block photo uploads when admin is disabled
    if (process.env.ENABLE_ADMIN !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Photo upload is disabled' },
        { status: 403 }
      );
    }

    // Check for authentication if needed
    // const { userId } = auth();
    // if (!userId) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const alt = formData.get('alt') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const camera = formData.get('camera') as string;
    const lens = formData.get('lens') as string;
    
    // Optional EXIF settings
    const aperture = formData.get('aperture') as string;
    const shutterSpeed = formData.get('shutterSpeed') as string;
    const iso = formData.get('iso') as string;
    const focalLength = formData.get('focalLength') as string;
    
    // Optional location data
    const locationName = formData.get('locationName') as string;
    const lat = formData.get('lat') as string;
    const lng = formData.get('lng') as string;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' } as PhotoUploadResponse,
        { status: 400 }
      );
    }

    // Alt text can be empty - it will be auto-generated from filename in uploadPhoto function
    // if (!alt) {
    //   return NextResponse.json(
    //     { success: false, error: 'Alt text is required' } as PhotoUploadResponse,
    //     { status: 400 }
    //   );
    // }

    // Parse tags
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

    // Build settings object only if we have values
    const settings = {
      aperture: aperture || undefined,
      shutterSpeed: shutterSpeed || undefined,
      iso: iso ? parseInt(iso, 10) : undefined,
      focalLength: focalLength || undefined,
    };

    const hasSettings = settings.aperture || settings.shutterSpeed || settings.iso || settings.focalLength;

    // Build metadata object
    const metadata = {
      alt,
      description: description || undefined,
      tags: parsedTags,
      camera: camera || undefined,
      lens: lens || undefined,
      ...(hasSettings && { settings }),
      location: locationName || (lat && lng) ? {
        name: locationName || undefined,
        coordinates: lat && lng ? {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        } : undefined,
      } : undefined,
    };

    // Upload photo
    const photo = await uploadPhoto(file, metadata);

    return NextResponse.json({
      success: true,
      photo,
    } as PhotoUploadResponse);

  } catch (error) {
    console.error('Photo upload error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload photo';
    
    return NextResponse.json(
      { success: false, error: errorMessage } as PhotoUploadResponse,
      { status: 500 }
    );
  }
}

// GET endpoint to check upload status or get upload requirements
export async function GET() {
  return NextResponse.json({
    maxSize: '30MB',
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    requiredFields: ['file'],
    optionalFields: [
      'alt', 'description', 'tags', 'camera', 'lens', 
      'aperture', 'shutterSpeed', 'iso', 'focalLength',
      'locationName', 'lat', 'lng'
    ],
    note: 'Alt text will be auto-generated from filename if not provided'
  });
}
