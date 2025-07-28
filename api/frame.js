// frame.js - Fixed Warpcast Frame Handler
export default async function handler(req, res) {
  try {
    console.log('Frame request received:', JSON.stringify(req.body, null, 2));

    const method = req.method;

    if (method !== 'POST' && method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Parse frame data
    const data = req.body?.untrustedData || req.body || {};
    const buttonIndex = parseInt(data.buttonIndex) || 1;
    const fid = data.fid || 'user';
    const inputText = (data.inputText || '').trim();

    console.log(`Button: ${buttonIndex}, User: ${fid}, Input: "${inputText}"`);

    let aiResponse = "AI response here";
    let buttons = [];
    let showInput = false;

    // Handle user input (Ask AI questions)
    if (inputText && inputText.length > 0) {
      console.log('Processing user question');
      aiResponse = await getAIResponse(`User asked: "${inputText}". Provide helpful crypto analysis.`);
      buttons = ['Ask Another', 'Market Analysis', 'Trading Tips', 'Main Menu'];
      
    } else {
      // Handle button clicks
      switch (buttonIndex) {
        case 1: // Market Analysis
          console.log('Market Analysis requested');
          aiResponse = await getAIResponse("Provide current crypto market analysis with Bitcoin and Ethereum prices and trends.");
          buttons = ['Refresh Analysis', 'Latest News', 'Trading Tips', 'Main Menu'];
          break;
          
        case 2: // Crypto News  
          console.log('Crypto News requested');
          aiResponse = await getAIResponse("What are todays most important crypto news stories? Include market impact.");
          buttons = ['Market Impact', 'More News', 'Trading Tips', 'Main Menu'];
          break;
          
        case 3: // Trading Tips
          console.log('Trading Tips requested');
          aiResponse = await getAIResponse("Give practical crypto trading tips with risk management. Include DYOR reminder.");
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

    // Generate clean image URL
    const imageUrl = createCleanImageUrl(aiResponse);
    
    // Build button meta tags
    const buttonTags = buttons.map((btn, i) => 
      `  <meta property="fc:frame:button:${i + 1}" content="${btn}">`
    ).join('\n');
    
    // Add input field only for Ask AI mode
    const inputTag = showInput ? 
      '  <meta property="fc:frame:input:text" content="Ask about crypto trends, DeFi, trading...">' : '';

    // Build clean frame response
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:post_url" content="https://kinetic-warpcast-ai.vercel.app/api/frame">
${buttonTags}
${inputTag}
  <title>Kinetic Crypto AI</title>
</head>
<body>
  <h1>Kinetic Crypto AI Response</h1>
  <p>Button: ${buttonIndex}</p>
  <p>Input: ${inputText}</p>
  <p>AI Response: ${aiResponse}</p>
</body>
</html>`;

    console.log('Sending frame response...');
    
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.status(200).send(html);

  } catch (error) {
    console.error('Frame error:', error);
    
    // Send error frame
    const errorHtml = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://fakeimg.pl/1200x630/ff4444/ffffff/?text=Error+occurred+Please+try+again">
  <meta property="fc:frame:button:1" content="Try Again">
  <meta property="fc:frame:button:2" content="Main Menu">
  <meta property="fc:frame:post_url" content="https://kinetic-warpcast-ai.vercel.app/api/frame">
  <title>Frame Error</title>
</head>
<body>
  <h1>Frame Error</h1>
  <p>Error: ${error.message}</p>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(errorHtml);
  }
}

// Helper function to call Crestal AI
async function getAIResponse(prompt) {
  if (!process.env.CRESTAL_API_KEY || process.env.CRESTAL_API_KEY === 'your_crestal_api_key_here') {
    return "AI ready! Configure Crestal API key for live responses.";
  }

  try {
    const axios = require('axios');
    const response = await axios.post(
      'https://open.service.crestal.network/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are Kinetic Crypto AI. Respond in English, maximum 150 characters. Be helpful. Include DYOR for trading advice."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 80,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CRESTAL_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    console.log('AI response received:', aiResponse.substring(0, 50) + '...');
    return aiResponse;

  } catch (error) {
    console.error('Crestal AI error:', error.message);
    return "AI temporarily unavailable. Market data coming soon! DYOR always.";
  }
}

// Helper function to create clean image URL
function createCleanImageUrl(text) {
  const cleanText = text
    .replace(/[^\w\s-.,!?]/g, '') 
    .substring(0, 100)
    .trim() || 'Kinetic Crypto AI';
  
  const encoded = encodeURIComponent(cleanText);
  return `https://fakeimg.pl/1200x630/1a4f5f/ffffff/?text=${encoded}&font=bebas`;
}