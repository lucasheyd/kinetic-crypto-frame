export default async function handler(req, res) {
  console.log('Frame request:', req.body);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = req.body.untrustedData || req.body;
  const buttonIndex = parseInt(data.buttonIndex) || 1;
  
  // Call Crestal AI
  let aiResponse = "🤖 AI response here";
  
  if (process.env.CRESTAL_API_KEY) {
    try {
      const axios = require('axios');
      const response = await axios.post(
        'https://open.service.crestal.network/v1/chat/completions',
        {
          model: "gpt-4",
          messages: [
            {
              role: "system", 
              content: "You are Kinetic Crypto AI. Respond in under 200 characters. Be helpful and professional."
            },
            {
              role: "user",
              content: buttonIndex === 1 ? "Provide crypto market analysis" : 
                      buttonIndex === 2 ? "Latest crypto news" :
                      buttonIndex === 3 ? "Trading tips" : "General crypto advice"
            }
          ],
          max_tokens: 100
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.CRESTAL_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      aiResponse = response.data.choices[0].message.content;
    } catch (error) {
      aiResponse = "🤖 AI temporarily unavailable. Try again!";
    }
  }

  const html = `<!DOCTYPE html>
<html>
<head>
    <meta property="fc:frame" content="vNext">
    <meta property="fc:frame:image" content="https://via.placeholder.com/1200x630/1a4f5f/ffffff?text=${encodeURIComponent(aiResponse.substring(0, 80))}">
    <meta property="fc:frame:button:1" content="🔄 Refresh">
    <meta property="fc:frame:button:2" content="💡 Tips">
    <meta property="fc:frame:button:3" content="🎯 Ask AI">
    <meta property="fc:frame:button:4" content="← Menu">
    <meta property="fc:frame:post_url" content="https://kinetic-warpcast-ai.vercel.app/api/frame">
</head>
<body>
    <p>AI Response: ${aiResponse}</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
