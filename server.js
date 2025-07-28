// server.js - Warpcast Compatible Frame
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Analytics
let stats = { interactions: 0, users: new Set(), questions: [] };

// Generate image URL
function getImageUrl(text, bgColor = '1a1a2e') {
  const baseUrl = process.env.BASE_URL || `https://kinetic-warpcast-ai.vercel.app`;
  const encoded = encodeURIComponent(text.substring(0, 80));
  return `https://via.placeholder.com/1200x630/${bgColor}/ffffff?text=${encoded}`;
}

// Call Crestal AI
async function askAI(prompt) {
  if (!process.env.CRESTAL_API_KEY || process.env.CRESTAL_API_KEY === 'your_crestal_api_key_here') {
    return "🤖 Kinetic Crypto AI ready! Add Crestal API key to enable responses ⚡";
  }

  try {
    const response = await axios.post(
      'https://open.service.crestal.network/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are Kinetic Crypto AI. Respond in under 200 characters. Be helpful and professional. Include 'DYOR' for trading advice."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 100,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CRESTAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('AI Error:', error.message);
    return "🤖 AI temporarily unavailable. Try again! ⚡";
  }
}

// Main frame page
app.get('/', (req, res) => {
  const baseUrl = process.env.BASE_URL || `https://kinetic-warpcast-ai.vercel.app`;
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Kinetic Crypto AI</title>
    
    <!-- Required Warpcast Frame meta tags -->
    <meta property="fc:frame" content="vNext">
    <meta property="fc:frame:image" content="${getImageUrl('⚡ Kinetic Crypto AI - Your Personal Crypto Analyst')}">
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
    <meta property="fc:frame:button:1" content="📊 Market Analysis">
    <meta property="fc:frame:button:2" content="🚨 Crypto News">
    <meta property="fc:frame:button:3" content="💡 Trading Tips">
    <meta property="fc:frame:button:4" content="🎯 Ask AI">
    <meta property="fc:frame:post_url" content="${baseUrl}/frame">
    
    <!-- Open Graph -->
    <meta property="og:title" content="Kinetic Crypto AI">
    <meta property="og:description" content="AI-powered crypto analysis and insights">
    <meta property="og:image" content="${getImageUrl('Kinetic Crypto AI')}">
    
    <style>
        body { 
            font-family: system-ui; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background: #1a1a2e; 
            color: white; 
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
    <p>Interactive crypto analysis powered by AI</p>
    
    <div class="stats">
        <h3>📊 Live Stats</h3>
        <p>Interactions: ${stats.interactions}</p>
        <p>Users: ${stats.users.size}</p>
        <p>Questions: ${stats.questions.length}</p>
    </div>
    
    <p>🔗 Frame URL: <code>${baseUrl}</code></p>
    <p>🎯 Status: ${process.env.CRESTAL_API_KEY && process.env.CRESTAL_API_KEY !== 'your_crestal_api_key_here' ? '✅ AI Ready' : '⚠️ Add Crestal Key'}</p>
    
    <p><strong>How to use:</strong> Post this URL in Warpcast and interact with the buttons!</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Frame interaction endpoint - CRITICAL: exact path /frame
app.post('/frame', async (req, res) => {
  try {
    console.log('📦 Frame request:', JSON.stringify(req.body, null, 2));
    
    // Parse Warpcast frame data
    const data = req.body.untrustedData || req.body;
    const buttonIndex = parseInt(data.buttonIndex) || 1;
    const fid = data.fid || 'anon';
    const inputText = data.inputText || '';
    
    // Update stats
    stats.interactions++;
    stats.users.add(fid);
    
    console.log(`🎯 Button ${buttonIndex} from FID ${fid}`);
    if (inputText) {
      console.log(`💬 Input: ${inputText}`);
      stats.questions.push({ q: inputText, fid, time: new Date() });
    }

    const baseUrl = process.env.BASE_URL || `https://kinetic-warpcast-ai.vercel.app`;
    let frameResponse;

    // Handle interactions
    if (inputText) {
      // AI Question Response
      const answer = await askAI(`User asked: "${inputText}". Provide helpful crypto advice.`);
      frameResponse = {
        image: getImageUrl(`Q: ${inputText.substring(0, 30)}... A: ${answer}`, '0d4f3c'),
        buttons: [
          { text: '🎯 Ask Again' },
          { text: '📊 Market' },
          { text: '💡 Tips' },
          { text: '← Menu' }
        ]
      };
    } else {
      // Button responses
      switch (buttonIndex) {
        case 1: // Market Analysis
          const market = await askAI("Provide current crypto market analysis with key insights.");
          frameResponse = {
            image: getImageUrl(`📊 Market: ${market}`, '1a4f5f'),
            buttons: [
              { text: '🔄 Refresh' },
              { text: '🚨 News' },
              { text: '💡 Tips' },
              { text: '← Menu' }
            ]
          };
          break;
          
        case 2: // Crypto News  
          const news = await askAI("What are the top 2 crypto news stories today?");
          frameResponse = {
            image: getImageUrl(`🚨 News: ${news}`, '5f1a1a'),
            buttons: [
              { text: '📊 Impact' },
              { text: '🔄 Latest' },
              { text: '💡 Tips' },
              { text: '← Menu' }
            ]
          };
          break;
          
        case 3: // Trading Tips
          const tips = await askAI("Give 2 practical crypto trading tips with risk management.");
          frameResponse = {
            image: getImageUrl(`💡 Tips: ${tips}`, '4a1a5f'),
            buttons: [
              { text: '📊 Analysis' },
              { text: '🎯 Ask AI' },
              { text: '🔄 More' },
              { text: '← Menu' }
            ]
          };
          break;
          
        case 4: // Ask AI
          frameResponse = {
            image: getImageUrl('🎯 Ask me anything about crypto! Type your question.', '5f4a1a'),
            buttons: [{ text: 'Submit Question' }],
            input: { text: 'Ask about crypto...' }
          };
          break;
          
        default: // Main menu
          frameResponse = {
            image: getImageUrl('⚡ Kinetic Crypto AI - Choose an option', '1a1a2e'),
            buttons: [
              { text: '📊 Market Analysis' },
              { text: '🚨 Crypto News' },
              { text: '💡 Trading Tips' },
              { text: '🎯 Ask AI' }
            ]
          };
      }
    }

    // Build frame HTML response - EXACT format required
    const buttons = frameResponse.buttons.map((btn, i) => 
      `    <meta property="fc:frame:button:${i + 1}" content="${btn.text || btn}" />`
    ).join('\n');
    
    const input = frameResponse.input ? 
      `    <meta property="fc:frame:input:text" content="${frameResponse.input.text}" />` : '';

    const html = `<!DOCTYPE html>
<html>
<head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${frameResponse.image}" />
    <meta property="fc:frame:post_url" content="${baseUrl}/frame" />
${buttons}
${input}
</head>
<body>
    <p>Frame response generated</p>
</body>
</html>`;

    // CRITICAL: Must return text/html
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);

  } catch (error) {
    console.error('❌ Frame error:', error);
    
    // Error response
    const errorHtml = `<!DOCTYPE html>
<html>
<head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${getImageUrl('❌ Error occurred - Try again!', 'ff0000')}" />
    <meta property="fc:frame:button:1" content="🔄 Retry" />
    <meta property="fc:frame:button:2" content="← Menu" />
    <meta property="fc:frame:post_url" content="${process.env.BASE_URL || 'https://kinetic-warpcast-ai.vercel.app'}/frame" />
</head>
<body><p>Error</p></body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(errorHtml);
  }
});

// API endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    interactions: stats.interactions,
    ai: !!(process.env.CRESTAL_API_KEY && process.env.CRESTAL_API_KEY !== 'your_crestal_api_key_here')
  });
});

app.get('/analytics', (req, res) => {
  res.json({
    interactions: stats.interactions,
    users: stats.users.size,
    questions: stats.questions.length,
    recent: stats.questions.slice(-3)
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Kinetic Crypto AI Frame on port ${PORT}`);
  console.log(`🌐 ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
  console.log(`🤖 AI: ${process.env.CRESTAL_API_KEY ? 'Ready' : 'Add key'}`);
});

module.exports = app;