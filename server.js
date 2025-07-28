// server.js - Minimal Debug Version
const express = require(‘express’);
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple stats
let stats = { interactions: 0 };

// Simple image URL
function createImageUrl(text) {
const cleanText = text.replace(/[^\w\s]/g, ‘’).substring(0, 80) || ‘Test’;
return `https://fakeimg.pl/1200x630/1a1a2e/ffffff/?text=${encodeURIComponent(cleanText)}`;
}

// Test endpoint
app.get(’/test’, (req, res) => {
res.json({
status: ‘working’,
timestamp: new Date().toISOString()
});
});

// Main page - MINIMAL
app.get(’/’, (req, res) => {
const baseUrl = process.env.BASE_URL || ‘https://kinetic-warpcast-ai.vercel.app’;

const html = `<!DOCTYPE html>

<html>
<head>
    <meta charset="UTF-8">
    <title>Kinetic Crypto AI - Debug</title>

```
<!-- Frame Meta Tags -->
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="${createImageUrl('Kinetic Crypto AI - Debug Mode')}" />
<meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
<meta property="fc:frame:button:1" content="Test Button" />
<meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
```

</head>
<body>
    <h1>⚡ Kinetic Crypto AI - Debug Mode</h1>
    <p>Testing basic functionality...</p>
    <p>Base URL: ${baseUrl}</p>
    <p>Interactions: ${stats.interactions}</p>

```
<h3>Test Endpoints:</h3>
<ul>
    <li><a href="/test">/test</a></li>
    <li><a href="/health">/health</a></li>
    <li><a href="/debug">/debug</a></li>
</ul>
```

</body>
</html>`;

try {
res.setHeader(‘Content-Type’, ‘text/html; charset=utf-8’);
res.send(html);
} catch (error) {
console.error(‘Error in main route:’, error);
res.status(500).json({ error: error.message });
}
});

// Frame handler - MINIMAL
app.post(’/api/frame’, (req, res) => {
try {
console.log(‘Frame request received’);
console.log(‘Body:’, JSON.stringify(req.body, null, 2));

```
stats.interactions++;

const baseUrl = process.env.BASE_URL || 'https://kinetic-warpcast-ai.vercel.app';

const responseHtml = `<!DOCTYPE html>
```

<html>
<head>
    <meta charset="utf-8" />
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${createImageUrl('Frame working! Click count: ' + stats.interactions)}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    <meta property="fc:frame:button:1" content="Click Again" />
    <meta property="fc:frame:button:2" content="Reset" />
    <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
</head>
<body>
    <h1>Frame Response</h1>
    <p>Interaction #${stats.interactions}</p>
    <p>Working correctly!</p>
</body>
</html>`;

```
res.setHeader('Content-Type', 'text/html; charset=utf-8');
res.setHeader('Cache-Control', 'no-cache');
res.status(200).send(responseHtml);
```

} catch (error) {
console.error(‘Frame error:’, error);
res.status(500).json({ error: error.message, stack: error.stack });
}
});

// Health endpoint
app.get(’/health’, (req, res) => {
try {
res.json({
status: ‘healthy’,
interactions: stats.interactions,
timestamp: new Date().toISOString(),
env: {
NODE_ENV: process.env.NODE_ENV,
BASE_URL: process.env.BASE_URL,
hasCresta: !!process.env.CRESTAL_API_KEY
}
});
} catch (error) {
res.status(500).json({ error: error.message });
}
});

// Debug endpoint
app.get(’/debug’, (req, res) => {
try {
res.json({
message: ‘Debug endpoint working’,
stats: stats,
timestamp: new Date().toISOString(),
process: {
version: process.version,
platform: process.platform,
uptime: process.uptime()
}
});
} catch (error) {
res.status(500).json({ error: error.message });
}
});

// Catch all other routes
app.use((req, res) => {
res.status(404).json({
error: ‘Not found’,
path: req.path,
method: req.method
});
});

// Error handler
app.use((err, req, res, next) => {
console.error(‘Global error:’, err);
res.status(500).json({
error: ‘Internal server error’,
message: err.message
});
});

// Export for Vercel
module.exports = app;