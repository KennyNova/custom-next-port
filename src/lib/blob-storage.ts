import { put, del, list, head } from '@vercel/blob';
import { getDatabase } from '@/lib/db/mongodb';
import type { Photo } from '@/types';
import { ObjectId } from 'mongodb';

// Blob storage configuration
const BLOB_FOLDER = 'gallery';
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Upload photo to Vercel Blob and save metadata to MongoDB
export async function uploadPhoto(
  file: File,
  metadata: {
    alt: string;
    description?: string;
    tags: string[];
    camera?: string;
    lens?: string;
    settings?: {
      aperture?: string;
      shutterSpeed?: string;
      iso?: number;
      focalLength?: string;
    };
    location?: {
      name?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
  }
): Promise<Photo> {
  // Validate file
  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`File type ${file.type} not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filename = `${timestamp}-${randomSuffix}.${fileExtension}`;
  const blobPath = `${BLOB_FOLDER}/${filename}`;

  try {
    // Upload to Vercel Blob
    const blob = await put(blobPath, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Parse filename for automatic metadata extraction
    const parsedFilename = parseFilename(file.name);
    
    // Get image dimensions (basic implementation)
    const imageMetadata = await getImageMetadata(file);

    // Merge parsed filename data with provided metadata
    const mergedTags = [
      ...parsedFilename.tags,
      ...metadata.tags,
    ].filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates

    // Use parsed title if no alt text provided, otherwise use provided alt text
    const finalAlt = metadata.alt || parsedFilename.title || file.name;
    
    // Use parsed date for createdAt if available, otherwise use current date
    const photoDate = parsedFilename.parsedDate || new Date();

    // Create photo document
    const photoDoc: Omit<Photo, '_id'> = {
      filename,
      originalName: file.name,
      blobUrl: blob.url,
      alt: finalAlt,
      description: metadata.description || (parsedFilename.title !== finalAlt ? parsedFilename.title : undefined),
      tags: mergedTags,
      metadata: {
        size: file.size,
        width: imageMetadata.width,
        height: imageMetadata.height,
        format: fileExtension,
        camera: metadata.camera,
        lens: metadata.lens,
        settings: metadata.settings,
        location: metadata.location,
      },
      featured: false,
      order: photoDate.getTime(), // Use photo date for ordering
      createdAt: photoDate,
      updatedAt: new Date(),
    };

    // Save to MongoDB
    const db = await getDatabase();
    const result = await db.collection('photos').insertOne(photoDoc);

    return {
      _id: result.insertedId,
      ...photoDoc,
    } as Photo;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw new Error('Failed to upload photo');
  }
}

// Delete photo from blob storage and database
export async function deletePhoto(photoId: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    const photo = await db.collection('photos').findOne({ _id: new ObjectId(photoId) });

    if (!photo) {
      throw new Error('Photo not found');
    }

    // Delete from Vercel Blob
    const blobPath = `${BLOB_FOLDER}/${photo.filename}`;
    await del(blobPath);

    // Delete from MongoDB
    await db.collection('photos').deleteOne({ _id: new ObjectId(photoId) });

    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
}

// Get all photos from database
export async function getPhotos(
  options: {
    featured?: boolean;
    tags?: string[];
    limit?: number;
    skip?: number;
    sort?: 'newest' | 'oldest' | 'order';
  } = {}
): Promise<{ photos: Photo[]; total: number }> {
  try {
    const db = await getDatabase();
    const collection = db.collection('photos');

    // Build query
    const query: any = {};
    if (options.featured !== undefined) {
      query.featured = options.featured;
    }
    if (options.tags && options.tags.length > 0) {
      query.tags = { $in: options.tags };
    }

    // Build sort
    let sort: any = {};
    switch (options.sort) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'order':
        sort = { order: 1, createdAt: -1 };
        break;
      default:
        sort = { order: 1, createdAt: -1 };
    }

    // Get total count
    const total = await collection.countDocuments(query);

    // Get photos with pagination
    const photos = await collection
      .find(query)
      .sort(sort)
      .skip(options.skip || 0)
      .limit(options.limit || 50)
      .toArray();

    return {
      photos: photos as Photo[],
      total,
    };
  } catch (error) {
    console.error('Error fetching photos:', error);
    throw new Error('Failed to fetch photos');
  }
}

// Update photo metadata
export async function updatePhoto(
  photoId: string,
  updates: Partial<Omit<Photo, '_id' | 'filename' | 'blobUrl' | 'createdAt'>>
): Promise<Photo | null> {
  try {
    const db = await getDatabase();
    const result = await db.collection('photos').findOneAndUpdate(
      { _id: new ObjectId(photoId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    return result as Photo | null;
  } catch (error) {
    console.error('Error updating photo:', error);
    throw new Error('Failed to update photo');
  }
}

// Get unique tags from all photos
export async function getPhotoTags(): Promise<string[]> {
  try {
    const db = await getDatabase();
    const tags = await db.collection('photos').distinct('tags');
    return tags.sort();
  } catch (error) {
    console.error('Error fetching photo tags:', error);
    return [];
  }
}

// Parse filename to extract tags, title, and date
function parseFilename(filename: string): {
  tags: string[];
  title: string;
  dateString: string;
  parsedDate?: Date;
} {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Split by dashes to get parts
  const parts = nameWithoutExt.split('-');
  
  if (parts.length < 2) {
    // Fallback if filename doesn't match expected pattern
    return {
      tags: [],
      title: nameWithoutExt.replace(/[_-]/g, ' '),
      dateString: '',
    };
  }

  // Extract date (last part, should be MMDDYYYY format)
  const dateString = parts[parts.length - 1];
  let parsedDate: Date | undefined;
  
  // Try to parse date in MMDDYYYY format
  if (dateString.length === 8 && /^\d{8}$/.test(dateString)) {
    const month = parseInt(dateString.substring(0, 2), 10);
    const day = parseInt(dateString.substring(2, 4), 10);
    const year = parseInt(dateString.substring(4, 8), 10);
    
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900) {
      parsedDate = new Date(year, month - 1, day); // month is 0-based in Date constructor
    }
  }

  // Extract title (second to last part, or combine if multiple parts)
  const titleParts = parts.slice(1, -1);
  const title = titleParts.join(' ').replace(/_/g, ' ');

  // Extract tags (first part, split by underscores)
  const tagsPart = parts[0];
  const tags = tagsPart.split('_').map(tag => tag.trim()).filter(Boolean);

  return {
    tags,
    title,
    dateString,
    parsedDate,
  };
}

// Helper function to get basic image metadata
// Note: This runs on the server side, so we can't use browser APIs like Image()
// For now, we'll return default dimensions and let the frontend handle image analysis if needed
async function getImageMetadata(file: File): Promise<{ width: number; height: number }> {
  // In a server environment, we can't use the Image constructor
  // For proper image analysis, we'd need a server-side image processing library
  // like 'sharp' or 'jimp', but for now we'll use sensible defaults
  
  // Could add proper image processing here later:
  // const sharp = require('sharp');
  // const buffer = Buffer.from(await file.arrayBuffer());
  // const metadata = await sharp(buffer).metadata();
  // return { width: metadata.width || 1200, height: metadata.height || 800 };
  
  return Promise.resolve({
    width: 1200,
    height: 800,
  });
}

// List all blobs in gallery folder (for admin/cleanup)
export async function listPhotoBlobs(): Promise<string[]> {
  try {
    const { blobs } = await list({ prefix: `${BLOB_FOLDER}/` });
    return blobs.map(blob => blob.pathname);
  } catch (error) {
    console.error('Error listing blobs:', error);
    return [];
  }
}
