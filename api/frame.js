// api/frame.js - Only Chat Feature
export default async function handler(req, res) {
  console.log('Chat-only frame called');

  try {
    // Parse básico
    const data = req.body?.untrustedData || req.body || {};
    const buttonIndex = parseInt(data.buttonIndex) || 1;
    const inputText = data.inputText?.trim() || '';
    
    console.log('Button:', buttonIndex, 'Input:', inputText);

    let response = '';
    let buttons = [];
    let hasInput = false;

    // APENAS CHAT - 2 estados possíveis
    if (inputText) {
      // Usuário fez uma pergunta
      console.log('User asked:', inputText);
      response = await callAI(inputText);
      buttons = ['Ask Another Question'];
    } else {
      // Estado inicial - mostrar input
      response = 'Ask me anything about crypto!';
      buttons = ['Submit Question'];
      hasInput = true;
    }

    // Imagem fixa simples
    const imageUrl = 'https://dummyimage.com/1200x630/6f42c1/ffffff&text=Kinetic+Crypto+AI+Chat';

    // HTML super simples
    let html = `<!DOCTYPE html>
<html>
<head>
<meta property="fc:frame" content="vNext">
<meta property="fc:frame:image" content="${imageUrl}">
<meta property="fc:frame:post_url" content="https://kinetic-warpcast-ai.vercel.app/api/frame">`;

    // Só um botão
    html += `<meta property="fc:frame:button:1" content="${buttons[0]}">`;

    // Input se necessário
    if (hasInput) {
      html += '<meta property="fc:frame:input:text" content="Ask about crypto...">';
    }

    html += `</head>
<body>
<h1>Kinetic Crypto Chat</h1>
<p>Input: ${inputText || 'none'}</p>
<p>Response: ${response}</p>
<p>Has Input: ${hasInput}</p>
</body>
</html>`;

    console.log('Sending response');
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);

  } catch (error) {
    console.error('Error:', error);
    
    const errorHtml = `<!DOCTYPE html>
<html>
<head>
<meta property="fc:frame" content="vNext">
<meta property="fc:frame:image" content="https://dummyimage.com/1200x630/ff0000/ffffff&text=Error">
<meta property="fc:frame:button:1" content="Try Again">
<meta property="fc:frame:post_url" content="https://kinetic-warpcast-ai.vercel.app/api/frame">
</head>
<body>Error: ${error.message}</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(errorHtml);
  }
}

// Função AI simplificada
async function callAI(question) {
  console.log('Calling AI with question:', question);

  // Verificar API key
  if (!process.env.CRESTAL_API_KEY || process.env.CRESTAL_API_KEY === 'your_crestal_api_key_here') {
    console.log('No valid API key');
    return 'AI not configured. Add your Crestal API key to chat with me!';
  }

  try {
    console.log('Making Crestal API call...');
    
    const axios = require('axios');
    const response = await axios.post(
      'https://open.service.crestal.network/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful crypto AI. Answer in 100 characters max. Include DYOR for trading advice.'
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: 50
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CRESTAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const aiAnswer = response.data.choices[0].message.content;
    console.log('AI answered:', aiAnswer);
    return aiAnswer;

  } catch (error) {
    console.error('AI call failed:', error.message);
    
    if (error.response?.status === 401) {
      return 'Invalid API key. Check your Crestal credentials!';
    } else if (error.response?.status === 429) {
      return 'Rate limit reached. Try again in a moment!';
    } else {
      return 'AI temporarily down. Try again soon!';
    }
  }
}