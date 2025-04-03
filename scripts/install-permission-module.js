/**
 * This script installs the missing permission module that's needed for the backend.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Installing @backstage/plugin-permission-backend-module-allow-all-policy...');

try {
  execSync('yarn add @backstage/plugin-permission-backend-module-allow-all-policy', {
    cwd: path.resolve(__dirname, '../packages/backend'),
    stdio: 'inherit',
  });
  
  console.log('Successfully installed permission module!');
  console.log('Now restart your backend with: yarn start-backend');
} catch (error) {
  console.error('Failed to install permission module:', error.message);
  console.log('You can manually install it with:');
  console.log('cd packages/backend && yarn add @backstage/plugin-permission-backend-module-allow-all-policy');
}
