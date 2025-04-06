import { LoggerService } from '@backstage/backend-plugin-api';
import { NotFoundError } from '@backstage/errors';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import crypto from 'node:crypto';
import { ApprovalItem, ApprovalService } from './types';

export async function createApprovalService({
  logger,
  catalog,
}: {
  logger: LoggerService;
  catalog: typeof catalogServiceRef.T;
}): Promise<ApprovalService> {
  logger.info('Initializing ApprovalService');

  const storedApprovals = new Array<ApprovalItem>();

  return {
    async createApproval(input, options) {
      let title = input.title;

      if (input.entityRef) {
        const entity = await catalog.getEntityByRef(input.entityRef, options);
        if (!entity) {
          throw new NotFoundError(
            `No entity found for ref '${input.entityRef}'`,
          );
        }

        const entityDisplay = entity.metadata.title ?? input.entityRef;
        title = `[${entityDisplay}] ${input.title}`;
      }

      const id = crypto.randomUUID();
      const createdBy = options.credentials.principal.userEntityRef;
      const newApproval = {
        title,
        id,
        status: 'pending' as const,
        entityRef: input.entityRef,
        createdBy,
        createdAt: new Date().toISOString(),
      };

      storedApprovals.push(newApproval);

      logger.info('Created new approval request', { id, title, createdBy });

      return newApproval;
    },

    async listApprovals() {
      return { items: Array.from(storedApprovals) };
    },

    async getApproval(request: { id: string }) {
      const approval = storedApprovals.find(item => item.id === request.id);
      if (!approval) {
        throw new NotFoundError(`No approval found with id '${request.id}'`);
      }
      return approval;
    },
    
    async updateApprovalStatus(request, options) {
      const { id, status, comment } = request;
      const approvalIndex = storedApprovals.findIndex(item => item.id === id);
      
      if (approvalIndex === -1) {
        throw new NotFoundError(`No approval found with id '${id}'`);
      }
      
      const updatedBy = options.credentials.principal.userEntityRef;
      const updatedAt = new Date().toISOString();
      
      const updatedApproval = {
        ...storedApprovals[approvalIndex],
        status,
        updatedAt,
        updatedBy,
        comment,
      };
      
      storedApprovals[approvalIndex] = updatedApproval;
      
      logger.info(`Approval ${id} ${status}`, { id, status, updatedBy });
      
      return updatedApproval;
    }
  };
}
