#!/usr/bin/env node

/**
 * Database Migration Script
 * Copies data from local development database to production MongoDB Atlas
 */

const { MongoClient } = require('mongodb');

// Database configurations
const DEV_URI = 'mongodb://localhost:27017';
const PROD_URI = 'mongodb+srv://navidm4598:rqkq0lFMTjzR6fFZ@port.ca4zksq.mongodb.net/';
const DATABASE_NAME = 'portfolio-blog';

// Collections to migrate
const COLLECTIONS_TO_MIGRATE = [
  'projects',
  'blogPosts',
  'users', // if you have users collection
  // Add any other collections you have
];

async function backupProduction(prodDb) {
  console.log('🔄 Creating backup of production data...');
  
  const backupData = {};
  
  for (const collectionName of COLLECTIONS_TO_MIGRATE) {
    try {
      const collection = prodDb.collection(collectionName);
      const docs = await collection.find({}).toArray();
      backupData[collectionName] = docs;
      console.log(`   ✅ Backed up ${docs.length} documents from ${collectionName}`);
    } catch (error) {
      console.log(`   ⚠️  Collection ${collectionName} doesn't exist in production (this is okay)`);
      backupData[collectionName] = [];
    }
  }
  
  // Save backup to file
  const fs = require('fs');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `./backup-production-${timestamp}.json`;
  
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`📦 Production backup saved to: ${backupPath}`);
  
  return backupData;
}

async function getCollectionStats(db, label) {
  console.log(`\n📊 ${label} Database Statistics:`);
  
  for (const collectionName of COLLECTIONS_TO_MIGRATE) {
    try {
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      console.log(`   ${collectionName}: ${count} documents`);
    } catch (error) {
      console.log(`   ${collectionName}: Collection doesn't exist`);
    }
  }
}

async function migrateCollection(devDb, prodDb, collectionName) {
  try {
    const devCollection = devDb.collection(collectionName);
    const prodCollection = prodDb.collection(collectionName);
    
    // Get all documents from dev
    const devDocs = await devCollection.find({}).toArray();
    
    if (devDocs.length === 0) {
      console.log(`   ⚠️  No documents found in dev ${collectionName}`);
      return;
    }
    
    // Clear production collection
    await prodCollection.deleteMany({});
    console.log(`   🗑️  Cleared production ${collectionName}`);
    
    // Insert dev documents into production
    const result = await prodCollection.insertMany(devDocs);
    console.log(`   ✅ Migrated ${result.insertedCount} documents to ${collectionName}`);
    
  } catch (error) {
    console.error(`   ❌ Error migrating ${collectionName}:`, error.message);
    throw error;
  }
}

async function main() {
  let devClient, prodClient;
  
  try {
    console.log('🚀 Starting database migration...\n');
    
    // Connect to databases
    console.log('🔗 Connecting to databases...');
    devClient = new MongoClient(DEV_URI);
    prodClient = new MongoClient(PROD_URI);
    
    await devClient.connect();
    console.log('   ✅ Connected to development database');
    
    await prodClient.connect();
    console.log('   ✅ Connected to production database');
    
    const devDb = devClient.db(DATABASE_NAME);
    const prodDb = prodClient.db(DATABASE_NAME);
    
    // Show initial stats
    await getCollectionStats(devDb, 'Development');
    await getCollectionStats(prodDb, 'Production (Before Migration)');
    
    // Create backup of production data
    await backupProduction(prodDb);
    
    // Confirm migration
    console.log('\n⚠️  WARNING: This will replace ALL data in production database!');
    console.log('   Make sure you have reviewed the backup file created above.');
    
    // In a real scenario, you'd want user confirmation here
    // For now, we'll proceed automatically
    
    console.log('\n🔄 Starting migration...');
    
    // Migrate each collection
    for (const collectionName of COLLECTIONS_TO_MIGRATE) {
      console.log(`\n📦 Migrating ${collectionName}...`);
      await migrateCollection(devDb, prodDb, collectionName);
    }
    
    // Show final stats
    await getCollectionStats(prodDb, 'Production (After Migration)');
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Update your Vercel environment variables with the production MongoDB URI');
    console.log('   2. Redeploy your application');
    console.log('   3. Test your deployed application');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('   Check the error above and try again.');
    console.error('   Your production database backup is safe in the backup file.');
    process.exit(1);
    
  } finally {
    // Close connections
    if (devClient) {
      await devClient.close();
      console.log('\n🔌 Disconnected from development database');
    }
    if (prodClient) {
      await prodClient.close();
      console.log('🔌 Disconnected from production database');
    }
  }
}

// Handle process interruption
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Migration interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled error:', error);
  process.exit(1);
});

// Run the migration
if (require.main === module) {
  main();
}

module.exports = { main };
