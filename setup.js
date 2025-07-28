#!/usr/bin/env node
// setup.js - Quick Frame Setup Helper
const fs = require('fs');
const path = require('path');

console.log('⚡ Kinetic Crypto Frame Setup Helper');
console.log('=====================================\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file already exists');
  
  // Check current configuration
  require('dotenv').config();
  
  const checks = {
    'Crestal API Key': process.env.CRESTAL_API_KEY,
    'Base URL': process.env.BASE_URL,
    'Crestal Chat URL': process.env.CRESTAL_API_URL_CHATS
  };
  
  console.log('\n📋 Current Configuration:');
  Object.entries(checks).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    const display = value ? (key.includes('Key') ? 'Configured' : value) : 'Missing';
    console.log(`   ${status} ${key}: ${display}`);
  });
  
  if (!process.env.CRESTAL_API_KEY || !process.env.BASE_URL) {
    console.log('\n⚠️  Please update your .env file with missing values');
  } else {
    console.log('\n🚀 Configuration looks good! Ready to deploy:');
    console.log('   npm start                    # Start locally');
    console.log('   vercel --prod               # Deploy to Vercel');
    console.log('   git push                    # Deploy to Railway/Heroku');
  }
  
} else {
  console.log('📝 Creating .env file...');
  
  const envTemplate = `# Kinetic Crypto Frame - Environment Configuration

# Required: Crestal Network API
CRESTAL_API_KEY=your_crestal_api_key_here
CRESTAL_API_URL=https://open.service.crestal.network
CRESTAL_API_URL_CHATS=https://open.service.crestal.network/v1/chat/completions

# Required: Frame Configuration  
BASE_URL=http://localhost:3000
PORT=3000

# Optional: Frame Customization
FRAME_TITLE="Kinetic Crypto - AI Crypto Analyst"
FRAME_DESCRIPTION="Get personalized crypto insights powered by AI"

# Optional: Analytics & Monitoring
ENABLE_ANALYTICS=true
DEBUG_MODE=false

# ===================================================
# TODO: Update these values before deployment:
# ===================================================
# 1. Replace CRESTAL_API_KEY with your actual key from https://crestal.network
# 2. Replace BASE_URL with your deployment URL:
#    - Vercel: https://your-app.vercel.app
#    - Railway: https://your-app.up.railway.app
#    - Heroku: https://your-app.herokuapp.com
# 3. Test locally first with: npm start
# ===================================================
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created successfully!');
  
  console.log('\n📋 Next steps:');
  console.log('1. Edit .env file and add your Crestal API key');
  console.log('2. Update BASE_URL for your deployment domain');
  console.log('3. Run: npm start (for local testing)');
  console.log('4. Deploy to Vercel/Railway/Heroku');
  
  console.log('\n🔗 Quick links:');
  console.log('   Crestal API Key: https://crestal.network');
  console.log('   Deploy to Vercel: https://vercel.com');
  console.log('   Deploy to Railway: https://railway.app');
}

console.log('\n💡 Need help? Check the deployment guide or README.md');
console.log('⚡ Happy building with Kinetic Crypto!');
