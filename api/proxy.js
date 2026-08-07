// Vercel serverless function to proxy API requests to ngrok backend
const apiUrl = 'https://slackness-shown-tree.ngrok-free.dev';

export default async function handler(req, res) {
  // Only allow GET requests for now
  if (req.method !== 'GET' && req.method !== 'OPTIONS') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  try {
    // Get the path from query parameter (e.g., /api/proxy?path=/api/health)
    const path = req.query.path || '/api/health';
    const fullUrl = `${apiUrl}${path}`;

    console.log(`Proxying: ${fullUrl}`);

    // Fetch from the ngrok backend
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ error: error.message });
  }
}
