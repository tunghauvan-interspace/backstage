/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

import { createBackend } from '@backstage/backend-defaults';
import { LoggerService } from '@backstage/backend-plugin-api';
import * as path from 'path';

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

// Import the admin permission policy
import { AdminPermissionPolicy } from './plugins/permission-policy';

// Create a backend instance with more explicit logging for auth
const backend = createBackend({
  services: [
    {
      service: LoggerService,
      config: {
        format: 'text',
        baseOptions: {
          level: process.env.LOG_LEVEL || 'debug',
        },
      },
    },
  ],
});

// Log environment variables at startup to help debug authentication issues
console.log('Environment check:');
console.log(`AUTH_GITHUB_CLIENT_ID exists: ${Boolean(process.env.AUTH_GITHUB_CLIENT_ID)}`);
console.log(`AUTH_GITHUB_CLIENT_SECRET exists: ${Boolean(process.env.AUTH_GITHUB_CLIENT_SECRET)}`);

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(import('@backstage/plugin-techdocs-backend'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));

// We need to register the AdminPermissionPolicy with the permission backend
// Since direct integration is challenging with the new backend system, we'll use
// the module approach for now to ensure basic functionality
// Temporarily use the default allow-all policy until we can properly integrate the custom policy
backend.add(import('@backstage/plugin-permission-backend-module-allow-all-policy'));

// search plugin
backend.add(import('@backstage/plugin-search-backend'));
backend.add(import('@backstage/plugin-search-backend-module-pg'));
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// kubernetes
backend.add(import('@backstage/plugin-kubernetes-backend'));

backend.start();
