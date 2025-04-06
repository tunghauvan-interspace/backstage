import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

/**
 * Creates an `acme:example` Scaffolder action.
 *
 * @remarks
 *
 * See {@link https://example.com} for more information.
 *
 * @public
 */
export function createExampleAction() {
  // For more information on how to define custom actions, see
  //   https://backstage.io/docs/features/software-templates/writing-custom-actions
  return createTemplateAction<{
    title: string;
    description: string;
    approvers: string[];
  }>({
    id: 'scaffolder:request',
    description: 'Requests approval from specified approvers before proceeding',
    schema: {
      input: {
        type: 'object',
        required: ['title', 'description', 'approvers'],
        properties: {
          title: {
            title: 'Approval Request Title',
            description: 'The title of the approval request',
            type: 'string',
          },
          description: {
            title: 'Description',
            description: 'Detailed description of what needs approval',
            type: 'string',
          },
          approvers: {
            title: 'Approvers',
            description: 'List of approvers for the request',
            type: 'array',
            items: {
              type: 'string',
              description: 'User ID or email of the approver',
            },
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          approved: {
            type: 'boolean',
            description: 'Whether the request was approved or rejected',
          },
          requestId: {
            type: 'string',
            description: 'The ID of the approval request',
          },
        },
      },
    },
    async handler(ctx) {
      ctx.logger.info(
        `Creating approval request: ${ctx.input.title} for approvers: ${ctx.input.approvers.join(', ')}`,
      );

      // Implement the actual approval request logic here
      // This would typically involve creating a record in a database,
      // sending notifications, and waiting for the approval

      // For demo purposes, simulate an approval process
      const requestId = `req-${Math.floor(Math.random() * 10000)}`;
      
      // Mock implementation - in a real scenario, this would wait for actual approval
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return the approval result
      ctx.output('approved', true);
      ctx.output('requestId', requestId);
    },
  });
}
