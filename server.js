// server.js - Working Frame with Dynamic Images
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple analytics
let stats = {
  interactions: 0,
  uniqueUsers: new Set(),
  questions: []
};

// Generate dynamic image URL (no files needed!)
function generateImageUrl(text, bgColor = '1a1a2e', textColor = 'ffffff') {
  const encodedText = encodeURIComponent(text.substring(0, 100));
  return `https://via.placeholder.com/1200x630/${bgColor}/${textColor}?text=${encodedText}`;
}

// Call Crestal AI
async function askCrestalAgent(prompt) {
  if (!process.env.CRESTAL_API_KEY || process.env.CRESTAL_API_KEY === 'your_crestal_api_key_here') {
    return "🤖 Kinetic Crypto AI is ready! (Add your Crestal API key to enable AI responses) ⚡";
  }

  try {
    console.log('🤖 Calling Crestal AI...');
    
    const response = await axios.post(
      'https://open.service.crestal.network/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are Kinetic Crypto, an expert crypto analyst. Respond in under 250 characters. Be professional and include 'DYOR' for trading advice. Use 1-2 emojis."
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
    console.error('❌ Crestal error:', error.message);
    return "🤖 AI analyst is taking a break. Try again soon! ⚡";
  }
}

// Main frame page
app.get('/', (req, res) => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  
  res.send(`<!DOCTYPE html>
<html>
<head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${generateImageUrl('⚡ Kinetic Crypto AI Analyst - Click buttons to interact!')}" />
    <meta property="fc:frame:button:1" content="📊 Market Analysis" />
    <meta property="fc:frame:button:2" content="🚨 Breaking News" />
    <meta property="fc:frame:button:3" content="💡 Trading Tips" />
    <meta property="fc:frame:button:4" content="🎯 Ask Question" />
    <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
    <title>Kinetic Crypto Frame</title>
</head>
<body>
    <h1>⚡ Kinetic Crypto AI Analyst</h1>
    <p>Interactive crypto insights powered by AI</p>
    <p>📊 Stats: ${stats.interactions} interactions, ${stats.uniqueUsers.size} users</p>
    <p>🔗 Frame URL: ${baseUrl}</p>
    <p>🎯 Status: ${process.env.CRESTAL_API_KEY && process.env.CRESTAL_API_KEY !== 'your_crestal_api_key_here' ? '✅ AI Ready' : '⚠️ Add Crestal API Key'}</p>
</body>
</html>`);
});

// Frame interaction handler
app.post('/api/frame', async (req, res) => {
  try {
    console.log('📦 Frame interaction received:', JSON.stringify(req.body, null, 2));
    
    // Extract button data (different formats possible)
    const frameData = req.body.untrustedData || req.body;
    const buttonIndex = frameData.buttonIndex || frameData.button || 1;
    const userFid = frameData.fid || 'anonymous';
    const inputText = frameData.inputText || frameData.text;
    
    // Update stats
    stats.interactions++;
    stats.uniqueUsers.add(userFid);
    
    console.log(`🎯 Button ${buttonIndex} clicked by FID: ${userFid}`);
    if (inputText) {
      console.log(`💬 Input: ${inputText}`);
      stats.questions.push({ question: inputText, fid: userFid, time: new Date() });
    }

    const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
    let responseData;

    // Handle different interactions
    if (inputText) {
      // User asked a question
      const answer = await askCrestalAgent(`User asked: "${inputText}". Provide a helpful crypto answer.`);
      responseData = {
        image: generateImageUrl(`Q: ${inputText.substring(0, 50)}... A: ${answer}`, '0f3460', 'ffffff'),
        buttons: ['🎯 Ask Another', '📊 Market Analysis', '💡 Tips', '← Back']
      };
    } else {
      // Handle button clicks
      switch (parseInt(buttonIndex)) {
        case 1: // Market Analysis
          const analysis = await askCrestalAgent("Provide current crypto market analysis with key insights for today.");
          responseData = {
            image: generateImageUrl(`📊 Market Analysis: ${analysis}`, '1a5f4a', 'ffffff'),
            buttons: ['🔄 Refresh', '🚨 News', '💡 Tips', '← Back']
          };
          break;
          
        case 2: // Breaking News
          const news = await askCrestalAgent("What are the top 2-3 crypto news developments today?");
          responseData = {
            image: generateImageUrl(`🚨 Breaking News: ${news}`, '5f1a1a', 'ffffff'),
            buttons: ['📊 Impact', '🔄 Latest', '💡 Tips', '← Back']
          };
          break;
          
        case 3: // Trading Tips
          const tips = await askCrestalAgent("Provide 2-3 practical crypto trading tips with risk management.");
          responseData = {
            image: generateImageUrl(`💡 Trading Tips: ${tips}`, '4a1a5f', 'ffffff'),
            buttons: ['📊 Analysis', '🎯 Ask Question', '🔄 More', '← Back']
          };
          break;
          
        case 4: // Ask Question
          responseData = {
            image: generateImageUrl('🎯 Ask me anything about crypto! Type your question below.', '5f4a1a', 'ffffff'),
            buttons: ['Submit Question'],
            input: 'Ask about any crypto topic...'
          };
          break;
          
        default: // Back to main
          responseData = {
            image: generateImageUrl('⚡ Kinetic Crypto AI Analyst - Choose an option below!', '1a1a2e', 'ffffff'),
            buttons: ['📊 Market Analysis', '🚨 Breaking News', '💡 Trading Tips', '🎯 Ask Question']
          };
      }
    }

    // Generate frame response HTML
    const buttons = responseData.buttons.map((btn, i) => 
      `<meta property="fc:frame:button:${i + 1}" content="${btn}" />`
    ).join('\n    ');
    
    const input = responseData.input ? 
      `<meta property="fc:frame:input:text" content="${responseData.input}" />` : '';

    const frameHtml = `<!DOCTYPE html>
<html>
<head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${responseData.image}" />
    <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
    ${buttons}
    ${input}
    <title>Kinetic Crypto Response</title>
</head>
<body>
    <h1>Kinetic Crypto AI Response</h1>
    <p>Interaction processed successfully!</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(frameHtml);

  } catch (error) {
    console.error('❌ Frame error:', error);
    
    const errorHtml = `<!DOCTYPE html>
<html>
<head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${generateImageUrl('❌ Error occurred. Try again!', 'ff0000', 'ffffff')}" />
    <meta property="fc:frame:button:1" content="🔄 Try Again" />
    <meta property="fc:frame:button:2" content="← Back to Menu" />
    <meta property="fc:frame:post_url" content="${process.env.BASE_URL || `http://localhost:${PORT}`}/api/frame" />
</head>
<body><h1>Error</h1></body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(errorHtml);
  }
});

// Analytics endpoint
app.get('/analytics', (req, res) => {
  res.json({
    totalInteractions: stats.interactions,
    uniqueUsers: stats.uniqueUsers.size,
    questionsCount: stats.questions.length,
    recentQuestions: stats.questions.slice(-5).map(q => ({
      question: q.question,
      time: q.time
    }))
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    interactions: stats.interactions,
    aiEnabled: !!(process.env.CRESTAL_API_KEY && process.env.CRESTAL_API_KEY !== 'your_crestal_api_key_here')
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Kinetic Crypto Frame running on port ${PORT}`);
  console.log(`🌐 URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
  console.log(`🤖 AI: ${process.env.CRESTAL_API_KEY && process.env.CRESTAL_API_KEY !== 'your_crestal_api_key_here' ? 'Enabled' : 'Add API key to enable'}`);
  console.log('⚡ Ready for Warpcast interactions!');
});

module.exports = app;