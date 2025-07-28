export default function handler(req, res) {
  console.log('Frame request:', req.body);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const html = `<!DOCTYPE html>
<html>
<head>
    <meta property="fc:frame" content="vNext">
    <meta property="fc:frame:image" content="https://via.placeholder.com/1200x630/00aa00/ffffff?text=✅+AI+Response+Working!">
    <meta property="fc:frame:button:1" content="🔥 It Works!">
    <meta property="fc:frame:button:2" content="← Back">
    <meta property="fc:frame:post_url" content="https://kinetic-warpcast-ai.vercel.app/api/frame">
</head>
<body>
    <p>Frame interaction successful!</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
