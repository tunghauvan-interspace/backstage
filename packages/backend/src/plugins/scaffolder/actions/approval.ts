import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';
import { z } from 'zod';

export const createApprovalAction = () => {
  return createTemplateAction({
    id: 'scaffolder:approval',
    schema: {
      input: z.object({
        title: z.string().describe('Title of the approval request'),
        description: z.string().describe('Description of what needs approval'),
        approvers: z
          .array(z.string())
          .describe('List of users or groups who can approve this request'),
        timeoutInMinutes: z
          .number()
          .optional()
          .default(1440) // 24 hours default
          .describe('How long to wait for approval before timing out'),
      }),
      output: z.object({}),
    },
    async handler(ctx) {
      const { title, description, approvers, timeoutInMinutes } = ctx.input;
      
      ctx.logger.info(
        `Approval requested: "${title}" - Waiting for approval from: ${approvers.join(', ')}`,
      );
      
      // For now, we'll auto-approve to get your workflow working
      // In a real implementation, this would:
      // 1. Register the approval request in a database
      // 2. Notify the approvers
      // 3. Wait for approval or timeout
      
      ctx.logger.info('DEMO MODE: Auto-approving the request after 5 seconds');
      
      // Simulate approval delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      ctx.logger.info('Approval granted!');
      
      // Return empty output as defined in the schema
      return {};
    },
  });
};
