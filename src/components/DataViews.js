import { useEffect, useState } from 'react';
import { api } from '../api';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value ?? 0);
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

function LoadingState() {
  return <p className="state-message">Loading...</p>;
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="state-message error">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn-secondary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError('');
    api.dashboard()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <span className="stat-label">Customers</span>
        <strong>{stats.totalCustomers}</strong>
      </div>
      <div className="stat-card">
        <span className="stat-label">Products</span>
        <strong>{stats.totalProducts}</strong>
      </div>
      <div className="stat-card">
        <span className="stat-label">Invoices</span>
        <strong>{stats.totalInvoices}</strong>
      </div>
      <div className="stat-card">
        <span className="stat-label">Total Revenue</span>
        <strong>{formatCurrency(stats.totalRevenue)}</strong>
      </div>
    </div>
  );
}

export function CustomersTable() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError('');
    api.customers()
      .then(setCustomers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>City</th>
            <th>Registered</th>
            <th>Invoices</th>
            <th>Total Spent</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.CustomerID}>
              <td>{c.CustomerID}</td>
              <td>{c.FirstName} {c.LastName}</td>
              <td>{c.Phone || '—'}</td>
              <td>{c.Email || '—'}</td>
              <td>{c.City || '—'}</td>
              <td>{formatDate(c.RegisteredDate)}</td>
              <td>{c.InvoiceCount}</td>
              <td>{formatCurrency(c.TotalSpent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProductsTable() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError('');
    api.products()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Category</th>
            <th>Unit Price</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.ProductID}>
              <td>{p.ProductID}</td>
              <td>{p.ProductName}</td>
              <td>{p.CategoryName}</td>
              <td>{formatCurrency(p.UnitPrice)}</td>
              <td>{p.StockQuantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InvoicesTable() {
  const [invoices, setInvoices] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState([]);
  const [error, setError] = useState('');
  const [detailsError, setDetailsError] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    api.invoices()
      .then(setInvoices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openDetails = (invoiceId) => {
    setSelectedId(invoiceId);
    setDetailsLoading(true);
    setDetailsError('');
    api.invoiceDetails(invoiceId)
      .then(setDetails)
      .catch((err) => setDetailsError(err.message))
      .finally(() => setDetailsLoading(false));
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="invoices-layout">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Payment</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.InvoiceID} className={selectedId === inv.InvoiceID ? 'selected-row' : ''}>
                <td>{inv.InvoiceID}</td>
                <td>{inv.CustomerName}</td>
                <td>{formatDate(inv.InvoiceDate)}</td>
                <td>{inv.PaymentMethod || '—'}</td>
                <td>{formatCurrency(inv.TotalAmount)}</td>
                <td>
                  <button type="button" className="btn-link" onClick={() => openDetails(inv.InvoiceID)}>
                    View lines
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedId && (
        <aside className="details-panel">
          <h3>Invoice #{selectedId} — Line Items</h3>
          {detailsLoading && <LoadingState />}
          {detailsError && <ErrorState message={detailsError} onRetry={() => openDetails(selectedId)} />}
          {!detailsLoading && !detailsError && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((d) => (
                    <tr key={d.InvoiceDetailID}>
                      <td>{d.ProductName}</td>
                      <td>{d.Quantity}</td>
                      <td>{formatCurrency(d.UnitPrice)}</td>
                      <td>{formatCurrency(d.LineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
