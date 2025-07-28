// server.js - Kinetic Crypto com Cache e Limites
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Stats e Cache
let stats = { interactions: 0, users: new Set(), questions: [] };
let userQuestionCount = new Map(); // Limite de perguntas por usuário
let cache = {
  market: { data: null, timestamp: 0, duration: 10 * 60 * 1000 }, // 10 minutos
  news: { data: null, timestamp: 0, duration: 15 * 60 * 1000 },   // 15 minutos
  tips: { data: null, timestamp: 0, duration: 30 * 60 * 1000 }    // 30 minutos
};

// Limite de perguntas por usuário
const QUESTION_LIMIT = 3;
const QUESTION_RESET_TIME = 24 * 60 * 60 * 1000; // 24 horas

// Função para gerar imagem simples
function createImageUrl(text, bgColor = '1a1a2e') {
  const cleanText = text
    .replace(/[^\w\s-.,!?]/g, '') 
    .substring(0, 100)
    .trim() || 'Kinetic Crypto AI';
  
  const encoded = encodeURIComponent(cleanText);
  return `https://fakeimg.pl/1200x630/${bgColor}/ffffff/?text=${encoded}&font=bebas`;
}

// Verificar se dados do cache ainda são válidos
function isCacheValid(cacheKey) {
  const cacheData = cache[cacheKey];
  if (!cacheData.data) return false;
  
  const now = Date.now();
  return (now - cacheData.timestamp) < cacheData.duration;
}

// Obter dados do cache ou gerar novos
async function getCachedData(cacheKey, prompt) {
  if (isCacheValid(cacheKey)) {
    console.log(`📦 Usando cache para ${cacheKey}`);
    return cache[cacheKey].data;
  }
  
  console.log(`🔄 Atualizando cache para ${cacheKey}`);
  const newData = await askCrestaAI(prompt);
  
  cache[cacheKey] = {
    data: newData,
    timestamp: Date.now(),
    duration: cache[cacheKey].duration
  };
  
  return newData;
}

// Verificar limite de perguntas do usuário
function canUserAsk(fid) {
  const now = Date.now();
  const userQuestions = userQuestionCount.get(fid) || { count: 0, resetTime: now + QUESTION_RESET_TIME };
  
  // Reset se passou 24 horas
  if (now > userQuestions.resetTime) {
    userQuestions.count = 0;
    userQuestions.resetTime = now + QUESTION_RESET_TIME;
  }
  
  return userQuestions.count < QUESTION_LIMIT;
}

// Incrementar contador de perguntas
function incrementUserQuestions(fid) {
  const now = Date.now();
  const userQuestions = userQuestionCount.get(fid) || { count: 0, resetTime: now + QUESTION_RESET_TIME };
  
  userQuestions.count++;
  userQuestionCount.set(fid, userQuestions);
  
  return QUESTION_LIMIT - userQuestions.count; // Perguntas restantes
}

