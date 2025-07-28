export default async function handler(req, res) {
  if (req.method === 'GET') {
    // ✅ Teste de resposta simples no navegador
    return res.status(200).send("<h1>Kinetic AI Frame is online</h1>");
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Frame request:', req.body);

  const data = req.body.untrustedData || req.body;
  const buttonIndex = parseInt(data.buttonIndex) || 1;

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
              content:
                buttonIndex === 1
                  ? "Provide crypto market analysis"
                  : buttonIndex === 2
                  ? "Latest crypto news"
                  : buttonIndex === 3
                  ? "Trading tips"
                  : "General crypto advice"
            }
          ],
          max_tokens: 100
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.CRESTAL_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      aiResponse = response.data.choices[0].message.content;
    } catch (error) {
      console.error('Crestal API error:', error?.response?.data || error.message);
      aiResponse = "🤖 AI temporarily unavailable. Try again!";
    }
  }

  res.status(200).json({
    image: `https://via.placeholder.com/1200x630/1a4f5f/ffffff?text=${encodeURIComponent(
      aiResponse.substring(0, 80)
    )}`,
    postUrl: "https://kinetic-warpcast-ai.vercel.app/api/frame",
    buttons: [
      { label: "🔄 Refresh" },
      { label: "💡 Tips" },
      { label: "🎯 Ask AI" },
      { label: "← Menu" }
    ]
  });
}