import { createBackendPlugin } from '@backstage/backend-plugin-api';
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { PermissionPolicy, PolicyQuery } from '@backstage/plugin-permission-node';
import { BackstageIdentityResponse } from '@backstage/plugin-permission-common';
import { permissionPlugin } from '@backstage/plugin-permission-node';

class AdminPermissionPolicy implements PermissionPolicy {
  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyQuery> {
    // If the user has the admin role, allow all permissions
    if (user?.identity.userEntityRef) {
      // Check if user is part of admins group or has admin tag
      const isAdmin = 
        user.identity.ownershipEntityRefs?.some(ref => ref.includes('group:default/admins')) ||
        user.identity.userEntityRef.includes('user:default/admin');
      
      if (isAdmin) {
        console.log(`Admin access granted for ${user.identity.userEntityRef}`);
        return { result: { type: 'ALLOW' } };
      }
    }

    // Otherwise, proceed with the default permission policy
    return request;
  }
}

/**
 * Custom permission policy module for Backstage that implements admin role checks.
 */
export const customPermissionPolicyModule = createBackendModule({
  pluginId: 'permission',
  moduleId: 'custom-permission-policy',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        permissions: permissionPlugin.providing.policyExtensionPoint,
        logger: coreServices.logger,
      },
      async init({ permissions, logger }) {
        logger.info('Registering custom permission policy with admin role support');
        permissions.setPolicy(new AdminPermissionPolicy());
      },
    });
  },
});

export default customPermissionPolicyModule;
