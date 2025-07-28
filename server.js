// server.js - Vercel Compatible Express Frame Server
const express = require('express');
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple stats
let stats = { interactions: 0, users: new Set() };

// Image URL helper
function createImageUrl(text, bgColor = '1a1a2e') {
  const encoded = encodeURIComponent(text.substring(0, 120));
  return `https://via.placeholder.com/1200x630/${bgColor}/ffffff?text=${encoded}`;
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
    <meta property="fc:frame:image" content="${createImageUrl('⚡ Kinetic Crypto AI - Choose an option!')}" />
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
    </style>
</head>
<body>
    <h1>⚡ Kinetic Crypto AI</h1>
    <p>AI-powered crypto analysis in Warpcast frames</p>
    
    <div class="status">
        <strong>🟢 Frame Status: LIVE</strong><br>
        Ready for Warpcast interactions!
    </div>
    
    <div class="stats">
        <h3>📊 Live Stats</h3>
        <p>Total Interactions: ${stats.interactions}</p>
        <p>Unique Users: ${stats.users.size}</p>
    </div>
    
    <p><strong>Test:</strong> Share this URL in Warpcast: <code>${baseUrl}</code></p>
    <p>Frame buttons should work after deployment!</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Frame interaction handler
app.post('/api/frame', (req, res) => {
  try {
    console.log('🎯 Frame POST received');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    // Parse frame data
    const frameData = req.body.untrustedData || req.body;
    const buttonIndex = parseInt(frameData.buttonIndex) || 1;
    const fid = frameData.fid || 'anonymous';
    const inputText = frameData.inputText || '';
    
    // Update stats
    stats.interactions++;
    stats.users.add(fid);
    
    console.log(`Button ${buttonIndex} clicked by ${fid}`);
    
    const baseUrl = process.env.BASE_URL || 'https://kinetic-warpcast-ai.vercel.app';
    let imageUrl, buttons;
    
    // Handle interactions
    if (inputText && inputText.trim()) {
      // User asked a question
      const question = inputText.trim();
      imageUrl = createImageUrl(`Q: ${question} | A: Great question! AI analysis coming soon. DYOR!`, '0d4f3c');
      buttons = ['Ask Another', 'Market Analysis', 'Trading Tips', 'Main Menu'];
    } else {
      // Button interactions
      switch (buttonIndex) {
        case 1: // Market
          imageUrl = createImageUrl('📊 Market: BTC $43K+, ETH $2.6K+. Bullish momentum continues. Always DYOR!', '1a4f5f');
          buttons = ['Refresh', 'News', 'Tips', 'Menu'];
          break;
          
        case 2: // News
          imageUrl = createImageUrl('🚨 News: ETF inflows strong, DeFi TVL up 12%. Institutional adoption growing. DYOR!', '5f1a1a');
          buttons = ['Market', 'Impact', 'Tips', 'Menu'];
          break;
          
        case 3: // Tips
          imageUrl = createImageUrl('💡 Tips: 1) DCA strategy 2) Risk management 3) Portfolio diversity. Always DYOR!', '4a1a5f');
          buttons = ['Market', 'Ask AI', 'More', 'Menu'];
          break;
          
        case 4: // Ask AI
          imageUrl = createImageUrl('🎯 Ask anything about crypto! Type your question below.', '5f4a1a');
          buttons = ['Submit Question'];
          break;
          
        default: // Main Menu
          imageUrl = createImageUrl('⚡ Kinetic Crypto AI - Your crypto assistant. Choose an option!', '1a1a2e');
          buttons = ['📊 Market', '🚨 News', '💡 Tips', '🎯 Ask AI'];
      }
    }
    
    // Generate response HTML
    const buttonTags = buttons.map((btn, i) => 
      `    <meta property="fc:frame:button:${i + 1}" content="${btn}" />`
    ).join('\n');
    
    const inputTag = (buttonIndex === 4 && !inputText) ? 
      '    <meta property="fc:frame:input:text" content="Ask about crypto..." />' : '';
    
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
    <title>Kinetic Crypto AI</title>
</head>
<body>
    <h1>Frame Response</h1>
    <p>Interaction #${stats.interactions} processed</p>
    <p>User: ${fid} | Button: ${buttonIndex}</p>
</body>
</html>`;

    console.log('✅ Sending frame response');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(responseHtml);
    
  } catch (error) {
    console.error('❌ Frame error:', error);
    
    const baseUrl = process.env.BASE_URL || 'https://kinetic-warpcast-ai.vercel.app';
    const errorHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${createImageUrl('❌ Error! Please try again.', 'ff4444')}" />
    <meta property="fc:frame:button:1" content="🔄 Retry" />
    <meta property="fc:frame:button:2" content="🏠 Menu" />
    <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
</head>
<body><p>Error occurred</p></body>
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
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    baseUrl: process.env.BASE_URL,
    interactions: stats.interactions,
    users: stats.users.size
  });
});

// Export for Vercel
module.exports = app;