#!/usr/bin/env node

/**
 * Assign Video to Project Script
 * 
 * This script assigns a Mux asset to a specific project in your database.
 * 
 * Usage: node scripts/assign-video.js ASSET_ID PROJECT_SLUG ORIENTATION
 * Example: node scripts/assign-video.js abc123 my-cool-project vertical
 */

const Mux = require('@mux/mux-node');
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

async function assignVideoToProject(assetId, projectSlug, orientation) {
  let client;
  
  try {
    // Validate arguments
    if (!assetId || !projectSlug || !orientation) {
      console.error('❌ Usage: node scripts/assign-video.js ASSET_ID PROJECT_SLUG ORIENTATION');
      console.error('   Example: node scripts/assign-video.js abc123 my-cool-project vertical');
      process.exit(1);
    }
    
    if (!['vertical', 'horizontal'].includes(orientation)) {
      console.error('❌ Orientation must be either "vertical" or "horizontal"');
      process.exit(1);
    }
    
    console.log(`🎬 Assigning video to project...`);
    console.log(`   Asset ID: ${assetId}`);
    console.log(`   Project: ${projectSlug}`);
    console.log(`   Orientation: ${orientation}\n`);
    
    // Check environment variables
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      throw new Error('Missing Mux environment variables. Please set MUX_TOKEN_ID and MUX_TOKEN_SECRET in .env.local');
    }
    
    if (!process.env.MONGODB_URI) {
      throw new Error('Missing MONGODB_URI environment variable');
    }

    // Get asset details from Mux
    console.log('📡 Fetching asset details from Mux...');
    const asset = await mux.video.assets.retrieve(assetId);
    
    if (!asset) {
      throw new Error(`Asset ${assetId} not found in Mux`);
    }
    
    if (asset.status !== 'ready') {
      console.warn(`⚠️  Asset status is "${asset.status}" - it may not be ready for playback yet.`);
    }
    
    if (!asset.playback_ids || asset.playback_ids.length === 0) {
      throw new Error(`Asset ${assetId} has no playback IDs`);
    }
    
    const playbackId = asset.playback_ids[0].id;
    console.log(`✅ Asset found - Status: ${asset.status}, Playback ID: ${playbackId}\n`);
    
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    const projectsCollection = db.collection('projects');
    
    // Find the project
    const project = await projectsCollection.findOne({ slug: projectSlug });
    
    if (!project) {
      throw new Error(`Project with slug "${projectSlug}" not found`);
    }
    
    console.log(`✅ Found project: ${project.title}\n`);
    
    // Check if asset is already assigned to this project
    if (project.videos) {
      const existingVideo = project.videos.find(video => video.muxAssetId === assetId);
      if (existingVideo) {
        console.log('⚠️  This asset is already assigned to this project!');
        console.log(`   Current status: ${existingVideo.status}`);
        process.exit(0);
      }
    }
    
    // Check if asset is assigned to another project
    const otherProject = await projectsCollection.findOne({
      'videos.muxAssetId': assetId
    });
    
    if (otherProject) {
      console.log(`⚠️  Asset is already assigned to project: ${otherProject.title} (${otherProject.slug})`);
      console.log('   Do you want to continue anyway? (y/N)');
      
      // In a real implementation, you might want to add readline for user input
      // For now, we'll just warn and continue
      console.log('   Continuing anyway...\n');
    }
    
    // Create video object
    const videoData = {
      muxAssetId: assetId,
      muxPlaybackId: playbackId,
      thumbnailUrl: `https://image.mux.com/${playbackId}/thumbnail.jpg?time=1`,
      duration: asset.duration,
      status: asset.status,
      aspectRatio: asset.aspect_ratio,
      createdAt: new Date()
    };
    
    // Update project with video
    console.log('💾 Adding video to project...');
    const result = await projectsCollection.updateOne(
      { _id: project._id },
      {
        $push: { videos: videoData },
        $set: { 
          updatedAt: new Date(),
          // Update orientation if this is a videography project
          ...(project.type === 'videography' && { orientation })
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      throw new Error('Failed to update project');
    }
    
    console.log('✅ Video successfully assigned to project!\n');
    
    // Show summary
    console.log('📋 Summary:');
    console.log(`   Project: ${project.title}`);
    console.log(`   Asset ID: ${assetId}`);
    console.log(`   Playback ID: ${playbackId}`);
    console.log(`   Duration: ${formatDuration(asset.duration)}`);
    console.log(`   Aspect Ratio: ${asset.aspect_ratio || 'Unknown'}`);
    console.log(`   Orientation: ${orientation}`);
    console.log(`   Thumbnail: ${videoData.thumbnailUrl}`);
    console.log(`   Video URL: https://stream.mux.com/${playbackId}.m3u8`);
    
    console.log('\n🎉 Done! You can now view this video on your project page.');
    
  } catch (error) {
    console.error('❌ Error assigning video:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

function formatDuration(seconds) {
  if (!seconds) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Get command line arguments
const [assetId, projectSlug, orientation] = process.argv.slice(2);

// Run the script
assignVideoToProject(assetId, projectSlug, orientation);
