import { createBackendModule } from "@backstage/backend-plugin-api";
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createApprovalAction } from "./actions/approval";
import { ApprovalDatabase } from "./database/ApprovalDatabase";
import { ApprovalService } from "./service/approval";
import { coreServices } from '@backstage/backend-plugin-api';

/**
 * A backend module that registers the approval action into the scaffolder
 */
export const scaffolderModule = createBackendModule({
  moduleId: 'approval',
  pluginId: 'scaffolder',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolderActions: scaffolderActionsExtensionPoint,
        database: coreServices.database,
        logger: coreServices.logger,
      },
      async init({ scaffolderActions, database, logger }) {
        logger.info('Initializing approval module');
        
        try {
          // Create and initialize the database
          const approvalDb = new ApprovalDatabase(await database.getClient(), logger);
          await approvalDb.createTables();
          
          // Create an approval service that uses the database
          const approvalService = new ApprovalService({
            database: approvalDb,
            logger,
          });
          
          // Don't use bind() as it might lose context
          scaffolderActions.addActions(createApprovalAction({
            approvalService: {
              createRequest: async (params) => {
                logger.info(`Forwarding approval request to service: ${JSON.stringify({
                  taskId: params.taskId,
                  title: params.title,
                })}`);
                return approvalService.createRequest(params);
              },
              waitForDecision: async (requestId) => {
                return approvalService.waitForDecision(requestId);
              }
            }
          }));
          
          logger.info('Approval module initialized successfully');
        } catch (error) {
          logger.error(`Failed to initialize approval module: ${error.message}`);
          throw error;
        }
      }
    });
  },
})
