const http = require('http');

async function testServer() {
  console.log('Testing KRIA Studio Production Server Build...');
  
  // Test server.ts exports and SQLite db initialization
  try {
    const { app } = require('../dist/server.cjs');
    console.log('✓ dist/server.cjs built & loaded cleanly into Node.js!');
  } catch (e) {
    console.error('× Error loading dist/server.cjs:', e);
    process.exit(1);
  }
}

testServer();
