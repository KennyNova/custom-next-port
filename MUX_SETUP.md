# Mux Video Integration Setup

This document explains how to set up and use Mux video streaming for your portfolio projects.

## Overview

The Mux integration allows you to:
- Upload videos directly to Mux dashboard
- Sync videos from Mux to your project database
- Display videos with professional streaming quality
- Support both vertical and horizontal video orientations
- Automatic thumbnail generation and aspect ratio detection

## Setup Instructions

### 1. Create Mux Account

1. Go to [Mux Dashboard](https://dashboard.mux.com) and create an account
2. Create a new environment (Development/Production)
3. Generate API Access Token:
   - Go to Settings → Access Tokens
   - Create new token with Full Access
   - Copy the Token ID and Token Secret

### 2. Environment Variables

Add these variables to your `.env.local` file:

```bash
# Mux Video Streaming
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
MUX_WEBHOOK_SECRET=your_mux_webhook_secret

# Site URL for CORS and webhooks
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Install Dependencies

Dependencies are already installed if you've run `npm install`:
- `@mux/mux-node` - Server-side Mux SDK
- `@mux/mux-player-react` - React video player component

## Usage Workflow

### Step 1: Upload Videos to Mux Dashboard

1. Log into your [Mux Dashboard](https://dashboard.mux.com)
2. Go to "Assets" section
3. Click "Upload Asset" 
4. Upload your video files (supports MP4, MOV, and other formats)
5. Wait for processing to complete (status will show "Ready")

### Step 2: Sync Assets to Your Database

Run the sync script to see available assets:

```bash
npm run sync-mux
```

This will:
- List all assets in your Mux account
- Show which ones are already assigned to projects
- Display unassigned assets with their details
- Show available projects for assignment

### Step 3: Assign Videos to Projects

Use the assign script to link a video to a specific project:

```bash
npm run assign-video ASSET_ID PROJECT_SLUG ORIENTATION
```

Example:
```bash
npm run assign-video abc123xyz my-cool-project vertical
```

Parameters:
- `ASSET_ID`: The Mux asset ID from the sync script
- `PROJECT_SLUG`: Your project's slug (shown in sync script)
- `ORIENTATION`: Either "vertical" or "horizontal"

### Step 4: View Videos

Videos will automatically appear on your project detail pages once assigned.

## Supported Video Features

### Orientations
- **Vertical** (`9:16` aspect ratio): Perfect for mobile/social media content
- **Horizontal** (`16:9` aspect ratio): Standard desktop/landscape videos

### Player Features
- Automatic quality adjustment based on connection
- Responsive design that adapts to screen size
- Custom controls with hover effects
- Thumbnail previews
- Muted autoplay support
- Loading states and error handling

### Video Information Display
- Duration formatting (MM:SS)
- Aspect ratio display
- Upload date
- Processing status indicators

## Project Types

Videos work best with these project types:
- **Videography**: Primary use case, supports orientation filtering
- **Other project types**: Can include videos as supplementary content

## File Structure

```
src/
├── lib/mux/
│   ├── client.ts          # Mux client configuration
│   └── services.ts        # Video service utilities
├── components/ui/
│   └── mux-video-player.tsx  # Video player component
├── types/index.ts         # Updated with Mux types
└── app/projects/[slug]/page.tsx  # Updated project detail page

scripts/
├── sync-mux-assets.js     # Sync assets from Mux dashboard
└── assign-video.js        # Assign videos to projects
```

## Database Schema

Videos are stored in your MongoDB projects collection:

```javascript
{
  // ... existing project fields
  videos: [
    {
      muxAssetId: "abc123xyz",
      muxPlaybackId: "def456uvw", 
      thumbnailUrl: "https://image.mux.com/...",
      duration: 120.5,
      status: "ready", // 'uploading' | 'preparing' | 'ready' | 'error'
      aspectRatio: "16:9",
      createdAt: "2024-01-01T00:00:00.000Z"
    }
  ],
  orientation: "vertical" // or "horizontal"
}
```

## Troubleshooting

### Common Issues

1. **"Missing Mux environment variables"**
   - Ensure all Mux variables are in `.env.local`
   - Restart your development server after adding variables

2. **"Asset not found in Mux"**
   - Verify the asset ID is correct
   - Check that the asset finished processing in Mux dashboard

3. **"Project with slug not found"**
   - Ensure the project exists in your database
   - Check the exact slug using the sync script

4. **Videos not displaying**
   - Check that video status is "ready"
   - Verify the playback ID is valid
   - Check browser console for errors

### Checking Logs

- Sync script shows detailed output for debugging
- Browser console logs video player errors
- Server logs show API errors

## Advanced Features

### Custom Thumbnails
Videos automatically generate thumbnails, but you can specify custom timestamps:

```javascript
MuxService.getThumbnailUrl(playbackId, { 
  time: 30,  // 30 seconds into video
  width: 640,
  height: 360 
})
```

### Video Analytics
Mux provides detailed analytics in the dashboard:
- View counts and engagement
- Quality metrics
- Geographic data
- Device/browser analytics

### Webhooks (Future)
You can set up webhooks to automatically update your database when:
- Videos finish processing
- Encoding fails
- Assets are deleted

## Next Steps

1. Upload your first video to Mux dashboard
2. Run `npm run sync-mux` to see it in the system
3. Assign it to a project with `npm run assign-video`
4. View it on your project page
5. Explore Mux dashboard for analytics and advanced features

For more advanced features, see the [Mux documentation](https://docs.mux.com/).
