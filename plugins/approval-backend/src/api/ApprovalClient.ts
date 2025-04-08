import { DiscoveryApi } from '@backstage/core-plugin-api';

export interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  approvers: string[];
  status: 'pending' | 'approved' | 'rejected';
}

export interface ApprovalResult {
  approved: boolean;
  requestId: string;
}

export interface CreateRequestOptions {
  title: string;
  description: string;
  approvers: string[];
}

export class ApprovalClient {
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: { discoveryApi: DiscoveryApi }) {
    this.discoveryApi = options.discoveryApi;
  }

  async createRequest(options: CreateRequestOptions): Promise<ApprovalRequest> {
    const baseUrl = await this.discoveryApi.getBaseUrl('approval');
    const response = await fetch(`${baseUrl}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Failed to create approval request: ${response.statusText}`);
    }

    return await response.json();
  }

  async waitForDecision(requestId: string): Promise<ApprovalResult> {
    const baseUrl = await this.discoveryApi.getBaseUrl('approval');
    
    // Poll for a decision
    const maxAttempts = 5; // For immediate testing - in real implementation, this would be different
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`${baseUrl}/requests/${requestId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to check approval status: ${response.statusText}`);
      }

      const request = await response.json();
      
      if (request.status !== 'pending') {
        return {
          approved: request.status === 'approved',
          requestId: request.id,
        };
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error('Timed out waiting for approval decision');
  }
}
