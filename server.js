require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

let stats = { interactions: 0, users: new Set(), questions: [] };

function createImageUrl(text, bgColor = '1a1a2e') {
  const cleanText = text
    .replace(/[^\w\s-.,!?]/g, '')
    .substring(0, 120)
    .trim() || 'Kinetic Crypto AI';
  const encoded = encodeURIComponent(cleanText);
  return `https://fakeimg.pl/1200x630/${bgColor}/ffffff/?text=${encoded}&font=bebas`;
}

async function askCrestaAI(prompt) {
  if (!process.env.CRESTAL_API_KEY || process.env.CRESTAL_API_KEY === 'your_crestal_api_key_here') {
    return "🤖 AI ready! Configure Crestal API key for live responses.";
  }

  try {
    const apiUrl = process.env.CRESTAL_API_URL_CHATS || 'https://open.service.crestal.network/v1/chat/completions';
    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are Kinetic Crypto AI. Respond in English, max 150 characters. Be helpful. Include 'DYOR' for trading advice."
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

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('❌ Crestal AI error:', error.response?.data || error.message);
    return "🤖 AI temporarily unavailable. Market data coming soon! DYOR always.";
  }
}

app.get('/', (req, res) => {
  const baseUrl = process.env.BASE_URL || 'https://kinetic-warpcast-ai.vercel.app';
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${createImageUrl('⚡ Kinetic Crypto AI - Your AI crypto assistant! Choose an option below.')}" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="📊 Market Analysis" />
  <meta property="fc:frame:button:2" content="🚨 Crypto News" />
  <meta property="fc:frame:button:3" content="💡 Trading Tips" />
  <meta property="fc:frame:button:4" content="🎯 Ask AI" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
  <title>Kinetic Crypto AI</title>
</head>
<body>
  <h1>⚡ Kinetic Crypto AI</h1>
  <p>Test your frame on Warpcast.</p>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Frame endpoint (CORRIGIDO)
app.post('/api/frame', async (req, res) => {
  try {
    const frameData = req.body.untrustedData || req.body.trustedData || req.body;
    const buttonIndex = parseInt(frameData.buttonIndex) || 1;
    const fid = frameData.fid || 'user_' + Date.now();
    const inputText = (frameData.inputText || '').trim();

    stats.interactions++;
    stats.users.add(fid);

    const baseUrl = process.env.BASE_URL || 'https://kinetic-warpcast-ai.vercel.app';
    let aiResponse = '';
    let buttons = [];
    let showInput = false;

    if (inputText && inputText.length > 0) {
      stats.questions.push({ question: inputText, fid, timestamp: new Date() });
      aiResponse = await askCrestaAI(`User asked: "${inputText}".`);
      buttons = ['🎯 Ask Another', '📊 Market Analysis', '💡 Trading Tips', '🏠 Main Menu'];
    } else {
      switch (buttonIndex) {
        case 1:
          aiResponse = await askCrestaAI("Provide crypto market analysis.");
          buttons = ['🔄 Refresh', '🚨 News', '💡 Tips', '🏠 Home'];
          break;
        case 2:
          aiResponse = await askCrestaAI("Give today’s top crypto news.");
          buttons = ['📊 Market Impact', '🔄 More News', '💡 Tips', '🏠 Home'];
          break;
        case 3:
          aiResponse = await askCrestaAI("Share crypto trading tips. Include DYOR.");
          buttons = ['📊 Analysis', '🎯 Ask', '🔄 Tips', '🏠 Home'];
          break;
        case 4:
          aiResponse = "💬 Ask me anything about crypto below!";
          buttons = ['📤 Submit'];
          showInput = true;
          break;
        default:
          aiResponse = "⚡ Kinetic Crypto AI. Choose an option:";
          buttons = ['📊 Market Analysis', '🚨 News', '💡 Tips', '🎯 Ask'];
      }
    }

    const imageUrl = createImageUrl(aiResponse);
    const buttonTags = buttons.map((b, i) => `<meta property="fc:frame:button:${i + 1}" content="${b}" />`).join('\n');
    const inputTag = showInput ? `<meta property="fc:frame:input:text" content="Ask about DeFi, BTC, ETH..." />` : '';

    const responseHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
  ${buttonTags}
  ${inputTag}
  <title>AI Response</title>
</head>
<body>
  <p>${aiResponse}</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(responseHtml);
  } catch (err) {
    console.error("Frame error:", err.message);
    const imageUrl = createImageUrl('Error occurred! Try again.');
    const errorHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:button:1" content="🔄 Try Again" />
  <meta property="fc:frame:button:2" content="🏠 Home" />
  <meta property="fc:frame:post_url" content="${process.env.BASE_URL}/api/frame" />
  <title>Error</title>
</head>
<body>
  <p>Error: ${err.message}</p>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(errorHtml);
  }
});

// Export for Vercel
module.exports = app;