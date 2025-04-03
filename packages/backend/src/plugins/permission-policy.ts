import {
  BackstageIdentityResponse,
  PolicyDecision,
  PermissionPolicy,
  PermissionCriteria,
} from '@backstage/plugin-permission-node';
import { isPermission } from '@backstage/plugin-permission-common';

/**
 * A simple permission policy that grants all permissions to users in the admin role.
 * For others, it allows read access but denies write access.
 */
export class AdminPermissionPolicy implements PermissionPolicy {
  async handle(
    request: PolicyDecision,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    // Allow access to admin users
    if (user && user.identity.userEntityRef) {
      const userRef = user.identity.userEntityRef;
      // Check if user is in admins group or has admin role
      const isAdmin = 
        user.identity.ownershipEntityRefs?.some(ref => 
          ref.toLowerCase().includes('group:default/admins')
        ) || 
        userRef.toLowerCase().includes('user:default/admin');

      if (isAdmin) {
        return { result: { type: 'ALLOW' } };
      }
    }

    // For non-admins, allow read but deny write
    if (isPermission(request) && request.permission.attributes.action.startsWith('create')) {
      return { result: { type: 'DENY' } };
    }

    // Default to allowing access for read operations
    return { result: { type: 'ALLOW' } };
  }
}
