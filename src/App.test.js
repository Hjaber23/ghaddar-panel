import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./api', () => ({
  api: {
    health: () => Promise.resolve({ status: 'ok', database: 'MotorsCompanyDB' }),
    dashboard: () => Promise.resolve({
      totalCustomers: 50,
      totalProducts: 15,
      totalInvoices: 100,
      totalRevenue: 50000,
    }),
    customers: () => Promise.resolve([]),
    products: () => Promise.resolve([]),
    invoices: () => Promise.resolve([]),
    invoiceDetails: () => Promise.resolve([]),
  },
}));

test('renders app title', async () => {
  render(<App />);
  expect(await screen.findByText(/Motors & Accessories Company/i)).toBeInTheDocument();
});
