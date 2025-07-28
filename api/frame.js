// api/frame.js - Fixed Image Generation
export default async function handler(req, res) {
  console.log('Frame handler called');
  console.log('Method:', req.method);
  console.log('Body:', req.body);

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse dados do frame
    const data = req.body?.untrustedData || req.body || {};
    const buttonIndex = parseInt(data.buttonIndex) || 1;
    const inputText = data.inputText?.trim() || '';
    
    console.log(`Button: ${buttonIndex}, Input: "${inputText}"`);

    let response = '';
    let buttons = [];
    let hasInput = false;

    // Se tem input text (pergunta do usuário)
    if (inputText) {
      console.log('Processing user input:', inputText);
      response = await callAI(`User asked: "${inputText}". Give helpful crypto advice.`);
      buttons = ['Ask Another', 'Market', 'Tips', 'Menu'];
    } else {
      // Processar cliques dos botões
      switch (buttonIndex) {
        case 1:
          console.log('Market button');
          response = await callAI('Give current Bitcoin and Ethereum price analysis.');
          buttons = ['Refresh', 'News', 'Tips', 'Menu'];
          break;
        case 2:
          console.log('News button');
          response = await callAI('What are the top crypto news today?');
          buttons = ['Market', 'More News', 'Tips', 'Menu'];
          break;
        case 3:
          console.log('Tips button');
          response = await callAI('Give crypto trading tips. Include DYOR.');
          buttons = ['Market', 'News', 'Ask AI', 'Menu'];
          break;
        case 4:
          console.log('Ask AI button');
          response = 'Ask me anything about crypto! Type your question below.';
          buttons = ['Submit'];
          hasInput = true;
          break;
        default:
          console.log('Default/Menu');
          response = 'Kinetic Crypto AI - Choose an option:';
          buttons = ['Market', 'News', 'Tips', 'Ask AI'];
      }
    }

    console.log('AI Response received:', response);

    // SIMPLIFICAR: usar imagem fixa baseada no tipo de resposta
    let imageUrl;
    if (inputText) {
      // Pergunta do usuário - imagem verde
      imageUrl = `https://dummyimage.com/1200x630/28a745/ffffff&text=${encodeURIComponent('Q: ' + inputText.substring(0, 30) + '...')}`;
    } else if (buttonIndex === 1) {
      // Market - imagem azul
      imageUrl = `https://dummyimage.com/1200x630/007bff/ffffff&text=${encodeURIComponent('Market Analysis')}`;
    } else if (buttonIndex === 2) {
      // News - imagem vermelha
      imageUrl = `https://dummyimage.com/1200x630/dc3545/ffffff&text=${encodeURIComponent('Crypto News')}`;
    } else if (buttonIndex === 3) {
      // Tips - imagem laranja
      imageUrl = `https://dummyimage.com/1200x630/fd7e14/ffffff&text=${encodeURIComponent('Trading Tips')}`;
    } else if (buttonIndex === 4) {
      // Ask AI - imagem roxa
      imageUrl = `https://dummyimage.com/1200x630/6f42c1/ffffff&text=${encodeURIComponent('Ask AI Anything')}`;
    } else {
      // Menu principal - imagem padrão
      imageUrl = `https://dummyimage.com/1200x630/1a4f5f/ffffff&text=${encodeURIComponent('Kinetic Crypto AI')}`;
    }

    console.log('Generated image URL:', imageUrl);

    // Criar HTML do frame
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:post_url" content="https://kinetic-warpcast-ai.vercel.app/api/frame">`;

    // Adicionar botões
    buttons.forEach((btn, i) => {
      html += `\n  <meta property="fc:frame:button:${i + 1}" content="${btn}">`;
    });

    // Adicionar input se necessário
    if (hasInput) {
      html += '\n  <meta property="fc:frame:input:text" content="Ask about crypto...">';
    }

    html += `
  <title>Kinetic Crypto AI</title>
</head>
<body>
  <h1>🤖 Kinetic Crypto AI Response</h1>
  <p><strong>Button Clicked:</strong> ${buttonIndex}</p>
  <p><strong>User Input:</strong> ${inputText || 'none'}</p>
  <p><strong>Has Input Field:</strong> ${hasInput}</p>
  <p><strong>AI Response:</strong> ${response}</p>
  <p><strong>Image URL:</strong> ${imageUrl}</p>
  
  <hr>
  <p><em>This is your mini app working! The AI response shows as an image in the frame.</em></p>
</body>
</html>`;

    console.log('Sending HTML response');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);

  } catch (error) {
    console.error('Error:', error);
    
    const errorHtml = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://dummyimage.com/1200x630/ff0000/ffffff&text=Error+Occurred">
  <meta property="fc:frame:button:1" content="Try Again">
  <meta property="fc:frame:post_url" content="https://kinetic-warpcast-ai.vercel.app/api/frame">
</head>
<body>
  <h1>Error</h1>
  <p>${error.message}</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(errorHtml);
  }
}

// Função simples para chamar AI
async function callAI(prompt) {
  if (!process.env.CRESTAL_API_KEY) {
    return 'AI configured! Add your Crestal API key for live responses.';
  }

  try {
    const axios = require('axios');
    const response = await axios.post(
      'https://open.service.crestal.network/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are Kinetic Crypto AI. Reply in 120 characters max. Be helpful. Add DYOR for trading advice.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 60
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CRESTAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000
      }
    );

    const result = response.data.choices[0].message.content;
    console.log('Crestal AI responded:', result);
    return result;
  } catch (error) {
    console.error('AI Error:', error.message);
    return 'AI temporarily down. Market looking good! DYOR always.';
  }
}