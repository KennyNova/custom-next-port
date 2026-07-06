#!/usr/bin/env node

/**
 * Database Check Script
 * Shows what data exists in both development and production databases
 */

const { MongoClient } = require('mongodb');

const DEV_URI = process.env.DEV_MONGODB_URI || 'mongodb://localhost:27017';
const PROD_URI = process.env.PROD_MONGODB_URI || process.env.MONGODB_URI;
const DATABASE_NAME = 'portfolio-blog';

const COLLECTIONS = ['projects', 'blogPosts', 'users'];

async function checkDatabase(uri, label) {
  console.log(`\n🔍 Checking ${label} Database:`);
  console.log(`   URI: ${uri.replace(/\/\/.*:.*@/, '//***:***@')}`); // Hide credentials
  
  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('   📊 No collections found');
      return;
    }
    
    console.log('   📊 Collections found:');
    for (const collection of collections) {
      const coll = db.collection(collection.name);
      const count = await coll.countDocuments();
      console.log(`      ${collection.name}: ${count} documents`);
      
      // Show a sample document if available
      if (count > 0) {
        const sample = await coll.findOne();
        if (sample) {
          const sampleKeys = Object.keys(sample).slice(0, 3).join(', ');
          console.log(`         Sample fields: ${sampleKeys}...`);
        }
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function main() {
  console.log('🚀 Database Checker');
  console.log('====================');

  if (!PROD_URI) {
    throw new Error('Missing PROD_MONGODB_URI or MONGODB_URI environment variable');
  }
  
  // Check development database
  await checkDatabase(DEV_URI, 'Development');
  
  // Check production database
  await checkDatabase(PROD_URI, 'Production');
  
  console.log('\n✅ Database check complete!');
  console.log('\n📋 Next steps:');
  console.log('   - If development has data and production is empty, run: npm run migrate-db');
  console.log('   - If both have data, review what needs to be migrated');
  console.log('   - Make sure to backup production before migrating');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
