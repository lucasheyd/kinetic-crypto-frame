// api/frame.js - Versão Simples e Funcional
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
      console.log('Processing user input');
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

    // Criar imagem limpa
    const imageText = response.replace(/[^\w\s]/g, '').substring(0, 80) || 'Kinetic Crypto AI';
    const imageUrl = `https://fakeimg.pl/1200x630/1a4f5f/ffffff/?text=${encodeURIComponent(imageText)}`;

    // Criar HTML do frame
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
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
</head>
<body>
  <h1>Kinetic Crypto AI</h1>
  <p>Button: ${buttonIndex}</p>
  <p>Input: ${inputText || 'none'}</p>
  <p>Has Input Field: ${hasInput}</p>
  <p>Response: ${response}</p>
</body>
</html>`;

    console.log('Sending HTML response');
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);

  } catch (error) {
    console.error('Error:', error);
    
    const errorHtml = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://fakeimg.pl/1200x630/ff0000/ffffff/?text=Error">
  <meta property="fc:frame:button:1" content="Try Again">
  <meta property="fc:frame:post_url" content="https://kinetic-warpcast-ai.vercel.app/api/frame">
</head>
<body>
  <h1>Error</h1>
  <p>${error.message}</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
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

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('AI Error:', error.message);
    return 'AI temporarily down. Market looking good! DYOR always.';
  }
}