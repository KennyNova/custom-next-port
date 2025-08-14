#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Portfolio & Blog Setup...\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ Environment file (.env.local) exists');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'LINKEDIN_CLIENT_ID',
    'LINKEDIN_CLIENT_SECRET'
  ];
  
  const missingVars = requiredVars.filter(varName => !envContent.includes(varName + '='));
  
  if (missingVars.length === 0) {
    console.log('✅ All required environment variables are present');
  } else {
    console.log('⚠️  Missing environment variables:', missingVars.join(', '));
  }
} else {
  console.log('❌ Environment file (.env.local) not found');
  console.log('   Run: cp env.example .env.local');
}

// Check core files
const coreFiles = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/components/ui/button.tsx',
  'src/lib/db/mongodb.ts',
  'src/lib/auth/config.ts',
  'package.json'
];

console.log('\n📁 Checking core files:');
coreFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file}`);
  }
});

// Check API routes
const apiRoutes = [
  'src/app/api/auth/[...nextauth]/route.ts',
  'src/app/api/blog/route.ts',
  'src/app/api/projects/route.ts',
  'src/app/api/signatures/route.ts'
];

console.log('\n🔗 Checking API routes:');
apiRoutes.forEach(route => {
  if (fs.existsSync(path.join(__dirname, route))) {
    console.log(`✅ ${route}`);
  } else {
    console.log(`❌ ${route}`);
  }
});

// Check pages
const pages = [
  'src/app/blog/page.tsx',
  'src/app/projects/page.tsx',
  'src/app/quiz/page.tsx',
  'src/app/signatures/page.tsx',
  'src/app/templates/page.tsx',
  'src/app/consultation/page.tsx'
];

console.log('\n📄 Checking pages:');
pages.forEach(page => {
  if (fs.existsSync(path.join(__dirname, page))) {
    console.log(`✅ ${page}`);
  } else {
    console.log(`❌ ${page}`);
  }
});

console.log('\n🚀 Setup Complete!');
console.log('\nNext steps:');
console.log('1. Configure your .env.local file with real values');
console.log('2. Set up OAuth applications and get client IDs/secrets');
console.log('3. Create your MongoDB database');
console.log('4. Visit http://localhost:3000 to see your portfolio');
console.log('5. Test OAuth by visiting /signatures and signing the wall');

console.log('\n📚 OAuth Callback URLs for setup:');
console.log('- GitHub: http://localhost:3000/api/auth/callback/github');
console.log('- Google: http://localhost:3000/api/auth/callback/google');
console.log('- LinkedIn: http://localhost:3000/api/auth/callback/linkedin');