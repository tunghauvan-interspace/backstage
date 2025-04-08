import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import fetch from 'node-fetch';
import {coreServices} from '@backstage/backend-plugin-api';
/**
 * Creates an approval request Scaffolder action.
 *
 * @remarks
 *
 * This action allows templates to request approval before proceeding.
 *
 * @public
 */
export function createExampleAction() {
  return createTemplateAction<{
    title: string;
    description: string;
    approvers: string[];
    baseUrl?: string;
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
          baseUrl: {
            title: 'API Base URL',
            description: 'Base URL for the approval API (default: http://localhost:7007/api/approval)',
            type: 'string',
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

      const { title, description, approvers } = ctx.input;
      
      // Use provided baseUrl or default to localhost
      const baseUrl = ctx.input.baseUrl || 'http://localhost:7007/api/approval';
      
      // Create the approval request
      const createResponse = await fetch(`${baseUrl}/approvals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, approvers }),
      });
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Failed to create approval request: ${errorText}`);
      }
      
      const request = await createResponse.json();
      const requestId = request.id;
      
      ctx.logger.info(`Approval request created with ID: ${requestId}`);
      
      // Poll for the approval status
      const maxAttempts = 60; // Poll for up to 5 minutes (60 * 5 seconds)
      let attempt = 0;
      
      while (attempt < maxAttempts) {
        const statusResponse = await fetch(`${baseUrl}/approvals/${requestId}`);
        
        if (!statusResponse.ok) {
          throw new Error(`Failed to check approval status: ${await statusResponse.text()}`);
        }
        
        const status = await statusResponse.json();
        
        if (status.status !== 'pending') {
          // Decision made - either approved or rejected
          const approved = status.status === 'approved';
          ctx.logger.info(`Approval request ${requestId} ${approved ? 'approved' : 'rejected'}`);
          
          // Output the results
          ctx.output('approved', approved);
          ctx.output('requestId', requestId);
          
          return;
        }
        
        // Wait 5 seconds before polling again
        ctx.logger.info(`Waiting for approval decision... (attempt ${attempt + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempt++;
      }
      
      // If we get here, we timed out waiting for approval
      throw new Error('Timed out waiting for approval decision');
    },
  });
}
