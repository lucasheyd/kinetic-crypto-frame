// server.js - Kinetic Crypto Frame Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.static('public'));

// Simple in-memory analytics
let analytics = {
  totalInteractions: 0,
  buttonClicks: {},
  uniqueUsers: new Set(),
  questions: []
};

// Main frame endpoint
app.get('/', (req, res) => {
  const frameHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kinetic Crypto - AI Crypto Analyst</title>
    
    <!-- Warpcast Frame Meta Tags -->
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${process.env.BASE_URL}/images/frame-main.png" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    <meta property="fc:frame:button:1" content="📊 Market Analysis" />
    <meta property="fc:frame:button:2" content="🚨 Breaking News" />
    <meta property="fc:frame:button:3" content="💡 Trading Tips" />
    <meta property="fc:frame:button:4" content="🎯 Ask Question" />
    <meta property="fc:frame:post_url" content="${process.env.BASE_URL}/api/frame" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="Kinetic Crypto - AI Crypto Analyst" />
    <meta property="og:description" content="Get personalized crypto insights powered by AI" />
    <meta property="og:image" content="${process.env.BASE_URL}/images/frame-main.png" />
    
    <style>
        body {
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            max-width: 600px;
            padding: 2rem;
            text-align: center;
        }
        
        .logo {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            background: linear-gradient(45deg, #00d4ff, #ff0080);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.8;
            margin-bottom: 2rem;
        }
        
        .stats {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 1.5rem;
            margin: 2rem 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .cta {
            background: linear-gradient(45deg, #00d4ff, #ff0080);
            border: none;
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 2rem;
            transition: transform 0.2s;
            text-decoration: none;
            display: inline-block;
        }
        
        .cta:hover {
            transform: translateY(-2px);
        }
        
        .powered-by {
            margin-top: 2rem;
            opacity: 0.6;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">⚡</div>
        <h1 class="title">Kinetic Crypto</h1>
        <p class="subtitle">AI-Powered Crypto Analysis in Warpcast</p>
        
        <div class="stats">
            <h3>📊 Live Stats</h3>
            <p>Total Interactions: ${analytics.totalInteractions}</p>
            <p>Unique Users: ${analytics.uniqueUsers.size}</p>
            <p>Questions Asked: ${analytics.questions.length}</p>
        </div>
        
        <a href="https://warpcast.com/~/composer?text=Check%20out%20Kinetic%20Crypto%20AI%20analyst!&embeds[]=${encodeURIComponent(process.env.BASE_URL)}" class="cta">
            Open in Warpcast →
        </a>
        
        <div class="powered-by">
            Powered by FractalSwarm Technology
        </div>
    </div>
</body>
</html>`;

  res.send(frameHtml);
});

// Analytics endpoint
app.get('/analytics', (req, res) => {
  res.json({
    totalInteractions: analytics.totalInteractions,
    uniqueUsers: analytics.uniqueUsers.size,
    buttonClicks: analytics.buttonClicks,
    questionsCount: analytics.questions.length,
    recentQuestions: analytics.questions.slice(-10)
  });
});

// Frame API handler
app.post('/api/frame', async (req, res) => {
  try {
    console.log('📦 Frame request received:', JSON.stringify(req.body, null, 2));
    
    // Extract frame data
    const frameData = req.body.untrustedData || req.body;
    const buttonIndex = frameData.buttonIndex || 1;
    const userFid = frameData.fid || 'anonymous';
    const inputText = frameData.inputText;
    
    // Update analytics
    analytics.totalInteractions++;
    analytics.uniqueUsers.add(userFid);
    analytics.buttonClicks[buttonIndex] = (analytics.buttonClicks[buttonIndex] || 0) + 1;
    
    if (inputText) {
      analytics.questions.push({
        question: inputText,
        fid: userFid,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🎯 Button ${buttonIndex} clicked by FID: ${userFid}`);
    if (inputText) console.log(`💬 Question: ${inputText}`);

    // Handle different button actions
    let responseData = await handleFrameAction(buttonIndex, userFid, inputText);
    
    // Return frame response
    res.setHeader('Content-Type', 'text/html');
    res.send(generateFrameResponse(responseData));

  } catch (error) {
    console.error('❌ Frame handler error:', error);
    
    // Return error frame
    const errorResponse = {
      image: `${process.env.BASE_URL}/images/frame-error.png`,
      buttons: ['🔄 Try Again', '← Back to Menu']
    };
    
    res.setHeader('Content-Type', 'text/html');
    res.send(generateFrameResponse(errorResponse));
  }
});

// Handle frame actions
async function handleFrameAction(buttonIndex, userFid, inputText) {
  const baseUrl = process.env.BASE_URL;
  
  // If there's input text, handle it as a question
  if (inputText) {
    const answer = await askCrestalAgent(`User asked: "${inputText}". Provide a helpful, concise crypto answer.`);
    
    return {
      image: `${baseUrl}/images/frame-answer.png`,
      text: answer,
      buttons: ['🎯 Ask Another', '📊 Market Analysis', '💡 Trading Tips', '← Back']
    };
  }
  
  // Handle button clicks
  switch (buttonIndex) {
    case 1: // Market Analysis
      const analysis = await askCrestalAgent("Provide concise crypto market analysis for today with key insights.");
      return {
        image: `${baseUrl}/images/frame-market.png`,
        text: analysis,
        buttons: ['🔄 Refresh', '🚨 Breaking News', '💡 Tips', '← Back']
      };
      
    case 2: // Breaking News  
      const news = await askCrestalAgent("What are the top 2-3 crypto news developments today?");
      return {
        image: `${baseUrl}/images/frame-news.png`,
        text: news,
        buttons: ['📊 Market Impact', '🔄 Latest', '💡 Tips', '← Back']
      };
      
    case 3: // Trading Tips
      const tips = await askCrestalAgent("Provide 2-3 practical crypto trading tips with risk management.");
      return {
        image: `${baseUrl}/images/frame-tips.png`,
        text: tips,
        buttons: ['📊 Analysis', '🎯 Ask Question', '🔄 More Tips', '← Back']
      };
      
    case 4: // Ask Question
      return {
        image: `${baseUrl}/images/frame-question.png`,
        text: "Ask me anything about crypto! 💬",
        buttons: ['Submit Question'],
        input: 'Ask about any crypto topic...'
      };
      
    default: // Back to main
      return {
        image: `${baseUrl}/images/frame-main.png`,
        text: "Welcome to Kinetic Crypto AI Analyst! ⚡",
        buttons: ['📊 Market Analysis', '🚨 Breaking News', '💡 Trading Tips', '🎯 Ask Question']
      };
  }
}

// Call Crestal AI
async function askCrestalAgent(prompt) {
  try {
    const axios = require('axios');
    
    const response = await axios.post(
      'https://open.service.crestal.network/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are Kinetic Crypto, an expert crypto analyst. Provide concise responses under 280 characters for Warpcast frames. Be professional, insightful, and include "DYOR" for trading advice. Use 1-2 emojis max.`
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 150,
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
    console.error('Crestal error:', error.message);
    return "AI analyst is taking a quick break. Please try again! ⚡";
  }
}

// Generate frame HTML response
function generateFrameResponse(data) {
  const buttons = data.buttons.map((btn, index) => 
    `<meta property="fc:frame:button:${index + 1}" content="${btn}" />`
  ).join('\n    ');
  
  const input = data.input ? 
    `<meta property="fc:frame:input:text" content="${data.input}" />` : '';

  return `<!DOCTYPE html>
<html>
<head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${data.image}" />
    <meta property="fc:frame:post_url" content="${process.env.BASE_URL}/api/frame" />
    ${buttons}
    ${input}
    <title>Kinetic Crypto Response</title>
</head>
<body>
    <h1>Kinetic Crypto AI Analyst</h1>
    <p>${data.text || 'Loading...'}</p>
</body>
</html>`;
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    interactions: analytics.totalInteractions 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Kinetic Crypto Frame running on port ${PORT}`);
  console.log(`🌐 Access at: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
  console.log(`📊 Analytics at: ${process.env.BASE_URL || `http://localhost:${PORT}`}/analytics`);
  console.log('⚡ Ready for Warpcast interactions!');
});

module.exports = app;
