#!/usr/bin/env node

/**
 * Production Database Connection Test
 * Verifies that your production database is accessible and contains the migrated data
 */

const { MongoClient } = require('mongodb');

const PROD_URI = process.env.PROD_MONGODB_URI || process.env.MONGODB_URI;

async function testProduction() {
  console.log('🧪 Testing Production Database Connection...\n');

  if (!PROD_URI) {
    throw new Error('Missing PROD_MONGODB_URI or MONGODB_URI environment variable');
  }
  
  let client;
  try {
    client = new MongoClient(PROD_URI);
    await client.connect();
    console.log('✅ Successfully connected to production database');
    
    const db = client.db();
    
    // Test blog posts collection
    const blogCollection = db.collection('blogPosts');
    const blogCount = await blogCollection.countDocuments();
    console.log(`📝 Blog posts: ${blogCount} documents`);
    
    if (blogCount > 0) {
      const sampleBlog = await blogCollection.findOne();
      console.log(`   Sample blog post: "${sampleBlog.title}"`);
    }
    
    // Test projects collection
    const projectsCollection = db.collection('projects');
    const projectCount = await projectsCollection.countDocuments();
    console.log(`🚀 Projects: ${projectCount} documents`);
    
    if (projectCount > 0) {
      const sampleProject = await projectsCollection.findOne();
      console.log(`   Sample project: "${sampleProject.title}"`);
    }
    
    // Test database operations
    console.log('\n🔧 Testing basic database operations...');
    
    // Test read operation
    const testRead = await blogCollection.findOne();
    if (testRead) {
      console.log('✅ Read operation successful');
    }
    
    // Test write operation (insert and then delete a test document)
    const testDoc = { 
      title: 'Test Document', 
      createdAt: new Date(),
      isTest: true 
    };
    
    const insertResult = await blogCollection.insertOne(testDoc);
    console.log('✅ Write operation successful');
    
    // Clean up test document
    await blogCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Delete operation successful');
    
    console.log('\n🎉 All database operations working correctly!');
    console.log('\n📋 Summary:');
    console.log(`   • Production database: Connected ✅`);
    console.log(`   • Blog posts migrated: ${blogCount} ✅`);
    console.log(`   • Projects: ${projectCount} (${projectCount === 0 ? 'empty - this is normal' : 'available'})`);
    console.log(`   • Database operations: Working ✅`);
    
    console.log('\n🚀 Next step: Configure this URI in Vercel environment variables');
    console.log('   Add MONGODB_URI in Vercel Project Settings > Environment Variables');
    
  } catch (error) {
    console.error('❌ Production database test failed:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Verify the connection string is correct');
    console.error('   2. Check MongoDB Atlas network access settings');
    console.error('   3. Ensure database user has proper permissions');
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected from production database');
    }
  }
}

if (require.main === module) {
  testProduction();
}

module.exports = { testProduction };
