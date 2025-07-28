// Minimal Working Frame Server for Vercel
const express = require('express');
const app = express();

// Essential middleware for Vercel
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple stats tracking
let stats = { interactions: 0, users: new Set() };

// Helper function to create image URLs
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
    <meta property="fc:frame:image" content="${createImageUrl('⚡ Kinetic Crypto AI - Choose an option below!')}" />
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
        <strong>🟢 Frame Status: Active</strong><br>
        Ready for Warpcast interactions!
    </div>
    
    <div class="stats">
        <h3>📊 Stats</h3>
        <p>Total Interactions: ${stats.interactions}</p>
        <p>Unique Users: ${stats.users.size}</p>
    </div>
    
    <p><strong>How to use:</strong> Share this URL in Warpcast and click the frame buttons!</p>
    <p>Frame URL: <code>${baseUrl}</code></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Frame interaction handler - CRITICAL ENDPOINT
app.post('/api/frame', (req, res) => {
  try {
    console.log('🎯 Frame interaction received');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    // Parse frame data (handle different formats)
    let frameData;
    if (req.body.untrustedData) {
      frameData = req.body.untrustedData;
    } else if (req.body.trustedData) {
      frameData = req.body.trustedData;
    } else {
      frameData = req.body;
    }
    
    const buttonIndex = parseInt(frameData.buttonIndex) || 1;
    const fid = frameData.fid || 'anonymous';
    const inputText = frameData.inputText || '';
    
    // Update stats
    stats.interactions++;
    stats.users.add(fid);
    
    console.log(`Button ${buttonIndex} clicked by user ${fid}`);
    if (inputText) console.log(`Input: "${inputText}"`);
    
    const baseUrl = process.env.BASE_URL || 'https://kinetic-warpcast-ai.vercel.app';
    let imageUrl, buttons;
    
    // Handle user input (question)
    if (inputText && inputText.trim()) {
      const question = inputText.trim();
      imageUrl = createImageUrl(`Q: ${question} | A: Thanks for your question! Feature coming soon.`, '0d4f3c');
      buttons = [
        'Ask Another',
        'Market Analysis', 
        'Trading Tips',
        'Main Menu'
      ];
    } else {
      // Handle button interactions
      switch (buttonIndex) {
        case 1: // Market Analysis
          imageUrl = createImageUrl('📊 Market Analysis: Bitcoin holding strong above $43K. Altcoins showing mixed signals. Stay cautious and DYOR!', '1a4f5f');
          buttons = ['Refresh Data', 'Latest News', 'Trading Tips', 'Main Menu'];
          break;
          
        case 2: // News
          imageUrl = createImageUrl('🚨 Crypto News: ETF approvals driving institutional interest. DeFi protocols seeing increased activity. DYOR always!', '5f1a1a');
          buttons = ['Market Impact', 'More News', 'Analysis', 'Main Menu'];
          break;
          
        case 3: // Tips
          imageUrl = createImageUrl('💡 Trading Tips: 1) Never invest more than you can lose 2) DCA strategy works well 3) Always DYOR! Risk management is key.', '4a1a5f');
          buttons = ['Market Data', 'Ask Question', 'More Tips', 'Main Menu'];
          break;
          
        case 4: // Ask AI
          imageUrl = createImageUrl('🎯 Ask me anything about crypto! Type your question below and click Submit.', '5f4a1a');
          buttons = ['Submit Question'];
          break;
          
        default: // Main Menu
          imageUrl = createImageUrl('⚡ Kinetic Crypto AI - Your crypto analysis assistant. Choose an option below!', '1a1a2e');
          buttons = ['📊 Market', '🚨 News', '💡 Tips', '🎯 Ask AI'];
      }
    }
    
    // Generate button meta tags
    const buttonTags = buttons.map((btn, i) => 
      `    <meta property="fc:frame:button:${i + 1}" content="${btn}" />`
    ).join('\n');
    
    // Add input field for Ask AI mode
    const inputTag = (buttonIndex === 4 && !inputText) ? 
      '    <meta property="fc:frame:input:text" content="Ask about crypto trends, prices, tips..." />' : '';
    
    // Build frame response
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
    <h1>Frame Response</h1>
    <p>Interaction #${stats.interactions} processed successfully</p>
    <p>User: ${fid} | Button: ${buttonIndex}</p>
    ${inputText ? `<p>Question: "${inputText}"</p>` : ''}
</body>
</html>`;

    console.log('✅ Sending response');
    
    // Send response with proper headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(responseHtml);
    
  } catch (error) {
    console.error('❌ Frame error:', error);
    
    // Send error frame
    const baseUrl = process.env.BASE_URL || 'https://kinetic-warpcast-ai.vercel.app';
    const errorHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${createImageUrl('❌ Oops! Something went wrong. Please try again.', 'ff4444')}" />
    <meta property="fc:frame:button:1" content="🔄 Try Again" />
    <meta property="fc:frame:button:2" content="🏠 Main Menu" />
    <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
    <title>Frame Error</title>
</head>
<body>
    <h1>Frame Error</h1>
    <p>Error: ${error.message}</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(errorHtml);
  }
});

// Health check
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

// Start server (for local development)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
  });
}