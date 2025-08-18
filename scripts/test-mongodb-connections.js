#!/usr/bin/env node

/**
 * MongoDB Connection Diagnostic Tool
 * Tests different connection string formats and options to identify SSL/connection issues
 */

const { MongoClient } = require('mongodb');

// Your current credentials
const USERNAME = 'navidmad4598';
const PASSWORD = 'tyhZ9YNIPNAEuE4cFzC2X34cWL6CBA22BwQoCikAkMs';
const CLUSTER = 'port.ca4zksq.mongodb.net';
const DATABASE = 'portfolio-blog';

// Different connection string formats to test
const connectionTests = [
  {
    name: 'Current SRV Format',
    uri: `mongodb+srv://${USERNAME}:${PASSWORD}@${CLUSTER}/${DATABASE}?retryWrites=true&w=majority`,
    options: {}
  },
  {
    name: 'SRV without w=majority',
    uri: `mongodb+srv://${USERNAME}:${PASSWORD}@${CLUSTER}/${DATABASE}?retryWrites=true`,
    options: {}
  },
  {
    name: 'SRV with SSL options',
    uri: `mongodb+srv://${USERNAME}:${PASSWORD}@${CLUSTER}/${DATABASE}?retryWrites=true&w=majority&ssl=true`,
    options: {}
  },
  {
    name: 'Enhanced connection options',
    uri: `mongodb+srv://${USERNAME}:${PASSWORD}@${CLUSTER}/${DATABASE}?retryWrites=true&w=majority`,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
      maxPoolSize: 10,
    }
  },
  {
    name: 'Relaxed SSL options',
    uri: `mongodb+srv://${USERNAME}:${PASSWORD}@${CLUSTER}/${DATABASE}?retryWrites=true&w=majority`,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      ssl: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
    }
  }
];

async function testConnection(test) {
  console.log(`\n🧪 Testing: ${test.name}`);
  console.log(`   URI: ${test.uri.replace(/:([^:@]+)@/, ':***@')}`); // Hide password
  
  let client;
  try {
    client = new MongoClient(test.uri, test.options);
    
    // Test connection
    console.log('   🔗 Attempting connection...');
    await client.connect();
    
    // Test database operations
    console.log('   📊 Testing database access...');
    const db = client.db(DATABASE);
    
    // Try to list collections
    const collections = await db.listCollections().toArray();
    console.log(`   📁 Found ${collections.length} collections`);
    
    // Try to count documents in a collection
    if (collections.length > 0) {
      const firstCollection = collections[0].name;
      const count = await db.collection(firstCollection).countDocuments();
      console.log(`   📄 Collection "${firstCollection}": ${count} documents`);
    }
    
    console.log(`   ✅ SUCCESS: ${test.name} works!`);
    return true;
    
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    
    // Detailed error analysis
    if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log('   🔍 SSL/TLS Issue detected');
    }
    if (error.message.includes('authentication')) {
      console.log('   🔍 Authentication Issue detected');
    }
    if (error.message.includes('timeout')) {
      console.log('   🔍 Timeout Issue detected');
    }
    if (error.message.includes('ENOTFOUND')) {
      console.log('   🔍 DNS Resolution Issue detected');
    }
    
    return false;
    
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        // Ignore close errors
      }
    }
  }
}

async function runDiagnostics() {
  console.log('🚀 MongoDB Connection Diagnostics');
  console.log('=================================');
  console.log(`Target: ${CLUSTER}`);
  console.log(`Database: ${DATABASE}`);
  console.log(`Username: ${USERNAME}`);
  console.log('Password: [HIDDEN]');
  
  let successCount = 0;
  
  for (const test of connectionTests) {
    const success = await testConnection(test);
    if (success) {
      successCount++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Results Summary');
  console.log('==================');
  console.log(`✅ Successful connections: ${successCount}/${connectionTests.length}`);
  
  if (successCount === 0) {
    console.log('\n🚨 All connection attempts failed!');
    console.log('\n🔍 Possible Issues:');
    console.log('   1. MongoDB Atlas cluster is paused or down');
    console.log('   2. Network/firewall blocking MongoDB Atlas');
    console.log('   3. Invalid credentials');
    console.log('   4. IP not whitelisted in MongoDB Atlas');
    console.log('   5. SSL/TLS configuration issues');
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Check MongoDB Atlas cluster status');
    console.log('   2. Verify Network Access allows 0.0.0.0/0');
    console.log('   3. Confirm user credentials in Database Access');
    console.log('   4. Try connecting with MongoDB Compass');
    console.log('   5. Check MongoDB Atlas status page');
    
  } else if (successCount < connectionTests.length) {
    console.log('\n⚠️  Some connections worked, others failed');
    console.log('   This suggests configuration or timing issues');
    console.log('   Use the working connection format in your application');
    
  } else {
    console.log('\n🎉 All connections successful!');
    console.log('   Your MongoDB Atlas setup is working correctly');
    console.log('   The issue might be environment-specific');
  }
}

// Handle process interruption
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Diagnostics interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled error:', error.message);
});

// Run diagnostics
if (require.main === module) {
  runDiagnostics().catch(console.error);
}

module.exports = { runDiagnostics };

