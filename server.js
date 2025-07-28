// server.js - Fixed Image URLs for Vercel Frame
const express = require('express');
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple stats
let stats = { interactions: 0, users: new Set() };

// Fixed image URL generator - Using a reliable service
function createImageUrl(text, bgColor = '1a1a2e', textColor = 'ffffff') {
  // Clean text for URL - remove emojis and special characters
  const cleanText = text
    .replace(/[^\w\s-.,!?]/g, '') // Remove emojis and special chars
    .substring(0, 80) // Limit length
    .trim();
  
  const encoded = encodeURIComponent(cleanText);
  
  // Use fakeimg.pl which is more reliable than placeholder services
  return `https://fakeimg.pl/1200x630/${bgColor}/${textColor}/?text=${encoded}&font=bebas`;
}

// Alternative image function using a different service
function createImageUrlAlt(text, bgColor = '1a1a2e') {
  const cleanText = text.replace(/[^\w\s-.,!?]/g, '').substring(0, 60).trim();
  const encoded = encodeURIComponent(cleanText);
  return `https://dummyimage.com/1200x630/${bgColor}/ffffff.png&text=${encoded}`;
}

// Main page with frame meta tags
app.get('/', (req, res) => {
  const baseUrl = process.env.BASE_URL || 'https://kinetic-warpcast-ai.vercel.app';
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kinetic Crypto AI</title>
    
    <!-- Frame Meta Tags -->
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${createImageUrl('Kinetic Crypto AI - Choose an option!')}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    <meta property="fc:frame:button:1" content="📊 Market" />
    <meta property="fc:frame:button:2" content="🚨 News" />
    <meta property="fc:frame:button:3" content="💡 Tips" />
    <meta property="fc:frame:button:4" content="🎯 Ask AI" />
    <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
    
    <style>
        body { 
            font-family: system-ui; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background: #1a1a2e; 
            color: white; 
            text-align: center;
        }
        .status { 
            background: rgba(0,255,0,0.2); 
            padding: 15px; 
            border-radius: 10px; 
            margin: 20px 0; 
            border-left: 4px solid #00ff00;
        }
        .stats {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .test-images {
            margin: 20px 0;
            padding: 15px;
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
        }
        .test-images img {
            max-width: 300px;
            margin: 10px;
            border: 1px solid #444;
        }
    </style>
</head>
<body>
    <h1>⚡ Kinetic Crypto AI</h1>
    <p>AI-powered crypto analysis in Warpcast frames</p>
    
    <div class="status">
        <strong>🟢 Frame Status: ACTIVE</strong><br>
        Frame interactions working, images fixed!
    </div>
    
    <div class="stats">
        <h3>📊 Live Stats</h3>
        <p>Total Interactions: ${stats.interactions}</p>
        <p>Unique Users: ${stats.users.size}</p>
    </div>
    
    <div class="test-images">
        <h4>🖼️ Test Images</h4>
        <p>Main image:</p>
        <img src="${createImageUrl('Kinetic Crypto AI - Test Image')}" alt="Test" />
        <p>Alt service:</p>
        <img src="${createImageUrlAlt('Alternative Image Test')}" alt="Alt Test" />
    </div>
    
    <p><strong>Test Frame:</strong> <code>${baseUrl}</code></p>
    <p>✅ Images should load properly now!</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Frame interaction handler
app.post('/api/frame', (req, res) => {
  try {
    console.log('🎯 Frame POST received');
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Parse frame data - handle multiple possible formats
    let frameData = {};
    
    if (req.body.untrustedData) {
      frameData = req.body.untrustedData;
      console.log('Using untrustedData');
    } else if (req.body.trustedData) {
      frameData = req.body.trustedData;
      console.log('Using trustedData');
    } else {
      frameData = req.body;
      console.log('Using direct body');
    }
    
    const buttonIndex = parseInt(frameData.buttonIndex) || 1;
    const fid = frameData.fid || 'anonymous';
    const inputText = (frameData.inputText || '').trim();
    
    // Update stats
    stats.interactions++;
    stats.users.add(fid);
    
    console.log(`Button: ${buttonIndex}, User: ${fid}, Input: "${inputText}"`);
    
    const baseUrl = process.env.BASE_URL || 'https://kinetic-warpcast-ai.vercel.app';
    let imageUrl, buttons, hasInput = false;
    
    // Handle user questions
    if (inputText && inputText.length > 0) {
      console.log('Processing user question');
      const question = inputText.substring(0, 50);
      imageUrl = createImageUrl(`Q: ${question}... A: Thanks for asking! Analysis feature coming soon. DYOR always!`, '0d4f3c');
      buttons = ['Ask Another', 'Market Analysis', 'Trading Tips', 'Main Menu'];
      
    } else {
      // Handle button interactions
      console.log('Processing button interaction');
      
      switch (buttonIndex) {
        case 1: // Market Analysis
          imageUrl = createImageUrl('Market Analysis: BTC 43K+, ETH 2.6K+. Bullish momentum. DYOR!', '1a4f5f');
          buttons = ['Refresh Data', 'Latest News', 'Trading Tips', 'Main Menu'];
          break;
          
        case 2: // News
          imageUrl = createImageUrl('Crypto News: ETF inflows strong, DeFi TVL up. Institutional growth. DYOR!', '5f1a1a');
          buttons = ['Market Impact', 'More News', 'Analysis', 'Main Menu'];
          break;
          
        case 3: // Tips
          imageUrl = createImageUrl('Trading Tips: DCA strategy, risk management, portfolio diversity. DYOR!', '4a1a5f');
          buttons = ['Market Data', 'Ask Question', 'More Tips', 'Main Menu'];
          break;
          
        case 4: // Ask AI - Show input form
          imageUrl = createImageUrl('Ask me anything about crypto! Type your question below.', '5f4a1a');
          buttons = ['Submit Question'];
          hasInput = true;
          break;
          
        default: // Main Menu
          imageUrl = createImageUrl('Kinetic Crypto AI - Your crypto assistant. Choose an option!', '1a1a2e');
          buttons = ['Market Analysis', 'Crypto News', 'Trading Tips', 'Ask AI'];
      }
    }
    
    // Generate response HTML
    const buttonTags = buttons.map((btn, i) => 
      `    <meta property="fc:frame:button:${i + 1}" content="${btn}" />`
    ).join('\n');
    
    // Add input field only for Ask AI mode
    const inputTag = hasInput ? 
      '    <meta property="fc:frame:input:text" content="Ask about crypto trends, prices, DeFi..." />' : '';
    
    const responseHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${imageUrl}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
${buttonTags}
${inputTag}
    <title>Kinetic Crypto AI Response</title>
</head>
<body>
    <h1>Frame Response Generated</h1>
    <p>Interaction #${stats.interactions}</p>
    <p>User: ${fid}</p>
    <p>Button: ${buttonIndex}</p>
    ${inputText ? `<p>Question: "${inputText}"</p>` : ''}
    <p>Image URL: ${imageUrl}</p>
    
    <!-- Test the image -->
    <img src="${imageUrl}" alt="Frame Image" style="max-width: 300px; margin: 10px; border: 1px solid #ccc;" />
</body>
</html>`;

    console.log('✅ Sending frame response');
    console.log('Image URL:', imageUrl);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).send(responseHtml);
    
  } catch (error) {
    console.error('❌ Frame error:', error);
    
    const baseUrl = process.env.BASE_URL || 'https://kinetic-warpcast-ai.vercel.app';
    const errorHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${createImageUrl('Error occurred! Please try again.', 'ff4444')}" />
    <meta property="fc:frame:button:1" content="🔄 Retry" />
    <meta property="fc:frame:button:2" content="🏠 Menu" />
    <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
    <title>Frame Error</title>
</head>
<body>
    <h1>Frame Error</h1>
    <p>Error: ${error.message}</p>
    <p>Please try again</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(errorHtml);
  }
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    interactions: stats.interactions,
    users: stats.users.size,
    timestamp: new Date().toISOString(),
    imageTest: createImageUrl('Health Check Image')
  });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    baseUrl: process.env.BASE_URL,
    interactions: stats.interactions,
    users: stats.users.size,
    imageTests: {
      primary: createImageUrl('Debug Test Image'),
      alt: createImageUrlAlt('Debug Alt Image')
    }
  });
});

// Test image endpoint
app.get('/test-image', (req, res) => {
  const testUrl = createImageUrl('Test Image Generation');
  res.send(`
    <h1>Image Test</h1>
    <p>Generated URL: ${testUrl}</p>
    <img src="${testUrl}" alt="Test" style="max-width: 400px;" />
  `);
});

// Export for Vercel
module.exports = app;