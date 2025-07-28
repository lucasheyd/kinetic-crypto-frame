// api/frame.js - Debug Crestal Connection
export default async function handler(req, res) {
  console.log('🎯 Frame handler called');
  console.log('Method:', req.method);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Environment check:', {
    hasCrestaKey: !!process.env.CRESTAL_API_KEY,
    keyLength: process.env.CRESTAL_API_KEY?.length || 0,
    keyPreview: process.env.CRESTAL_API_KEY?.substring(0, 10) + '...' || 'missing'
  });

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse dados do frame
    const data = req.body?.untrustedData || req.body || {};
    const buttonIndex = parseInt(data.buttonIndex) || 1;
    const inputText = data.inputText?.trim() || '';
    
    console.log(`📊 Parsed - Button: ${buttonIndex}, Input: "${inputText}"`);

    let response = '';
    let buttons = [];
    let hasInput = false;
    let aiCalled = false;

    // Se tem input text (pergunta do usuário)
    if (inputText) {
      console.log('📝 Processing user input:', inputText);
      console.log('💸 About to call AI for user question...');
      
      const aiResult = await callAI(`User asked about crypto: "${inputText}". Provide helpful analysis and advice.`);
      response = aiResult.response;
      aiCalled = aiResult.called;
      
      buttons = ['Ask Another', 'Market', 'Tips', 'Menu'];
    } else {
      // Processar cliques dos botões
      switch (buttonIndex) {
        case 1:
          console.log('📊 Market button clicked');
          console.log('💸 About to call AI for market analysis...');
          
          const marketResult = await callAI('Provide current Bitcoin and Ethereum price analysis with key market trends.');
          response = marketResult.response;
          aiCalled = marketResult.called;
          
          buttons = ['Refresh', 'News', 'Tips', 'Menu'];
          break;
          
        case 2:
          console.log('🚨 News button clicked');
          console.log('💸 About to call AI for crypto news...');
          
          const newsResult = await callAI('What are the most important cryptocurrency news stories today? Include market impact.');
          response = newsResult.response;
          aiCalled = newsResult.called;
          
          buttons = ['Market', 'More News', 'Tips', 'Menu'];
          break;
          
        case 3:
          console.log('💡 Tips button clicked');
          console.log('💸 About to call AI for trading tips...');
          
          const tipsResult = await callAI('Give practical cryptocurrency trading tips with risk management strategies. Include DYOR reminder.');
          response = tipsResult.response;
          aiCalled = tipsResult.called;
          
          buttons = ['Market', 'News', 'Ask AI', 'Menu'];
          break;
          
        case 4:
          console.log('🎯 Ask AI button clicked');
          response = 'Ask me anything about crypto! Type your question below and click Submit.';
          buttons = ['Submit'];
          hasInput = true;
          aiCalled = false;
          break;
          
        default:
          console.log('🏠 Default/Menu');
          response = 'Kinetic Crypto AI - Your crypto analysis assistant! Choose an option below:';
          buttons = ['Market', 'News', 'Tips', 'Ask AI'];
          aiCalled = false;
      }
    }

    console.log('🤖 Final response:', response);
    console.log('🔥 AI was called:', aiCalled);

    // Criar imagem baseada no tipo de resposta
    let imageUrl;
    let imageText = '';
    
    if (inputText) {
      imageText = `Q: ${inputText} | A: ${response.substring(0, 50)}...`;
      imageUrl = `https://dummyimage.com/1200x630/28a745/ffffff&text=${encodeURIComponent(imageText)}`;
    } else if (buttonIndex === 1) {
      imageText = `Market: ${response.substring(0, 80)}`;
      imageUrl = `https://dummyimage.com/1200x630/007bff/ffffff&text=${encodeURIComponent(imageText)}`;
    } else if (buttonIndex === 2) {
      imageText = `News: ${response.substring(0, 80)}`;
      imageUrl = `https://dummyimage.com/1200x630/dc3545/ffffff&text=${encodeURIComponent(imageText)}`;
    } else if (buttonIndex === 3) {
      imageText = `Tips: ${response.substring(0, 80)}`;
      imageUrl = `https://dummyimage.com/1200x630/fd7e14/ffffff&text=${encodeURIComponent(imageText)}`;
    } else if (buttonIndex === 4) {
      imageText = 'Ask AI: Type your crypto question below';
      imageUrl = `https://dummyimage.com/1200x630/6f42c1/ffffff&text=${encodeURIComponent(imageText)}`;
    } else {
      imageText = 'Kinetic Crypto AI - Choose an option';
      imageUrl = `https://dummyimage.com/1200x630/1a4f5f/ffffff&text=${encodeURIComponent(imageText)}`;
    }

    console.log('🖼️ Generated image URL:', imageUrl);

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
      html += '\n  <meta property="fc:frame:input:text" content="Ask about crypto trends, prices, trading...">';
    }

    html += `
  <title>Kinetic Crypto AI</title>
</head>
<body>
  <h1>🤖 Kinetic Crypto AI Debug</h1>
  <p><strong>Button:</strong> ${buttonIndex}</p>
  <p><strong>User Input:</strong> ${inputText || 'none'}</p>
  <p><strong>AI Called:</strong> ${aiCalled ? '✅ YES' : '❌ NO'}</p>
  <p><strong>Has Input Field:</strong> ${hasInput}</p>
  <p><strong>Response:</strong> ${response}</p>
  <p><strong>Image Text:</strong> ${imageText}</p>
  
  <hr>
  <h3>🔧 Debug Info</h3>
  <p><strong>Crestal Key:</strong> ${process.env.CRESTAL_API_KEY ? '✅ Configured' : '❌ Missing'}</p>
  <p><strong>Key Length:</strong> ${process.env.CRESTAL_API_KEY?.length || 0}</p>
</body>
</html>`;

    console.log('✅ Sending HTML response');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);

  } catch (error) {
    console.error('❌ Frame Error:', error);
    console.error('Stack:', error.stack);
    
    const errorHtml = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://dummyimage.com/1200x630/ff0000/ffffff&text=Error+Check+Logs">
  <meta property="fc:frame:button:1" content="Try Again">
  <meta property="fc:frame:post_url" content="https://kinetic-warpcast-ai.vercel.app/api/frame">
</head>
<body>
  <h1>❌ Frame Error</h1>
  <p><strong>Error:</strong> ${error.message}</p>
  <p><strong>Stack:</strong> ${error.stack}</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(errorHtml);
  }
}

