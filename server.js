// server.js - Fixed Quotes and Warpcast Communication
require(‘dotenv’).config();
const express = require(‘express’);
const axios = require(‘axios’);
const app = express();

// Middleware
app.use(express.json({ limit: ‘10mb’ }));
app.use(express.urlencoded({ extended: true, limit: ‘10mb’ }));

// Stats
let stats = { interactions: 0, users: new Set(), questions: [] };

// Simple image URL generator - FIXED QUOTES
function createImageUrl(text, bgColor = ‘1a1a2e’) {
const cleanText = text
.replace(/[^\w\s-.,!?]/g, ‘’)
.substring(0, 120)
.trim() || ‘Kinetic Crypto AI’;

const encoded = encodeURIComponent(cleanText);
return `https://fakeimg.pl/1200x630/${bgColor}/ffffff/?text=${encoded}&font=bebas`;
}

// Call Crestal AI
async function askCrestaAI(prompt) {
if (!process.env.CRESTAL_API_KEY || process.env.CRESTAL_API_KEY === ‘your_crestal_api_key_here’) {
return “AI ready! Configure Crestal API key for live responses.”;
}

try {
console.log(‘Calling Crestal AI…’);

```
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
console.log('AI response received');
return aiResponse;
```

} catch (error) {
console.error(‘Crestal AI error:’, error.message);
return “AI temporarily unavailable. Market data coming soon! DYOR always.”;
}
}

// Main page
app.get(’/’, (req, res) => {
const baseUrl = process.env.BASE_URL || ‘https://kinetic-warpcast-ai.vercel.app’;

const html = `<!DOCTYPE html>

<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kinetic Crypto AI</title>

```
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="${createImageUrl('Kinetic Crypto AI - Your crypto assistant! Choose an option below.')}" />
<meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
<meta property="fc:frame:button:1" content="Market Analysis" />
<meta property="fc:frame:button:2" content="Crypto News" />
<meta property="fc:frame:button:3" content="Trading Tips" />
<meta property="fc:frame:button:4" content="Ask AI" />
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
```

</head>
<body>
    <h1>Kinetic Crypto AI</h1>
    <p>AI-powered crypto analysis using Crestal Network</p>

```
<div class="status">
    <strong>Status: ${process.env.CRESTAL_API_KEY && process.env.CRESTAL_API_KEY !== 'your_crestal_api_key_here' ? 'AI ACTIVE' : 'Demo Mode'}</strong><br>
    Frame ready for Warpcast interactions!
</div>

<div class="stats">
    <h3>Live Stats</h3>
    <p>Interactions: ${stats.interactions}</p>
    <p>Users: ${stats.users.size}</p>
    <p>Questions: ${stats.questions.length}</p>
</div>

<p><strong>Test in Warpcast:</strong> ${baseUrl}</p>
<p>Click the frame buttons to test AI responses!</p>
```

</body>
</html>`;

res.setHeader(‘Content-Type’, ‘text/html; charset=utf-8’);
res.send(html);
});

