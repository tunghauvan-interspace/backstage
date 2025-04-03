/**
 * Script to ensure environment variables are properly loaded before starting the backend.
 * This helps debug auth provider configuration issues.
 */

// Load environment variables explicitly
require('dotenv').config();

// Print debug info
console.log('\nStarting backend with environment check:');
console.log(`AUTH_GITHUB_CLIENT_ID exists: ${Boolean(process.env.AUTH_GITHUB_CLIENT_ID)}`);
if (process.env.AUTH_GITHUB_CLIENT_ID) {
  console.log(`  ID length: ${process.env.AUTH_GITHUB_CLIENT_ID.length} characters`);
}
console.log(`AUTH_GITHUB_CLIENT_SECRET exists: ${Boolean(process.env.AUTH_GITHUB_CLIENT_SECRET)}`);
if (process.env.AUTH_GITHUB_CLIENT_SECRET) {
  console.log(`  Secret length: ${process.env.AUTH_GITHUB_CLIENT_SECRET.length} characters`);
}

// Continue with regular backstage start command
require('@backstage/cli/bin/backstage-cli');
