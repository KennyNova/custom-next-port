#!/usr/bin/env node

/**
 * Create Test Project Script
 * 
 * This script creates a test videography project for video assignment.
 */

const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function createTestProject() {
  let client;
  
  try {
    console.log('🎬 Creating test videography project...\n');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('Missing MONGODB_URI environment variable');
    }

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    const projectsCollection = db.collection('projects');
    
    // Check if project already exists
    const existingProject = await projectsCollection.findOne({ slug: 'my-video-portfolio' });
    
    if (existingProject) {
      console.log('✅ Project "my-video-portfolio" already exists!');
      console.log(`   Title: ${existingProject.title}`);
      console.log(`   Type: ${existingProject.type}`);
      console.log(`   Slug: ${existingProject.slug}\n`);
      console.log('You can now assign videos to this project.');
      return;
    }
    
    // Create the project
    const now = new Date();
    const newProject = {
      title: 'My Video Portfolio',
      slug: 'my-video-portfolio',
      description: 'Collection of my vertical videos showcasing creative work and storytelling',
      type: 'videography',
      images: [],
      videos: [], // Initialize empty videos array
      technologies: ['Video Production', 'Creative Direction', 'Post-Production', 'Storytelling'],
      links: {},
      featured: true,
      order: 1,
      orientation: 'vertical',
      createdAt: now,
      updatedAt: now
    };
    
    console.log('💾 Creating project in database...');
    const result = await projectsCollection.insertOne(newProject);
    
    if (result.insertedId) {
      console.log('✅ Project created successfully!\n');
      console.log('📋 Project Details:');
      console.log(`   Title: ${newProject.title}`);
      console.log(`   Slug: ${newProject.slug}`);
      console.log(`   Type: ${newProject.type}`);
      console.log(`   Orientation: ${newProject.orientation}`);
      console.log(`   ID: ${result.insertedId}\n`);
      
      console.log('🎯 Next Steps:');
      console.log('1. Run "npm run sync-mux" to see your Mux assets');
      console.log('2. Run "npm run assign-video ASSET_ID my-video-portfolio vertical"');
      console.log('3. Visit your project page to see the videos!');
    } else {
      throw new Error('Failed to create project');
    }
    
  } catch (error) {
    console.error('❌ Error creating project:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the script
createTestProject();
