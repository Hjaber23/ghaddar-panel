const useWindowsAuth = !process.env.DB_USER;

let sql;
if (useWindowsAuth) {
  try {
    sql = require('mssql/msnodesqlv8');
  } catch (err) {
    console.error('\n*** msnodesqlv8 is required for Windows Authentication ***');
    console.error('Run: npm install msnodesqlv8');
    console.error('Or set DB_USER and DB_PASSWORD in .env for SQL Server login.\n');
    throw err;
  }
} else {
  sql = require('mssql');
}

function buildConfig() {
  let server = process.env.DB_SERVER || 'DESKTOP-QS8DFVL';
  let instanceName = process.env.DB_INSTANCE || '';

  if (!process.env.DB_INSTANCE && server.includes('\\')) {
    const parts = server.split('\\');
    server = parts[0];
    instanceName = parts[1];
  }

  const config = {
    server,
    database: process.env.DB_NAME || 'MotorsCompanyDB',
    options: {
      encrypt: process.env.DB_ENCRYPT !== 'false',
      trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
      instanceName,
      trustedConnection: useWindowsAuth,
    },
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  };

  if (useWindowsAuth) {
    config.driver = 'msnodesqlv8';
  } else {
    config.user = process.env.DB_USER;
    config.password = process.env.DB_PASSWORD;
  }

  return config;
}

const config = buildConfig();

let pool;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

function getConnectionInfo() {
  const instance = config.options.instanceName;
  const target = instance ? `${config.server}\\${instance}` : config.server;
  return {
    target,
    database: config.database,
    auth: useWindowsAuth ? 'Windows' : 'SQL Server',
  };
}

module.exports = { sql, getPool, getConnectionInfo };
