// api/frame.js - Warpcast Frame API Handler
require('dotenv').config();
const axios = require('axios');

class KineticCryptoFrame {
  constructor() {
    this.crestalApiKey = process.env.CRESTAL_API_KEY;
    this.baseUrl = process.env.BASE_URL || 'https://your-domain.com';
  }

  // Call Crestal AI for analysis with configurable URLs
  async askCrestalAgent(prompt, options = {}) {
    try {
      // Use environment variables for API URLs
      const apiUrl = process.env.CRESTAL_API_URL_CHATS || 'https://open.service.crestal.network/v1/chat/completions';
      
      const response = await axios.post(
        apiUrl,
        {
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are Kinetic Crypto, an expert crypto analyst powered by FractalSwarm technology.

CONTEXT: You're responding to users in a Warpcast Frame (interactive mini-app).

RESPONSE STYLE:
- Keep responses under 280 characters (Frame limitation)
- Be professional but engaging
- Include specific insights when possible
- Use emojis appropriately (2-3 max)
- Always include "DYOR - Not financial advice" for trading advice
- Be conversational and helpful

CAPABILITIES:
- Real-time market analysis
- Technical analysis insights  
- DeFi opportunities
- Risk assessment
- Breaking news analysis
- Educational explanations

${options.responseType ? `SPECIFIC REQUEST: ${options.responseType}` : ''}`
            },
            {
              role: "user", 
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.crestalApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      }
      return "Analysis temporarily unavailable. Try again in a moment!";

    } catch (error) {
      console.error('❌ Crestal error:', error.message);
      
      // Enhanced error logging for debugging
      if (process.env.DEBUG_MODE === 'true') {
        console.error('🔍 Full error details:', {
          url: process.env.CRESTAL_API_URL_CHATS,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      
      return "AI analyst is taking a quick break. Please try again! ⚡";
    }
  }

  // Get current market data
  async getMarketData() {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true'
      );
      
      return response.data;
    } catch (error) {
      console.error('Market data error:', error.message);
      return null;
    }
  }

  // Generate frame image with dynamic content
  generateFrameImage(content, type = 'analysis') {
    // This would generate a dynamic image with the content
    // For now, return a static image URL
    return `${this.baseUrl}/images/frame-${type}.png`;
  }

  // Handle frame interactions
  async handleFrameAction(buttonIndex, userFid, previousState = null) {
    let response = {
      image: null,
      buttons: [],
      textInput: null,
      postUrl: `${this.baseUrl}/api/frame`
    };

    switch (buttonIndex) {
      case 1: // Market Analysis
        console.log(`📊 Market analysis requested by FID: ${userFid}`);
        
        const marketData = await this.getMarketData();
        let analysisPrompt = "Provide a concise crypto market analysis for today.";
        
        if (marketData) {
          const btcChange = marketData.bitcoin?.usd_24h_change?.toFixed(1) || 'N/A';
          const ethChange = marketData.ethereum?.usd_24h_change?.toFixed(1) || 'N/A';
          const solChange = marketData.solana?.usd_24h_change?.toFixed(1) || 'N/A';
          
          analysisPrompt = `Analyze current crypto market: BTC ${btcChange}%, ETH ${ethChange}%, SOL ${solChange}% (24h changes). Provide key insights and what to watch.`;
        }
        
        const analysis = await this.askCrestalAgent(analysisPrompt, { responseType: 'market_analysis' });
        
        response.image = this.generateFrameImage(analysis, 'market');
        response.buttons = [
          { text: "🔄 Refresh Analysis" },
          { text: "🚨 Breaking News" },
          { text: "💡 Trading Tips" },
          { text: "← Back to Menu" }
        ];
        break;

      case 2: // Breaking News
        console.log(`🚨 Breaking news requested by FID: ${userFid}`);
        
        const newsPrompt = "What are the most important crypto news developments today? Provide 2-3 key updates.";
        const news = await this.askCrestalAgent(newsPrompt, { responseType: 'breaking_news' });
        
        response.image = this.generateFrameImage(news, 'news');
        response.buttons = [
          { text: "📊 Market Impact" },
          { text: "🔄 Latest News" },
          { text: "💡 Trading Tips" },
          { text: "← Back to Menu" }
        ];
        break;

      case 3: // Trading Tips
        console.log(`💡 Trading tips requested by FID: ${userFid}`);
        
        const tipsPrompt = "Provide 2-3 practical crypto trading tips for today's market conditions. Include risk management.";
        const tips = await this.askCrestalAgent(tipsPrompt, { responseType: 'trading_tips' });
        
        response.image = this.generateFrameImage(tips, 'tips');
        response.buttons = [
          { text: "📊 Market Analysis" },
          { text: "🎯 Ask Question" },
          { text: "🔄 More Tips" },
          { text: "← Back to Menu" }
        ];
        break;

      case 4: // Ask Question
        console.log(`🎯 Question mode activated by FID: ${userFid}`);
        
        response.image = this.generateFrameImage("Ask me anything about crypto! Type your question below.", 'question');
        response.textInput = "Ask about any crypto topic...";
        response.buttons = [
          { text: "Submit Question" },
          { text: "📊 Market Analysis" },
          { text: "💡 Trading Tips" },
          { text: "← Back to Menu" }
        ];
        break;

      default: // Back to main menu
        response.image = `${this.baseUrl}/images/frame-main.png`;
        response.buttons = [
          { text: "📊 Market Analysis" },
          { text: "🚨 Breaking News" },
          { text: "💡 Trading Tips" },
          { text: "🎯 Ask Question" }
        ];
    }

    return response;
  }

  // Handle text input (user questions)
  async handleTextInput(inputText, userFid) {
    console.log(`💬 Question from FID ${userFid}: ${inputText}`);
    
    const questionPrompt = `User asked: "${inputText}". Provide a helpful, concise answer about this crypto topic.`;
    const answer = await this.askCrestalAgent(questionPrompt, { responseType: 'user_question' });
    
    return {
      image: this.generateFrameImage(answer, 'answer'),
      buttons: [
        { text: "🎯 Ask Another" },
        { text: "📊 Market Analysis" },
        { text: "💡 Trading Tips" },
        { text: "← Back to Menu" }
      ],
      postUrl: `${this.baseUrl}/api/frame`
    };
  }
}

// Express.js API handler
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const frame = new KineticCryptoFrame();
    
    // Parse frame data from request
    const { buttonIndex, fid, inputText, state } = req.body;
    
    let response;
    
    if (inputText) {
      // Handle user question
      response = await frame.handleTextInput(inputText, fid);
    } else {
      // Handle button click
      response = await frame.handleFrameAction(buttonIndex, fid, state);
    }

    // Return frame response
    res.status(200).json({
      type: 'frame',
      frameUrl: `${frame.baseUrl}/frame`,
      imageUrl: response.image,
      buttons: response.buttons.map((btn, index) => ({
        index: index + 1,
        title: btn.text || btn,
        action: 'post'
      })),
      input: response.textInput ? {
        text: response.textInput
      } : undefined,
      postUrl: response.postUrl
    });

  } catch (error) {
    console.error('Frame handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Example usage for testing
if (require.main === module) {
  console.log('🎯 Kinetic Crypto Frame API ready!');
  console.log('📊 Features: Market analysis, breaking news, trading tips, Q&A');
  console.log('⚡ Powered by FractalSwarm technology');
}
