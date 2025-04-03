import {
  IdentityPermissionPolicy,
  PolicyQuery,
  BackstageIdentityResponse,
} from '@backstage/plugin-permission-node';

/**
 * A simple permission policy that grants all permissions to admins.
 */
export class AdminPermissionPolicy extends IdentityPermissionPolicy {
  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyQuery> {
    // If no user, continue with default policy
    if (!user) {
      return request;
    }

    // Log the user entity information for debugging
    console.log('Permission check for user:', user.identity.userEntityRef);
    console.log('User ownership refs:', user.identity.ownershipEntityRefs);

    // If the user has the admin role, allow all permissions
    const isAdmin = 
      user.identity.ownershipEntityRefs?.some(ref => ref.includes('group:default/admins')) ||
      user.identity.userEntityRef === 'user:default/admin';

    if (isAdmin) {
      console.log(`Admin access granted for ${user.identity.userEntityRef}`);
      return { result: { type: 'ALLOW' } };
    }

    // Otherwise, proceed with the default permission policy
    return super.handle(request, user);
  }
}
