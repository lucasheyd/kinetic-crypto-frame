require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Kinetic Crypto Frame</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://via.placeholder.com/1200x630/1a1a2e/ffffff?text=Kinetic+Crypto" />
        <meta property="fc:frame:button:1" content="📊 Market Analysis" />
        <meta property="fc:frame:post_url" content="${process.env.BASE_URL || 'http://localhost:3000'}/api/frame" />
      </head>
      <body>
        <h1>⚡ Kinetic Crypto Frame</h1>
        <p>Interactive AI crypto analyst for Warpcast</p>
        <p>Status: Ready for deployment!</p>
      </body>
    </html>
  `);
});

app.post('/api/frame', (req, res) => {
  res.send('Frame interaction received!');
});

app.listen(PORT, () => {
  console.log(`🚀 Kinetic Crypto Frame running on port ${PORT}`);
});
