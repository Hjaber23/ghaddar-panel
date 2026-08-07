// Vercel serverless function to proxy API requests to ngrok backend
const apiUrl = 'https://slackness-shown-tree.ngrok-free.dev';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get the path from query parameter
    const path = req.query.path ? decodeURIComponent(req.query.path) : '/api/health';
    const fullUrl = `${apiUrl}${path}`;

    console.log(`[Proxy] Forwarding: ${req.method} ${fullUrl}`);

    // Fetch from the ngrok backend
    const response = await fetch(fullUrl, {
      method: req.method || 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.text();

    // Try to parse as JSON, otherwise return as text
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = { raw: data };
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(response.status).json(jsonData);
  } catch (error) {
    console.error('[Proxy] Error:', error.message);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: error.message });
  }
}
