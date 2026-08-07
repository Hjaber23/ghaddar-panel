// Use Vercel API proxy to reach ngrok backend
// This avoids CORS issues by proxying through Vercel's own domain
const API_BASE = '/api/proxy?path=';

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${encodeURIComponent(path)}`);
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
