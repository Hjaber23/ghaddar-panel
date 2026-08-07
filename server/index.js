require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sql, getPool, getConnectionInfo } = require('./db');

const app = express();
const PORT = process.env.API_PORT || 5001;
const connectionInfo = getConnectionInfo();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'MotorsCompany API is running', port: PORT });
});

app.get('/api/health', async (_req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query('SELECT 1 AS ok');
    res.json({
      status: 'ok',
      database: connectionInfo.database,
      server: connectionInfo.target,
      auth: connectionInfo.auth,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
      server: connectionInfo.target,
      database: connectionInfo.database,
    });
  }
});

app.get('/api/dashboard', async (_req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM dbo.Customers) AS totalCustomers,
        (SELECT COUNT(*) FROM dbo.Products) AS totalProducts,
        (SELECT COUNT(*) FROM dbo.Invoices) AS totalInvoices,
        (SELECT ISNULL(SUM(TotalAmount), 0) FROM dbo.Invoices) AS totalRevenue
    `);
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers', async (_req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        c.CustomerID,
        c.FirstName,
        c.LastName,
        c.Phone,
        c.Email,
        c.City,
        c.Country,
        c.RegisteredDate,
        COUNT(DISTINCT i.InvoiceID) AS InvoiceCount,
        ISNULL(SUM(i.TotalAmount), 0) AS TotalSpent
      FROM dbo.Customers c
      LEFT JOIN dbo.Invoices i ON i.CustomerID = c.CustomerID
      GROUP BY
        c.CustomerID, c.FirstName, c.LastName, c.Phone,
        c.Email, c.City, c.Country, c.RegisteredDate
      ORDER BY TotalSpent DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories', async (_req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT CategoryID, CategoryName
      FROM dbo.Categories
      ORDER BY CategoryName
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products', async (_req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        p.ProductID,
        p.ProductName,
        p.CategoryID,
        c.CategoryName,
        p.UnitPrice,
        p.StockQuantity
      FROM dbo.Products p
      INNER JOIN dbo.Categories c ON c.CategoryID = p.CategoryID
      ORDER BY c.CategoryName, p.ProductName
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/invoices', async (_req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        i.InvoiceID,
        i.CustomerID,
        c.FirstName + ' ' + c.LastName AS CustomerName,
        i.InvoiceDate,
        i.PaymentMethod,
        i.TotalAmount
      FROM dbo.Invoices i
      INNER JOIN dbo.Customers c ON c.CustomerID = i.CustomerID
      ORDER BY i.InvoiceDate DESC, i.InvoiceID DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/invoices/:id/details', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('invoiceId', sql.Int, req.params.id)
      .query(`
        SELECT
          d.InvoiceDetailID,
          d.InvoiceID,
          d.ProductID,
          p.ProductName,
          d.Quantity,
          d.UnitPrice,
          d.LineTotal
        FROM dbo.InvoiceDetails d
        INNER JOIN dbo.Products p ON p.ProductID = d.ProductID
        WHERE d.InvoiceID = @invoiceId
        ORDER BY d.InvoiceDetailID
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  console.log(`Connecting to ${connectionInfo.target} / ${connectionInfo.database} (${connectionInfo.auth})`);
});