// Função para chamar AI com debug completo
async function callAI(prompt) {
  console.log('🤖 callAI function started');
  console.log('📝 Prompt:', prompt);
  
  // Verificar API key
  if (!process.env.CRESTAL_API_KEY) {
    console.log('❌ No Crestal API key found');
    return {
      response: '🔑 Crestal API key not configured. Add your key to environment variables.',
      called: false
    };
  }
  
  if (process.env.CRESTAL_API_KEY === 'your_crestal_api_key_here') {
    console.log('❌ Placeholder API key detected');
    return {
      response: '🔑 Please replace placeholder API key with your real Crestal key.',
      called: false
    };
  }

  console.log('✅ API key found, length:', process.env.CRESTAL_API_KEY.length);

  try {
    console.log('📡 Making request to Crestal API...');
    
    const axios = require('axios');
    const requestData = {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are Kinetic Crypto AI. Respond in English, maximum 120 characters. Be helpful and professional. Include DYOR for trading advice.'
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      max_tokens: 60,
      temperature: 0.7
    };
    
    console.log('📋 Request data:', JSON.stringify(requestData, null, 2));
    
    const response = await axios.post(
      'https://open.service.crestal.network/v1/chat/completions',
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CRESTAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log('✅ Crestal API responded successfully');
    console.log('📊 Response status:', response.status);
    console.log('📦 Response data:', JSON.stringify(response.data, null, 2));

    const aiResponse = response.data.choices[0].message.content;
    console.log('🎯 Final AI response:', aiResponse);
    
    return {
      response: aiResponse,
      called: true
    };
    
  } catch (error) {
    console.error('❌ Crestal API Error:', error);
    console.error('📋 Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    let errorMessage = 'AI temporarily unavailable. ';
    
    if (error.response?.status === 401) {
      errorMessage = '🔑 Invalid Crestal API key. ';
    } else if (error.response?.status === 429) {
      errorMessage = '⏱️ Rate limit reached. ';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = '⏰ Request timeout. ';
    }
    
    return {
      response: errorMessage + 'Try again! DYOR always.',
      called: false
    };
  }
}