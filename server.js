// server.js - Fixed Ask AI Frame Error
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Stats
let stats = { interactions: 0, users: new Set(), questions: [], apiCalls: 0, cacheSaves: 0 };

// Cache system
let aiCache = {
  market: { data: null, timestamp: 0, duration: 15 * 60 * 1000, hits: 0 },
  news: { data: null, timestamp: 0, duration: 30 * 60 * 1000, hits: 0 },
  tips: { data: null, timestamp: 0, duration: 60 * 60 * 1000, hits: 0 }
};

// User question limits
let userQuestionCount = new Map();
const DAILY_QUESTION_LIMIT = 3;

// Simple image URL generator
function createImageUrl(text, bgColor = '1a1a2e') {
  const cleanText = text
    .replace(/[^\w\s-.,!?]/g, '')
    .substring(0, 120)
    .trim() || 'Kinetic Crypto AI';

  const encoded = encodeURIComponent(cleanText);
  return `https://fakeimg.pl/1200x630/${bgColor}/ffffff/?text=${encoded}&font=bebas`;
}

// Check if cache is valid
function isCacheValid(cacheKey) {
  const cache = aiCache[cacheKey];
  if (!cache || !cache.data) return false;
  
  const now = Date.now();
  const isValid = (now - cache.timestamp) < cache.duration;
  
  if (isValid) {
    cache.hits++;
    stats.cacheSaves++;
    console.log(`💰 CACHE HIT! Saved 1 CAP. ${cacheKey} used ${cache.hits}x`);
  }
  
  return isValid;
}

// Check daily question limit
function canUserAskQuestion(fid) {
  const today = new Date().toDateString();
  const userKey = `${fid}-${today}`;
  const count = userQuestionCount.get(userKey) || 0;
  return count < DAILY_QUESTION_LIMIT;
}

// Increment user questions
function incrementUserQuestions(fid) {
  const today = new Date().toDateString();
  const userKey = `${fid}-${today}`;
  const count = userQuestionCount.get(userKey) || 0;
  userQuestionCount.set(userKey, count + 1);
  return DAILY_QUESTION_LIMIT - (count + 1);
}

