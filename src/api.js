// Direct connection to ngrok backend with proper headers
const NGROK_URL = 'https://slackness-shown-tree.ngrok-free.dev';

async function fetchJson(path) {
  try {
    const response = await fetch(`${NGROK_URL}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${path}]:`, error);
    throw new Error(`Failed to fetch ${path}: ${error.message}`);
  }
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
