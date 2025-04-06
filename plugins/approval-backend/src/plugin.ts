import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { createApprovalService } from './services/ApprovalService';

/**
 * approvalPlugin backend plugin
 *
 * @public
 */
export const approvalPlugin = createBackendPlugin({
  pluginId: 'approval',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        catalog: catalogServiceRef,
      },
      async init({ logger, httpAuth, httpRouter, catalog }) {
        const approvalService = await createApprovalService({
          logger,
          catalog,
        });

        httpRouter.use(
          await createRouter({
            httpAuth,
            approvalService,
          }),
        );
      },
    });
  },
});
