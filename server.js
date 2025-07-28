// server.js - Kinetic Crypto com Crestal AI
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Stats
let stats = { interactions: 0, users: new Set(), questions: [] };

// Função para gerar imagem simples sem emojis
function createImageUrl(text, bgColor = '1a1a2e') {
  // Remove emojis e caracteres especiais
  const cleanText = text
    .replace(/[^\w\s-.,!?]/g, '') 
    .substring(0, 100)
    .trim() || 'Kinetic Crypto AI';
  
  const encoded = encodeURIComponent(cleanText);
  return `https://fakeimg.pl/1200x630/${bgColor}/ffffff/?text=${encoded}&font=bebas`;
}

// Função para chamar Crestal AI
async function askCrestaAI(prompt) {
  if (!process.env.CRESTAL_API_KEY || process.env.CRESTAL_API_KEY === 'your_crestal_api_key_here') {
    return "AI indisponível. Configure a chave Crestal API.";
  }

  try {
    console.log('🤖 Chamando Crestal AI...');
    
    const response = await axios.post(
      'https://open.service.crestal.network/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é Kinetic Crypto AI. Responda em português, máximo 200 caracteres. Seja útil e profissional. Sempre inclua 'DYOR' para conselhos de trading."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 120,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CRESTAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    console.log('✅ AI resposta:', aiResponse);
    return aiResponse;
    
  } catch (error) {
    console.error('❌ Erro Crestal AI:', error.response?.data || error.message);
    return "AI temporariamente indisponível. Tente novamente!";
  }
}

// Página principal
app.get('/', (req, res) => {
  const baseUrl = process.env.BASE_URL || 'https://kinetic-warpcast-ai.vercel.app';
  
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kinetic Crypto AI</title>
    
    <!-- Frame Meta Tags -->
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${createImageUrl('Kinetic Crypto AI - Analise de criptomoedas com IA')}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    <meta property="fc:frame:button:1" content="📊 Análise Mercado" />
    <meta property="fc:frame:button:2" content="🚨 Notícias" />
    <meta property="fc:frame:button:3" content="💡 Dicas Trading" />
    <meta property="fc:frame:button:4" content="🎯 Perguntar IA" />
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
</head>
<body>
    <h1>⚡ Kinetic Crypto AI</h1>
    <p>Análise de criptomoedas com IA da Crestal Network</p>
    
    <div class="status">
        <strong>🟢 Status: ${process.env.CRESTAL_API_KEY && process.env.CRESTAL_API_KEY !== 'your_crestal_api_key_here' ? 'IA ATIVA' : 'Configure API Key'}</strong><br>
        Frame pronto para interações no Warpcast!
    </div>
    
    <div class="stats">
        <h3>📊 Estatísticas</h3>
        <p>Interações: ${stats.interactions}</p>
        <p>Usuários: ${stats.users.size}</p>
        <p>Perguntas: ${stats.questions.length}</p>
    </div>
    
    <p><strong>Como usar:</strong> Compartilhe esta URL no Warpcast: <code>${baseUrl}</code></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Handler de interações do frame
app.post('/api/frame', async (req, res) => {
  try {
    console.log('🎯 Interação do frame recebida');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    // Parse dos dados do frame
    const frameData = req.body.untrustedData || req.body;
    const buttonIndex = parseInt(frameData.buttonIndex) || 1;
    const fid = frameData.fid || 'anon';
    const inputText = (frameData.inputText || '').trim();
    
    // Atualizar stats
    stats.interactions++;
    stats.users.add(fid);
    
    console.log(`Botão: ${buttonIndex}, Usuário: ${fid}, Input: "${inputText}"`);
    
    const baseUrl = process.env.BASE_URL || 'https://kinetic-warpcast-ai.vercel.app';
    let aiResponse = '';
    let buttons = [];
    
    // Processar pergunta do usuário
    if (inputText && inputText.length > 0) {
      console.log('📝 Processando pergunta do usuário');
      stats.questions.push({ question: inputText, fid, timestamp: new Date() });
      
      aiResponse = await askCrestaAI(`Usuário perguntou sobre crypto: "${inputText}". Forneça análise útil.`);
      buttons = ['🎯 Perguntar Novamente', '📊 Análise Mercado', '💡 Dicas', '🏠 Menu Principal'];
      
    } else {
      // Processar cliques nos botões
      switch (buttonIndex) {
        case 1: // Análise do Mercado
          console.log('📊 Gerando análise do mercado');
          aiResponse = await askCrestaAI("Forneça análise atual do mercado de criptomoedas com principais insights e tendências.");
          buttons = ['🔄 Atualizar', '🚨 Notícias', '💡 Dicas', '🏠 Menu Principal'];
          break;
          
        case 2: // Notícias
          console.log('🚨 Buscando notícias crypto');
          aiResponse = await askCrestaAI("Quais são as principais notícias de criptomoedas hoje? Resuma os desenvolvimentos mais importantes.");
          buttons = ['📊 Impacto no Mercado', '🔄 Mais Notícias', '💡 Dicas', '🏠 Menu Principal'];
          break;
          
        case 3: // Dicas de Trading
          console.log('💡 Gerando dicas de trading');
          aiResponse = await askCrestaAI("Dê dicas práticas de trading de criptomoedas com gestão de risco. Inclua lembrete DYOR.");
          buttons = ['📊 Análise', '🎯 Perguntar IA', '🔄 Mais Dicas', '🏠 Menu Principal'];
          break;
          
        case 4: // Perguntar IA
          console.log('🎯 Modo pergunta ativado');
          aiResponse = "Faça sua pergunta sobre criptomoedas! Digite abaixo e clique em Enviar.";
          buttons = ['📤 Enviar Pergunta'];
          break;
          
        default: // Menu Principal
          console.log('🏠 Voltando ao menu principal');
          aiResponse = "Kinetic Crypto AI - Seu assistente de análise de criptomoedas. Escolha uma opção abaixo!";
          buttons = ['📊 Análise Mercado', '🚨 Notícias', '💡 Dicas Trading', '🎯 Perguntar IA'];
      }
    }
    
    // Gerar HTML da resposta
    const imageUrl = createImageUrl(aiResponse);
    
    const buttonTags = buttons.map((btn, i) => 
      `    <meta property="fc:frame:button:${i + 1}" content="${btn}" />`
    ).join('\n');
    
    // Adicionar campo de input apenas no modo "Perguntar IA"
    const inputTag = (buttonIndex === 4 && !inputText) ? 
      '    <meta property="fc:frame:input:text" content="Pergunte sobre crypto, DeFi, trading..." />' : '';
    
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
    <title>Kinetic Crypto AI</title>
</head>
<body>
    <h1>Resposta da IA</h1>
    <p>Interação #${stats.interactions}</p>
    <p>Usuário: ${fid}</p>
    <p>Resposta IA: ${aiResponse}</p>
    ${inputText ? `<p>Pergunta: "${inputText}"</p>` : ''}
</body>
</html>`;

    console.log('✅ Enviando resposta do frame');
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(responseHtml);
    
  } catch (error) {
    console.error('❌ Erro no frame:', error);
    
    const baseUrl = process.env.BASE_URL || 'https://kinetic-warpcast-ai.vercel.app';
    const errorHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${createImageUrl('Erro ocorreu! Tente novamente.')}" />
    <meta property="fc:frame:button:1" content="🔄 Tentar Novamente" />
    <meta property="fc:frame:button:2" content="🏠 Menu Principal" />
    <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
</head>
<body><p>Erro: ${error.message}</p></body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(errorHtml);
  }
});

// Endpoints de saúde e debug
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    interactions: stats.interactions,
    users: stats.users.size,
    questions: stats.questions.length,
    ai_ready: !!(process.env.CRESTAL_API_KEY && process.env.CRESTAL_API_KEY !== 'your_crestal_api_key_here'),
    timestamp: new Date().toISOString()
  });
});

app.get('/debug', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    baseUrl: process.env.BASE_URL,
    hasCrestaKey: !!(process.env.CRESTAL_API_KEY && process.env.CRESTAL_API_KEY !== 'your_crestal_api_key_here'),
    stats: {
      interactions: stats.interactions,
      users: stats.users.size,
      questions: stats.questions.length,
      recentQuestions: stats.questions.slice(-3)
    }
  });
});

// Teste da API Crestal
app.get('/test-ai', async (req, res) => {
  try {
    const testResponse = await askCrestaAI("Teste de conexão com Crestal AI. Responda 'OK' se funcionando.");
    res.json({ 
      status: 'success', 
      ai_response: testResponse,
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

// Export para Vercel
module.exports = app;