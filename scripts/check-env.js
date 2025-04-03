/**
 * This script checks if critical environment variables are available.
 * Run it with: node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');

// Try to load from root directory
const envPath = path.resolve(process.cwd(), '.env');
console.log(`Looking for .env file at: ${envPath}`);

try {
  require('dotenv').config({ path: envPath });
  console.log('✅ Attempted to load .env from project root');
} catch (error) {
  console.error('❌ Error loading .env:', error.message);
}

console.log('\nEnvironment Variable Check\n-------------------------');

// Check GitHub auth variables
const githubClientId = process.env.AUTH_GITHUB_CLIENT_ID;
const githubClientSecret = process.env.AUTH_GITHUB_CLIENT_SECRET;

console.log(`AUTH_GITHUB_CLIENT_ID: ${githubClientId ? '✓ Set' : '❌ Not set'}`);
console.log(`AUTH_GITHUB_CLIENT_SECRET: ${githubClientSecret ? '✓ Set' : '❌ Not set'}`);

if (githubClientId) {
  console.log(`  ID length: ${githubClientId.length} characters`);
}

if (githubClientSecret) {
  console.log(`  Secret length: ${githubClientSecret.length} characters`);
}

// Check if file exists
if (fs.existsSync(envPath)) {
  console.log(`\n✅ .env file exists at: ${envPath}`);
  // Print file contents without showing full secrets
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  console.log('\n.env file format check:');
  lines.forEach(line => {
    if (line.trim() === '' || line.startsWith('#')) {
      console.log(`  ${line} ✓`);
    } else if (line.includes('=')) {
      const [key, value] = line.split('=');
      const displayValue = value && value.length > 5 ? 
        `${value.substring(0, 3)}...${value.substring(value.length - 3)}` : 
        '[empty]';
      console.log(`  ${key}=${displayValue} ✓`);
    } else if (line.trim()) {
      console.log(`  ${line} ❌ (Invalid format, should be KEY=VALUE)`);
    }
  });
} else {
  console.log(`\n❌ .env file does not exist at: ${envPath}`);
}

console.log('\n📋 Recommendations:');
console.log('1. Make sure the .env file is in the project root directory');
console.log('2. Make sure there are no spaces around the equal sign (KEY=VALUE, not KEY = VALUE)');
console.log('3. No quotes around values unless they\'re part of the value');
console.log('4. Try using the start-with-env.js script to start the application');
console.log('');
