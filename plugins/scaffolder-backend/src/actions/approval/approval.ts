import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { z } from 'zod';

/**
 * Creates an approval action that pauses template execution until approval is received.
 * @public
 */
export const createApprovalAction = (options: {
  approvalService: {
    createRequest: (params: {
      taskId: string;
      title: string;
      description: string;
      approvers: string[];
      minApprovals?: number;
      timeoutInMinutes?: number;
    }) => Promise<string>;
    waitForDecision: (requestId: string) => Promise<{ approved: boolean }>;
  };
}) => {
  const { approvalService } = options;

  return createTemplateAction({
    id: 'scaffolder:approval',
    description: 'Pauses template execution until required approvals are received',
    schema: {
      input: z.object({
        title: z
          .string()
          .describe('Title of the approval request')
          .default('Approval required'),
        description: z
          .string()
          .describe('Detailed description of what needs to be approved')
          .default('A new resource is being created that requires your approval'),
        approvers: z
          .array(z.string())
          .describe('List of users or groups who can approve this request')
          .min(1, 'At least one approver is required'),
        minApprovals: z
          .number()
          .describe('Minimum number of approvals required')
          .default(1)
          .optional(),
        timeoutInMinutes: z
          .number()
          .describe('Time in minutes after which this approval request expires')
          .optional(),
      }),
      output: z.object({
        approved: z.boolean().describe('Whether the request was approved or rejected'),
        requestId: z.string().describe('The ID of the approval request'),
        decisions: z.array(z.any()).describe('The approval decisions that were made'),
      }),
    },
    async handler(ctx) {
      const { input, logger, taskId } = ctx;
      
      logger.info(`Creating approval request: ${input.title}`);
      
      // Create approval request
      const requestId = await approvalService.createRequest({
        taskId,
        title: input.title,
        description: input.description,
        approvers: input.approvers,
        minApprovals: input.minApprovals || 1,
        timeoutInMinutes: input.timeoutInMinutes,
      });
      
      logger.info(`Approval request ${requestId} created, waiting for decision...`);
      
      // This will pause the task execution until the promise resolves
      // (when approval is given or denied)
      const result = await approvalService.waitForDecision(requestId);
      
      logger.info(`Approval request ${requestId} completed with result: ${result.approved ? 'approved' : 'rejected'}`);
      
      return {
        approved: result.approved,
        requestId,
        decisions: result.decisions || [],
      };
    },
  });
};
