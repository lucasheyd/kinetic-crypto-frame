// server.js - Working Frame with Functional Buttons
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Stats
let stats = { interactions: 0, users: new Set(), questions: [] };

// Simple image URL generator
function createImageUrl(text, bgColor = '1a1a2e') {
  const cleanText = text
    .replace(/[^\w\s-.,!?]/g, '')
    .substring(0, 120)
    .trim() || 'Kinetic Crypto AI';

  const encoded = encodeURIComponent(cleanText);
  return `https://fakeimg.pl/1200x630/${bgColor}/ffffff/?text=${encoded}&font=bebas`;
}

// Call Crestal AI (simplified for debugging)
async function askCrestaAI(prompt) {
  if (!process.env.CRESTAL_API_KEY || process.env.CRESTAL_API_KEY === 'your_crestal_api_key_here') {
    return "🤖 AI ready! Configure Crestal API key for live responses.";
  }

  try {
    console.log('🤖 Calling Crestal AI with prompt:', prompt.substring(0, 50) + '…');

    const apiUrl = process.env.CRESTAL_API_URL_CHATS || 'https://open.service.crestal.network/v1/chat/completions';

    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are Kinetic Crypto AI. Respond in English, maximum 150 characters. Be helpful. Include 'DYOR' for trading advice."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 80,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CRESTAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    console.log('✅ AI response received:', aiResponse.substring(0, 50) + '...');
    return aiResponse;

  } catch (error) {
    console.error('❌ Crestal AI error:', error.response?.data || error.message);
    return "🤖 AI temporarily unavailable. Market data coming soon! DYOR always.";
  }
}

// Main page
app.get('/', (req, res) => {
  const baseUrl = process.env.BASE_URL || 'https://kinetic-warpcast-ai.vercel.app';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kinetic Crypto AI</title>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${createImageUrl('⚡ Kinetic Crypto AI - Your AI crypto assistant! Choose an option below.')}" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="📊 Market Analysis" />
  <meta property="fc:frame:button:2" content="🚨 Crypto News" />
  <meta property="fc:frame:button:3" content="💡 Trading Tips" />
  <meta property="fc:frame:button:4" content="🎯 Ask AI" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
  <style>
    body { font-family: system-ui; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: white; text-align: center; }
    .status { background: rgba(0,255,0,0.2); padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #00ff00; }
    .stats { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>⚡ Kinetic Crypto AI</h1>
  <p>AI-powered crypto analysis using Crestal Network</p>
  <div class="status">
    <strong>🟢 Status: ${process.env.CRESTAL_API_KEY && process.env.CRESTAL_API_KEY !== 'your_crestal_api_key_here' ? 'AI ACTIVE' : 'Demo Mode'}</strong><br>
    Frame ready for Warpcast interactions!
  </div>
  <div class="stats">
    <h3>📊 Live Stats</h3>
    <p>Interactions: ${stats.interactions}</p>
    <p>Users: ${stats.users.size}</p>
    <p>Questions: ${stats.questions.length}</p>
  </div>
  <p><strong>Test in Warpcast:</strong> <code>${baseUrl}</code></p>
  <p>🎯 Click the frame buttons to test AI responses!</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    interactions: stats.interactions,
    users: stats.users.size,
    questions: stats.questions.length,
    ai_ready: !!(process.env.CRESTAL_API_KEY && process.env.CRESTAL_API_KEY !== 'your_crestal_api_key_here'),
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  res.json({
    status: 'debug_active',
    stats: {
      interactions: stats.interactions,
      users: stats.users.size,
      questions: stats.questions.length,
      recentQuestions: stats.questions.slice(-3)
    },
    config: {
      baseUrl: process.env.BASE_URL,
      hasCrestaKey: !!(process.env.CRESTAL_API_KEY && process.env.CRESTAL_API_KEY !== 'your_crestal_api_key_here'),
      environment: process.env.NODE_ENV
    },
    timestamp: new Date().toISOString()
  });
});

// Test AI endpoint
app.get('/test-ai', async (req, res) => {
  try {
    const response = await askCrestaAI("Test: Respond with current Bitcoin price and market sentiment.");
    res.json({
      status: 'success',
      ai_response: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Export for Vercel
module.exports = app;