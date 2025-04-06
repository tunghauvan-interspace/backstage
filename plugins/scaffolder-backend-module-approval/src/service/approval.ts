import { Logger } from 'winston';
import { ApprovalDatabase } from '../database/ApprovalDatabase';

export interface ApprovalServiceOptions {
  database: ApprovalDatabase;
  logger: Logger;
  pollIntervalMs?: number;
}

export class ApprovalService {
  private readonly database: ApprovalDatabase;
  private readonly logger: Logger;
  private readonly pollIntervalMs: number;
  
  constructor(options: ApprovalServiceOptions) {
    this.database = options.database;
    this.logger = options.logger;
    this.pollIntervalMs = options.pollIntervalMs || 5000; // Default to 5 seconds
  }
  
  async createRequest(params: {
    taskId: string;
    title: string;
    description: string;
    approvers: string[];
    minApprovals?: number;
    timeoutInMinutes?: number;
  }): Promise<string> {
    if (!params.taskId) {
      this.logger.error('Cannot create approval request: taskId is required');
      throw new Error('taskId is required for approval requests');
    }
    
    // Log the params for debugging
    this.logger.info(`Creating approval request with params: ${JSON.stringify({
      taskId: params.taskId,
      title: params.title,
      approvers: params.approvers,
    })}`);
    
    return this.database.createRequest(params);
  }
  
  async waitForDecision(requestId: string): Promise<{ approved: boolean; decisions?: any[] }> {
    return new Promise((resolve) => {
      this.logger.info(`Waiting for decision on request ${requestId}`);
      
      const checkDecision = async () => {
        const request = await this.database.getRequest(requestId);
        if (!request) {
          this.logger.error(`Approval request ${requestId} not found`);
          resolve({ approved: false, decisions: [] });
          return;
        }
        
        if (request.status === 'approved') {
          const decisions = await this.database.getDecisions(requestId);
          resolve({ approved: true, decisions });
          return;
        }
        
        if (request.status === 'rejected') {
          const decisions = await this.database.getDecisions(requestId);
          resolve({ approved: false, decisions });
          return;
        }
        
        // Check for timeout
        if (request.timeout_minutes) {
          const timeoutMillis = request.timeout_minutes * 60 * 1000;
          const createdAt = new Date(request.created_at).getTime();
          const now = Date.now();
          
          if (now - createdAt > timeoutMillis) {
            this.logger.info(`Approval request ${requestId} timed out`);
            resolve({ approved: false, decisions: [] });
            return;
          }
        }
        
        // Continue polling
        setTimeout(checkDecision, this.pollIntervalMs);
      };
      
      // Start polling
      checkDecision();
    });
  }
  
  async approve(requestId: string, approver: string, comment?: string): Promise<void> {
    await this.database.recordDecision({
      requestId,
      approver,
      decision: 'approve',
      comment,
    });
  }
  
  async reject(requestId: string, approver: string, comment?: string): Promise<void> {
    await this.database.recordDecision({
      requestId,
      approver,
      decision: 'reject',
      comment,
    });
  }
}