// Call Crestal AI with cache control
async function askCrestaAI(prompt, cacheKey = null) {
  // Check cache first
  if (cacheKey && isCacheValid(cacheKey)) {
    return aiCache[cacheKey].data;
  }

  if (!process.env.CRESTAL_API_KEY || process.env.CRESTAL_API_KEY === 'your_crestal_api_key_here') {
    return "AI ready! Configure Crestal API key for live responses.";
  }

  try {
    console.log(`💸 USING CAP! Calling Crestal AI for: ${cacheKey || 'custom question'}`);
    stats.apiCalls++;

    const apiUrl = process.env.CRESTAL_API_URL_CHATS || 'https://open.service.crestal.network/v1/chat/completions';

    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are Kinetic Crypto AI. Respond in English, maximum 150 characters. Be helpful. Include DYOR for trading advice."
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
    console.log(`✅ Response received (CAP used): ${aiResponse.substring(0, 50)}...`);
    
    // Save to cache if it's a cacheable type
    if (cacheKey && aiCache[cacheKey]) {
      aiCache[cacheKey].data = aiResponse;
      aiCache[cacheKey].timestamp = Date.now();
      aiCache[cacheKey].hits = 0;
      console.log(`💾 Saved to cache: ${cacheKey} (valid for ${aiCache[cacheKey].duration/60000} min)`);
    }
    
    return aiResponse;

  } catch (error) {
    console.error('❌ Crestal AI error:', error.response?.data || error.message);
    
    // If failed but has old cache, use it
    if (cacheKey && aiCache[cacheKey] && aiCache[cacheKey].data) {
      console.log(`♻️ Using old cache for ${cacheKey}`);
      return aiCache[cacheKey].data + " (cached)";
    }
    
    return "AI temporarily unavailable. Market data coming soon! DYOR always.";
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
  <meta property="fc:frame:image" content="${createImageUrl('Kinetic Crypto AI - Your AI crypto assistant! Choose an option below.')}" />
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
    .cache-info { background: rgba(255,165,0,0.2); padding: 10px; border-radius: 8px; margin: 10px 0; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>⚡ Kinetic Crypto AI</h1>
  <p>AI-powered crypto analysis using Crestal Network</p>
  <div class="status">
    <strong>🟢 Status: ${process.env.CRESTAL_API_KEY && process.env.CRESTAL_API_KEY !== 'your_crestal_api_key_here' ? 'AI ACTIVE' : 'Demo Mode'}</strong><br>
    Frame ready with smart caching to save CAPs!
  </div>
  <div class="stats">
    <h3>📊 Live Stats</h3>
    <p>Interactions: ${stats.interactions}</p>
    <p>Users: ${stats.users.size}</p>
    <p>Questions: ${stats.questions.length}</p>
  </div>
  <div class="cache-info">
    <h4>💰 CAP Economy</h4>
    <p>API Calls: ${stats.apiCalls} | Cache Saves: ${stats.cacheSaves}</p>
    <p>Market Cache: ${aiCache.market.hits} hits | News: ${aiCache.news.hits} hits | Tips: ${aiCache.tips.hits} hits</p>
  </div>
  <p><strong>Test in Warpcast:</strong> <code>${baseUrl}</code></p>
  <p>🎯 Smart caching saves your CAPs!</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Frame interaction handler - FIXED ASK AI
app.post('/api/frame', async (req, res) => {
  try {
    console.log('🎯 === FRAME INTERACTION START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Parse frame data
    const frameData = req.body.untrustedData || req.body.trustedData || req.body;
    const buttonIndex = parseInt(frameData.buttonIndex) || 1;
    const fid = frameData.fid || 'user_' + Date.now();
    const inputText = (frameData.inputText || '').trim();
    
    // Update stats
    stats.interactions++;
    stats.users.add(fid);
    
    console.log(`📊 Button: ${buttonIndex}, User: ${fid}, Input: "${inputText}"`);
    
    const baseUrl = process.env.BASE_URL || 'https://kinetic-warpcast-ai.vercel.app';
    let aiResponse = '';
    let buttons = [];
    let showInput = false;
    
    // Handle user input (custom questions - USES CAP)
    if (inputText && inputText.length > 0) {
      console.log('📝 Processing user question');
      
      if (!canUserAskQuestion(fid)) {
        aiResponse = `Daily limit reached! You can ask ${DAILY_QUESTION_LIMIT} questions per day. Use cached analysis or try tomorrow!`;
        buttons = ['📊 Market Analysis', '🚨 Crypto News', '💡 Trading Tips', '🏠 Main Menu'];
      } else {
        const remaining = incrementUserQuestions(fid);
        stats.questions.push({ question: inputText, fid, timestamp: new Date() });
        
        // Custom question - NO CACHE (uses CAP)
        aiResponse = await askCrestaAI(`User asked: "${inputText}". Provide helpful crypto analysis and advice.`);
        aiResponse += ` (${remaining} questions left today)`;
        
        buttons = ['🎯 Ask Another', '📊 Market Analysis', '💡 Trading Tips', '🏠 Main Menu'];
      }
      
    } else {
      // Handle button clicks - WITH CACHE (saves CAPs)
      switch (buttonIndex) {
        case 1: // Market Analysis - CACHE 15min
          console.log('📊 Market Analysis (checking cache...)');
          aiResponse = await askCrestaAI(
            "Provide current crypto market analysis with key insights, Bitcoin and Ethereum prices, and market trends.",
            'market'
          );
          buttons = ['🔄 Refresh Analysis', '🚨 Latest News', '💡 Trading Tips', '🏠 Main Menu'];
          break;
          
        case 2: // Crypto News - CACHE 30min
          console.log('🚨 Crypto News (checking cache...)');
          aiResponse = await askCrestaAI(
            "What are today's most important crypto news stories? Include market impact and key developments.",
            'news'
          );
          buttons = ['📊 Market Impact', '🔄 More News', '💡 Trading Tips', '🏠 Main Menu'];
          break;
          
        case 3: // Trading Tips - CACHE 1h
          console.log('💡 Trading Tips (checking cache...)');
          aiResponse = await askCrestaAI(
            "Give practical crypto trading tips with risk management strategies. Include DYOR reminder and portfolio advice.",
            'tips'
          );
          buttons = ['📊 Market Analysis', '🎯 Ask AI Question', '🔄 More Tips', '🏠 Main Menu'];
          break;
          
        case 4: // Ask AI - FIXED INPUT HANDLING
          console.log('🎯 Ask AI mode activated');
          const questionsLeft = DAILY_QUESTION_LIMIT - (userQuestionCount.get(`${fid}-${new Date().toDateString()}`) || 0);
          aiResponse = `Ask me anything about crypto! You have ${questionsLeft} personalized questions left today. Type below and click Submit.`;
          buttons = ['📤 Submit Question'];
          showInput = true;
          break;
          
        default: // Main Menu
          console.log('🏠 Main menu requested');
          aiResponse = "Kinetic Crypto AI - Your crypto analysis assistant! Choose an option:";
          buttons = ['📊 Market Analysis', '🚨 Crypto News', '💡 Trading Tips', '🎯 Ask AI'];
      }
    }
    
    console.log(`🤖 AI Response: ${aiResponse.substring(0, 60)}...`);
    console.log(`🔘 Buttons: ${buttons.join(', ')}`);
    console.log(`💬 Show Input: ${showInput}`);
    
    // Generate image with AI response
    const imageUrl = createImageUrl(aiResponse);
    
    // Build button meta tags - CAREFUL WITH QUOTES
    const buttonTags = buttons.map((btn, i) => {
      // Clean button text of problematic characters
      const cleanBtn = btn.replace(/['"]/g, '');
      return `    <meta property="fc:frame:button:${i + 1}" content="${cleanBtn}" />`;
    }).join('\n');
    
    // Add input field ONLY for Ask AI mode - FIXED SYNTAX
    const inputTag = showInput ? 
      '    <meta property="fc:frame:input:text" content="Ask about crypto trends, DeFi, trading..." />' : '';
    
    // Build complete frame response - CLEAN HTML
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
    <h1>Kinetic Crypto AI Response</h1>
    <p>Interaction: ${stats.interactions}</p>
    <p>Button: ${buttonIndex}</p>
    <p>Show Input: ${showInput}</p>
    <p>CAPs Used: ${stats.apiCalls}</p>
    <p>Cache Saves: ${stats.cacheSaves}</p>
    <p>Response: ${aiResponse.substring(0, 100)}...</p>
</body>
</html>`;

    console.log('📏 Response HTML length:', responseHtml.length);
    console.log('✅ Sending frame response...');
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).send(responseHtml);
    
    console.log('🎯 === FRAME INTERACTION END ===\n');
    
  } catch (error) {
    console.error('❌ FRAME ERROR:', error);
    console.error('Stack:', error.stack);
    
    // Send simple error frame
    const baseUrl = process.env.BASE_URL || 'https://kinetic-warpcast-ai.vercel.app';
    const errorHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${createImageUrl('Error occurred! Please try again.')}" />
    <meta property="fc:frame:button:1" content="Try Again" />
    <meta property="fc:frame:button:2" content="Main Menu" />
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

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    interactions: stats.interactions,
    users: stats.users.size,
    questions: stats.questions.length,
    ai_ready: !!(process.env.CRESTAL_API_KEY && process.env.CRESTAL_API_KEY !== 'your_crestal_api_key_here'),
    caps_economy: {
      api_calls: stats.apiCalls,
      cache_saves: stats.cacheSaves,
      savings_ratio: stats.cacheSaves > 0 ? (stats.cacheSaves / (stats.apiCalls + stats.cacheSaves) * 100).toFixed(1) + '%' : '0%'
    },
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
      api_calls: stats.apiCalls,
      cache_saves: stats.cacheSaves
    },
    cache_status: {
      market: { 
        valid: isCacheValid('market'), 
        age_minutes: aiCache.market.timestamp ? Math.floor((Date.now() - aiCache.market.timestamp) / 60000) : 0,
        hits: aiCache.market.hits 
      },
      news: { 
        valid: isCacheValid('news'), 
        age_minutes: aiCache.news.timestamp ? Math.floor((Date.now() - aiCache.news.timestamp) / 60000) : 0,
        hits: aiCache.news.hits 
      },
      tips: { 
        valid: isCacheValid('tips'), 
        age_minutes: aiCache.tips.timestamp ? Math.floor((Date.now() - aiCache.tips.timestamp) / 60000) : 0,
        hits: aiCache.tips.hits 
      }
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
      caps_used: stats.apiCalls,
      cache_saves: stats.cacheSaves,
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