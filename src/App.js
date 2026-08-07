import { useEffect, useState } from 'react';
import { api } from './api';
import {
  DashboardStats,
  CustomersTable,
  ProductsTable,
  InvoicesTable,
} from './components/DataViews';
import './App.css';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'customers', label: 'Customers' },
  { id: 'products', label: 'Products' },
  { id: 'invoices', label: 'Invoices' },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [connection, setConnection] = useState({ status: 'checking', message: '' });

  useEffect(() => {
    api.health()
      .then((data) => setConnection({ status: 'ok', message: `Connected to ${data.database}` }))
      .catch((err) => setConnection({ status: 'error', message: err.message }));
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Motors &amp; Accessories Company</h1>
          <p className="subtitle">Sales dashboard — MotorsCompanyDB</p>
        </div>
        <div className={`connection-badge ${connection.status}`}>
          {connection.status === 'checking' && 'Checking database...'}
          {connection.status === 'ok' && connection.message}
          {connection.status === 'error' && `DB error: ${connection.message}`}
        </div>
      </header>

      <nav className="tab-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeTab === 'dashboard' && <DashboardStats />}
        {activeTab === 'customers' && <CustomersTable />}
        {activeTab === 'products' && <ProductsTable />}
        {activeTab === 'invoices' && <InvoicesTable />}
      </main>
    </div>
  );
}

export default App;
