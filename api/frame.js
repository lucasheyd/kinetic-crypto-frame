// api/frame.js - Ultra Simple Version
export default async function handler(req, res) {
  console.log('Frame called');

  try {
    // Parse básico
    const data = req.body?.untrustedData || req.body || {};
    const buttonIndex = parseInt(data.buttonIndex) || 1;
    const inputText = data.inputText || '';
    
    console.log('Button:', buttonIndex, 'Input:', inputText);

    // Respostas fixas (sem AI por enquanto)
    let response = '';
    let buttons = [];
    let hasInput = false;

    if (inputText) {
      response = `You asked: ${inputText}. AI response coming soon!`;
      buttons = ['Ask Another', 'Market', 'Tips', 'Menu'];
    } else {
      switch (buttonIndex) {
        case 1:
          response = 'Market: BTC $43K, ETH $2.6K. Bullish trend continues!';
          buttons = ['Refresh', 'News', 'Tips', 'Menu'];
          break;
        case 2:
          response = 'News: ETF approvals driving growth. DeFi activity up 15%!';
          buttons = ['Market', 'More News', 'Tips', 'Menu'];
          break;
        case 3:
          response = 'Tips: DCA strategy, risk management, DYOR always!';
          buttons = ['Market', 'News', 'Ask AI', 'Menu'];
          break;
        case 4:
          response = 'Ask me anything about crypto!';
          buttons = ['Submit'];
          hasInput = true;
          break;
        default:
          response = 'Kinetic Crypto AI - Choose option';
          buttons = ['Market', 'News', 'Tips', 'Ask AI'];
      }
    }

    // Imagem simples
    const imageUrl = `https://dummyimage.com/1200x630/1a4f5f/ffffff&text=Kinetic+Crypto+AI`;

    // HTML mínimo
    let html = `<!DOCTYPE html>
<html>
<head>
<meta property="fc:frame" content="vNext">
<meta property="fc:frame:image" content="${imageUrl}">
<meta property="fc:frame:post_url" content="https://kinetic-warpcast-ai.vercel.app/api/frame">`;

    // Botões
    buttons.forEach((btn, i) => {
      html += `<meta property="fc:frame:button:${i + 1}" content="${btn}">`;
    });

    // Input
    if (hasInput) {
      html += '<meta property="fc:frame:input:text" content="Ask...">';
    }

    html += `</head>
<body>
<h1>Frame Response</h1>
<p>Button: ${buttonIndex}</p>
<p>Input: ${inputText}</p>
<p>Response: ${response}</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);

  } catch (error) {
    console.error('Error:', error);
    res.status(200).send(`<!DOCTYPE html><html><head><meta property="fc:frame" content="vNext"><meta property="fc:frame:image" content="https://dummyimage.com/1200x630/ff0000/ffffff&text=Error"><meta property="fc:frame:button:1" content="Retry"><meta property="fc:frame:post_url" content="https://kinetic-warpcast-ai.vercel.app/api/frame"></head><body>Error</body></html>`);
  }
}