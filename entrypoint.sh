#!/bin/sh

# Wait for database connection
echo "Checking database connection..."

node -e "
const net = require('net');
const url = require('url');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

let host = 'db';
let port = 5432;
try {
  const match = dbUrl.match(/@([^/:]+)(?::(\d+))?/);
  if (match) {
    host = match[1];
    if (match[2]) {
      port = parseInt(match[2], 10);
    }
  }
} catch (e) {
  console.warn('Failed to parse DATABASE_URL, using defaults');
}

console.log('Checking TCP connection to ' + host + ':' + port + '...');

let retries = 30;
function checkConnection() {
  const socket = new net.Socket();
  socket.setTimeout(2000);
  
  socket.on('connect', () => {
    console.log('Database port is open!');
    socket.destroy();
    process.exit(0);
  });
  
  socket.on('timeout', () => {
    console.log('Timeout connecting to database.');
    socket.destroy();
    retry();
  });
  
  socket.on('error', (err) => {
    console.log('Connection failed: ' + err.message);
    socket.destroy();
    retry();
  });
  
  socket.connect(port, host);
}

function retry() {
  if (retries <= 0) {
    console.error('Database is not reachable. Exiting.');
    process.exit(1);
  }
  retries--;
  setTimeout(checkConnection, 2000);
}

checkConnection();
"

if [ $? -ne 0 ]; then
  echo "Failed to connect to database. Exiting."
  exit 1
fi

# Run Prisma Migrations
echo "Running database migrations..."
prisma migrate deploy

# Run seeding conditionally if SEED_DB is true
if [ "$SEED_DB" = "true" ]; then
  echo "Seeding database..."
  prisma db seed
fi

# Start the application
echo "Starting application..."
exec node server.js
