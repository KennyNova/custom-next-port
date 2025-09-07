# Photography Blob Storage Setup

This document explains how to set up and use the photography system with Vercel Blob storage.

## 🔧 Environment Setup

### 1. Vercel Blob Token

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project → Settings → Environment Variables
3. Create a new environment variable:
   - Name: `BLOB_READ_WRITE_TOKEN`
   - Value: Your Vercel Blob read/write token
   - Environments: ✅ Production, ✅ Preview, ✅ Development

### 2. Local Development

Add to your `.env.local` file:
```bash
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
```

## 📁 MongoDB Collections

The system uses a `photos` collection in MongoDB with the following schema:

```typescript
{
  _id: ObjectId,
  filename: string,
  originalName: string,
  blobUrl: string,
  thumbnailUrl?: string,
  alt: string,
  description?: string,
  tags: string[],
  metadata: {
    size: number,
    width: number,
    height: number,
    format: string,
    camera?: string,
    lens?: string,
    settings?: {
      aperture?: string,
      shutterSpeed?: string,
      iso?: number,
      focalLength?: string,
    },
    location?: {
      name?: string,
      coordinates?: { lat: number, lng: number }
    }
  },
  featured: boolean,
  order: number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Features

### Frontend Features
- **Photo Grid**: Responsive grid layout for photography display
- **Photo Modal**: Full-screen photo viewer with metadata
- **Project Integration**: Photography filter in projects page
- **Responsive Design**: Mobile-friendly layouts
- **Loading States**: Skeleton loaders and loading indicators

### Backend Features
- **Blob Storage**: Secure photo storage with Vercel Blob
- **Image Processing**: Automatic metadata extraction
- **Photo Management**: CRUD operations for photos
- **Tag System**: Flexible tagging for photo organization
- **EXIF Support**: Camera settings and technical metadata

### Admin Features
- **Photo Upload**: Drag-and-drop interface with preview
- **Metadata Management**: Rich metadata editing
- **Collection Overview**: Statistics and management tools
- **Bulk Operations**: Tag filtering and organization

## 🚀 API Endpoints

### Upload Photo
```typescript
POST /api/photos/upload
Content-Type: multipart/form-data

// Required fields
file: File
alt: string

// Optional fields
description?: string
tags?: string (comma-separated)
camera?: string
lens?: string
aperture?: string
shutterSpeed?: string
iso?: string
focalLength?: string
locationName?: string
lat?: string
lng?: string
```

### Get Photos
```typescript
GET /api/photos
Query Parameters:
- featured?: boolean
- tags?: string (comma-separated)
- limit?: number (max 100)
- skip?: number
- sort?: 'newest' | 'oldest' | 'order'
- action?: 'tags' (get unique tags)
```

### Update Photo
```typescript
PUT /api/photos
Body: {
  photoId: string,
  // Any Photo fields to update
}
```

### Delete Photo
```typescript
DELETE /api/photos?id={photoId}
```

## 🎨 Usage

### 1. Projects Page Integration

When users select "Photography" in the projects page, the system:
- Fetches photos from `/api/photos`
- Displays them in a responsive grid
- Opens a detailed modal when clicked
- Shows EXIF data, location, and tags

### 2. Admin Interface

Access the admin interface at `/admin/photos` to:
- Upload new photos with metadata
- View collection statistics
- Manage existing photos
- Filter by tags and featured status

### 3. Photo Management

```typescript
// Fetch photos
const response = await fetch('/api/photos?featured=true&limit=20')
const { photos, total } = await response.json()

// Upload photo
const formData = new FormData()
formData.append('file', file)
formData.append('alt', 'Photo description')
formData.append('tags', 'landscape,nature,mountains')

const response = await fetch('/api/photos/upload', {
  method: 'POST',
  body: formData
})
```

## 🔒 Security & Permissions

### Authentication
- Currently open endpoints (commented out auth checks)
- To enable auth, uncomment the auth checks in API routes
- Uses Clerk for authentication when enabled

### File Validation
- **File Types**: JPEG, PNG, WebP only
- **File Size**: 10MB maximum
- **Security**: Files stored in Vercel Blob with public access

### Best Practices
- Always provide meaningful alt text for accessibility
- Use descriptive tags for better organization
- Include camera metadata when available
- Optimize images before upload for better performance

## 🛠 Development

### Adding New Features

1. **Custom Metadata Fields**: Add to `Photo` interface in `types/index.ts`
2. **New API Endpoints**: Create in `app/api/photos/` directory
3. **UI Components**: Extend existing components in `components/ui/`
4. **Image Processing**: Enhance `lib/blob-storage.ts` utilities

### Testing

1. Test file uploads with various formats and sizes
2. Verify metadata extraction and storage
3. Check responsive layouts on different devices
4. Test error handling and edge cases

## 📝 Notes

- Photos are stored permanently in Vercel Blob until manually deleted
- Blob URLs are public and can be accessed directly
- Database entries are separate from blob storage
- Deleting a photo removes both blob file and database entry
- Order field determines display sequence (lower = first)
