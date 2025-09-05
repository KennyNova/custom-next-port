#!/usr/bin/env node

/**
 * Sync Mux Assets Script
 * 
 * This script fetches all assets from your Mux dashboard and shows which ones
 * are not yet assigned to projects in your database.
 * 
 * Usage: node scripts/sync-mux-assets.js
 */

const Mux = require('@mux/mux-node');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

async function syncMuxAssets() {
  let client;
  
  try {
    console.log('🎬 Syncing Mux assets...\n');
    
    // Check environment variables
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      throw new Error('Missing Mux environment variables. Please set MUX_TOKEN_ID and MUX_TOKEN_SECRET in .env.local');
    }
    
    if (!process.env.MONGODB_URI) {
      throw new Error('Missing MONGODB_URI environment variable');
    }

    // Get all assets from Mux
    console.log('📡 Fetching assets from Mux...');
    const assetsResponse = await mux.video.assets.list();
    const assets = assetsResponse.data;
    
    if (assets.length === 0) {
      console.log('📭 No assets found in your Mux account.');
      return;
    }
    
    console.log(`✅ Found ${assets.length} assets in Mux\n`);
    
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    const projectsCollection = db.collection('projects');
    
    console.log('✅ Connected to MongoDB\n');
    
    // Get all projects with videos
    const projectsWithVideos = await projectsCollection.find({
      videos: { $exists: true, $ne: [] }
    }).toArray();
    
    const assignedAssetIds = new Set();
    projectsWithVideos.forEach(project => {
      if (project.videos) {
        project.videos.forEach(video => {
          assignedAssetIds.add(video.muxAssetId);
        });
      }
    });
    
    console.log(`📊 Current status:`);
    console.log(`   • Total Mux assets: ${assets.length}`);
    console.log(`   • Already assigned: ${assignedAssetIds.size}`);
    console.log(`   • Unassigned: ${assets.length - assignedAssetIds.size}\n`);
    
    // Show unassigned assets
    const unassignedAssets = assets.filter(asset => !assignedAssetIds.has(asset.id));
    
    if (unassignedAssets.length === 0) {
      console.log('🎉 All assets are already assigned to projects!');
      return;
    }
    
    console.log('📋 Unassigned assets:\n');
    
    unassignedAssets.forEach((asset, index) => {
      const orientation = getOrientationFromAspectRatio(asset.aspect_ratio);
      const duration = asset.duration ? formatDuration(asset.duration) : 'Unknown';
      const status = asset.status;
      
      console.log(`${index + 1}. Asset ID: ${asset.id}`);
      console.log(`   Status: ${status}`);
      console.log(`   Duration: ${duration}`);
      console.log(`   Aspect Ratio: ${asset.aspect_ratio || 'Unknown'}`);
      console.log(`   Orientation: ${orientation || 'Unknown'}`);
      
      if (asset.playbook_ids && asset.playbook_ids.length > 0) {
        console.log(`   Playback ID: ${asset.playbook_ids[0].id}`);
      }
      
      console.log(`   To assign: node scripts/assign-video.js ${asset.id} PROJECT_SLUG ${orientation || 'horizontal'}\n`);
    });
    
    // Show available projects
    const allProjects = await projectsCollection.find({}, { 
      projection: { slug: 1, title: 1, type: 1 } 
    }).toArray();
    
    console.log('📁 Available projects to assign videos to:\n');
    allProjects.forEach(project => {
      console.log(`   • ${project.slug} - ${project.title} (${project.type})`);
    });
    
    console.log('\n💡 Next steps:');
    console.log('1. Upload videos to your Mux dashboard at https://dashboard.mux.com');
    console.log('2. Run this script again to see new assets');
    console.log('3. Use the assign-video script to link assets to projects');
    
  } catch (error) {
    console.error('❌ Error syncing Mux assets:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

function getOrientationFromAspectRatio(aspectRatio) {
  if (!aspectRatio) return undefined;
  
  const [width, height] = aspectRatio.split(':').map(Number);
  if (width && height) {
    return height > width ? 'vertical' : 'horizontal';
  }
  
  return undefined;
}

function formatDuration(seconds) {
  if (!seconds) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Run the script
syncMuxAssets();
