/**
 * Script to start Backstage with explicit environment variable loading
 * This provides a more reliable way to load environment variables
 * Run with: node scripts/start-with-env.js
 */

// Use path to ensure we're loading from the correct location
const path = require('path');
const envPath = path.resolve(__dirname, '../.env');

// Configure dotenv to load from project root directory
require('dotenv').config({ path: envPath });

console.log('\n🔧 Environment setup:');
console.log(`Working directory: ${process.cwd()}`);
console.log(`Loading .env from: ${envPath}`);
console.log(`AUTH_GITHUB_CLIENT_ID exists: ${Boolean(process.env.AUTH_GITHUB_CLIENT_ID)}`);
console.log(`AUTH_GITHUB_CLIENT_SECRET exists: ${Boolean(process.env.AUTH_GITHUB_CLIENT_SECRET)}`);

// Execute the backend in a child process with environment variables passed explicitly
const { spawn } = require('child_process');

const env = {
  ...process.env,
  // Pass environment variables explicitly
  AUTH_GITHUB_CLIENT_ID: process.env.AUTH_GITHUB_CLIENT_ID,
  AUTH_GITHUB_CLIENT_SECRET: process.env.AUTH_GITHUB_CLIENT_SECRET,
  FORCE_ENV_LOADED: 'true',
};

console.log('\n🚀 Starting Backstage with environment variables...\n');

// Run yarn dev in a child process
const child = spawn('yarn', ['dev'], {
  stdio: 'inherit',
  env: env,
  cwd: path.resolve(__dirname, '..'),
});

child.on('error', (error) => {
  console.error(`Error: ${error.message}`);
});

child.on('exit', (code) => {
  console.log(`Process exited with code ${code}`);
});