// Função para chamar Crestal AI com timeout mais curto
async function askCrestaAI(prompt) {
  if (!process.env.CRESTAL_API_KEY || process.env.CRESTAL_API_KEY === 'your_crestal_api_key_here') {
    return "AI indisponível. Configure a chave Crestal API.";
  }

  try {
    console.log('🤖 Chamando Crestal AI...');
    
    const apiUrl = process.env.CRESTAL_API_URL_CHATS || 'https://open.service.crestal.network/v1/chat/completions';
    
    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are Kinetic Crypto AI. Respond in English, maximum 180 characters. Be direct and helpful. For trading advice, always include 'DYOR'."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 100,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CRESTAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000 // 8 segundos - mais rápido
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    console.log('✅ AI resposta:', aiResponse);
    return aiResponse;
    
  } catch (error) {
    console.error('❌ Erro Crestal AI:', error.response?.data || error.message);
    
    if (error.code === 'ECONNABORTED') {
      return "AI demorou para responder. Dados em cache disponíveis.";
    }
    
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
    <meta property="fc:frame:image" content="${createImageUrl('Kinetic Crypto AI - Your AI Crypto Analysis Assistant')}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    <meta property="fc:frame:button:1" content="📊 Market Analysis" />
    <meta property="fc:frame:button:2" content="🚨 Crypto News" />
    <meta property="fc:frame:button:3" content="💡 Trading Tips" />
    <meta property="fc:frame:button:4" content="🎯 Ask AI" />
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
        .cache-info {
            background: rgba(0,100,255,0.2);
            padding: 10px;
            border-radius: 8px;
            margin: 10px 0;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <h1>⚡ Kinetic Crypto AI</h1>
    <p>AI-powered crypto analysis using Crestal Network</p>
    
    <div class="status">
        <strong>🟢 Status: ${process.env.CRESTAL_API_KEY && process.env.CRESTAL_API_KEY !== 'your_crestal_api_key_here' ? 'AI ACTIVE' : 'Configure API Key'}</strong><br>
        Frame optimized with cache and limits!
    </div>
    
    <div class="stats">
        <h3>📊 Statistics</h3>
        <p>Interactions: ${stats.interactions}</p>
        <p>Users: ${stats.users.size}</p>
        <p>Questions: ${stats.questions.length}</p>
    </div>
    
    <div class="cache-info">
        <h4>🚀 Optimizations</h4>
        <p>• Cache: Market (10min), News (15min), Tips (30min)</p>
        <p>• Limit: 3 questions per user/24h</p>
        <p>• Timeout: 8 seconds for fast responses</p>
    </div>
    
    <p><strong>How to use:</strong> Share on Warpcast: <code>${baseUrl}</code></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Handler de interações do frame - OTIMIZADO
app.post('/api/frame', async (req, res) => {
  try {
    console.log('🎯 Interação do frame recebida');
    
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
    
    // Processar pergunta do usuário - COM LIMITE
    if (inputText && inputText.length > 0) {
      console.log('📝 Processing user question');
      
      if (!canUserAsk(fid)) {
        aiResponse = "Daily limit of 3 questions reached. Use automated analysis or come back tomorrow!";
        buttons = ['📊 Market Analysis', '🚨 Crypto News', '💡 Trading Tips', '🏠 Main Menu'];
      } else {
        const remaining = incrementUserQuestions(fid);
        stats.questions.push({ question: inputText, fid, timestamp: new Date() });
        
        // Chamada direta para pergunta (sem cache)
        aiResponse = await askCrestaAI(`User asked about crypto: "${inputText}". Provide helpful and direct analysis.`);
        aiResponse += ` (${remaining} questions left today)`;
        
        buttons = ['🎯 Ask Another', '📊 Market Analysis', '💡 Trading Tips', '🏠 Main Menu'];
      }
      
    } else {
      // Processar cliques nos botões - COM CACHE
      switch (buttonIndex) {
        case 1: // Market Analysis - CACHE 10min
          console.log('📊 Market analysis (cached)');
          aiResponse = await getCachedData('market', 
            "Provide current crypto market analysis with key insights, prices and trends."
          );
          buttons = ['🔄 Refresh', '🚨 Crypto News', '💡 Trading Tips', '🏠 Main Menu'];
          break;
          
        case 2: // Crypto News - CACHE 15min
          console.log('🚨 Crypto news (cached)');
          aiResponse = await getCachedData('news',
            "What are today's top crypto news stories? Summarize the most important developments."
          );
          buttons = ['📊 Market Impact', '🔄 More News', '💡 Trading Tips', '🏠 Main Menu'];
          break;
          
        case 3: // Trading Tips - CACHE 30min
          console.log('💡 Trading tips (cached)');
          aiResponse = await getCachedData('tips',
            "Give practical crypto trading tips with risk management. Include DYOR reminder."
          );
          buttons = ['📊 Market Analysis', '🎯 Ask AI', '🔄 More Tips', '🏠 Main Menu'];
          break;
          
        case 4: // Ask AI
          console.log('🎯 Question mode activated');
          const remaining = QUESTION_LIMIT - (userQuestionCount.get(fid)?.count || 0);
          aiResponse = `Ask me anything about crypto! You have ${remaining} questions available today.`;
          buttons = ['📤 Submit Question'];
          break;
          
        default: // Main Menu
          console.log('🏠 Back to main menu');
          aiResponse = "Kinetic Crypto AI - Your crypto analysis assistant. Choose an option below!";
          buttons = ['📊 Market Analysis', '🚨 Crypto News', '💡 Trading Tips', '🎯 Ask AI'];
      }
    }
    
    // Gerar HTML da resposta
    const imageUrl = createImageUrl(aiResponse);
    
    const buttonTags = buttons.map((btn, i) => 
      `    <meta property="fc:frame:button:${i + 1}" content="${btn}" />`
    ).join('\n');
    
    // Input apenas no modo "Ask AI"
    const inputTag = (buttonIndex === 4 && !inputText) ? 
      '    <meta property="fc:frame:input:text" content="Ask about crypto trends, DeFi, trading..." />' : '';
    
    const responseHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${imageUrl}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    <meta property="