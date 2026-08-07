// API Configuration
// Production API URL (ngrok tunnel to local backend)
const API_BASE = process.env.REACT_APP_API_URL || 'https://slackness-shown-tree.ngrok-free.dev';

async function fetchJson(path) {
  const headers = {};
  // Add ngrok bypass header if using ngrok tunnel
  if (API_BASE && API_BASE.includes('ngrok')) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  
  const response = await fetch(`${API_BASE}${path}`, { headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || body.message || `Request failed: ${response.status}`);
  }
  return response.json();
}

export const api = {
  health: () => fetchJson('/api/health'),
  dashboard: () => fetchJson('/api/dashboard'),
  customers: () => fetchJson('/api/customers'),
  products: () => fetchJson('/api/products'),
  categories: () => fetchJson('/api/categories'),
  invoices: () => fetchJson('/api/invoices'),
  invoiceDetails: (id) => fetchJson(`/api/invoices/${id}/details`),
};