// Frame interaction handler - FIXED QUOTES
app.post(’/api/frame’, async (req, res) => {
try {
console.log(‘Frame interaction received’);

```
// Parse frame data
const frameData = req.body.untrustedData || req.body.trustedData || req.body;
const buttonIndex = parseInt(frameData.buttonIndex) || 1;
const fid = frameData.fid || 'user';
const inputText = (frameData.inputText || '').trim();

// Update stats
stats.interactions++;
stats.users.add(fid);

console.log(`Button: ${buttonIndex}, User: ${fid}`);

const baseUrl = process.env.BASE_URL || 'https://kinetic-warpcast-ai.vercel.app';
let aiResponse = '';
let buttons = [];
let showInput = false;

// Handle user input
if (inputText && inputText.length > 0) {
  console.log('Processing user question');
  stats.questions.push({ question: inputText, fid, timestamp: new Date() });
  
  aiResponse = await askCrestaAI(`User asked: ${inputText}. Provide helpful crypto analysis.`);
  buttons = ['Ask Another', 'Market Analysis', 'Trading Tips', 'Main Menu'];
  
} else {
  // Handle button clicks
  switch (buttonIndex) {
    case 1: // Market Analysis
      console.log('Market Analysis requested');
      aiResponse = await askCrestaAI("Provide current crypto market analysis with Bitcoin and Ethereum prices and trends.");
      buttons = ['Refresh Analysis', 'Latest News', 'Trading Tips', 'Main Menu'];
      break;
      
    case 2: // Crypto News
      console.log('Crypto News requested');
      aiResponse = await askCrestaAI("What are todays most important crypto news stories? Include market impact.");
      buttons = ['Market Impact', 'More News', 'Trading Tips', 'Main Menu'];
      break;
      
    case 3: // Trading Tips
      console.log('Trading Tips requested');
      aiResponse = await askCrestaAI("Give practical crypto trading tips with risk management. Include DYOR reminder.");
      buttons = ['Market Analysis', 'Ask AI Question', 'More Tips', 'Main Menu'];
      break;
      
    case 4: // Ask AI
      console.log('Ask AI mode activated');
      aiResponse = "Ask me anything about crypto! Type your question below and click Submit.";
      buttons = ['Submit Question'];
      showInput = true;
      break;
      
    default: // Main Menu
      console.log('Main menu requested');
      aiResponse = "Kinetic Crypto AI - Your crypto analysis assistant! Choose an option:";
      buttons = ['Market Analysis', 'Crypto News', 'Trading Tips', 'Ask AI'];
  }
}

console.log('AI Response generated');

// Generate image
const imageUrl = createImageUrl(aiResponse);

// Build button HTML - CONSISTENT QUOTES
const buttonTags = buttons.map((btn, i) => 
  `    <meta property="fc:frame:button:${i + 1}" content="${btn}" />`
).join('\n');

// Add input field - CONSISTENT QUOTES
const inputTag = showInput ? 
  '    <meta property="fc:frame:input:text" content="Ask about crypto trends, DeFi, trading..." />' : '';

// Build frame response - CONSISTENT QUOTES
const responseHtml = `<!DOCTYPE html>
```

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
    <p>User: ${fid}</p>
    <p>Button: ${buttonIndex}</p>
    <p>Response: ${aiResponse}</p>
</body>
</html>`;

```
console.log('Sending frame response');

res.setHeader('Content-Type', 'text/html; charset=utf-8');
res.setHeader('Cache-Control', 'no-cache');
res.status(200).send(responseHtml);
```

} catch (error) {
console.error(‘Frame error:’, error.message);

```
// Send error frame - CONSISTENT QUOTES
const baseUrl = process.env.BASE_URL || 'https://kinetic-warpcast-ai.vercel.app';
const errorHtml = `<!DOCTYPE html>
```

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
</body>
</html>`;

```
res.setHeader('Content-Type', 'text/html; charset=utf-8');
res.status(200).send(errorHtml);
```

}
});

// Health endpoint
app.get(’/health’, (req, res) => {
res.json({
status: ‘healthy’,
interactions: stats.interactions,
users: stats.users.size,
questions: stats.questions.length,
ai_ready: !!(process.env.CRESTAL_API_KEY && process.env.CRESTAL_API_KEY !== ‘your_crestal_api_key_here’),
timestamp: new Date().toISOString()
});
});

// Debug endpoint
app.get(’/debug’, (req, res) => {
res.json({
status: ‘active’,
stats: {
interactions: stats.interactions,
users: stats.users.size,
questions: stats.questions.length
},
config: {
baseUrl: process.env.BASE_URL,
hasCrestaKey: !!(process.env.CRESTAL_API_KEY && process.env.CRESTAL_API_KEY !== ‘your_crestal_api_key_here’)
},
timestamp: new Date().toISOString()
});
});

// Export for Vercel
module.exports = app;