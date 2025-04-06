import { Knex } from 'knex';
import { Logger } from 'winston';

export interface ApprovalRequest {
  id: string;
  task_id: string;
  title: string;
  description: string;
  approvers: string[];
  min_approvals: number;
  timeout_minutes: number | null;
  created_at: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ApprovalDecision {
  id: string;
  request_id: string;
  approver: string;
  decision: 'approve' | 'reject';
  comment?: string;
  created_at: Date;
}

export class ApprovalDatabase {
  constructor(private readonly db: Knex, private readonly logger: Logger) {}

  async createTables() {
    const hasApprovalRequestsTable = await this.db.schema.hasTable('approval_requests');
    if (!hasApprovalRequestsTable) {
      this.logger.info('Creating approval_requests table');
      await this.db.schema.createTable('approval_requests', table => {
        table.string('id').primary();
        table.string('task_id').notNullable();
        table.string('title').notNullable();
        table.text('description').notNullable();
        table.json('approvers').notNullable();
        table.integer('min_approvals').defaultTo(1);
        table.integer('timeout_minutes').nullable();
        table.timestamp('created_at').defaultTo(this.db.fn.now());
        table.string('status').defaultTo('pending');
        table.index('task_id');
      });
    }

    const hasApprovalDecisionsTable = await this.db.schema.hasTable('approval_decisions');
    if (!hasApprovalDecisionsTable) {
      this.logger.info('Creating approval_decisions table');
      await this.db.schema.createTable('approval_decisions', table => {
        table.string('id').primary();
        table.string('request_id').notNullable();
        table.string('approver').notNullable();
        table.string('decision').notNullable();
        table.text('comment').nullable();
        table.timestamp('created_at').defaultTo(this.db.fn.now());
        table.foreign('request_id').references('id').inTable('approval_requests');
        table.index('request_id');
      });
    }
  }

  async createRequest(params: {
    taskId: string;
    title: string;
    description: string;
    approvers: string[];
    minApprovals?: number;
    timeoutInMinutes?: number;
  }): Promise<string> {
    const requestId = `request-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    // Log the taskId for debugging
    this.logger.debug(`Creating approval request with taskId: ${params.taskId}`);
    
    if (!params.taskId) {
      throw new Error('taskId is required for approval requests');
    }
    
    try {
      await this.db('approval_requests').insert({
        id: requestId,
        task_id: params.taskId,
        title: params.title,
        description: params.description,
        approvers: JSON.stringify(params.approvers),
        min_approvals: params.minApprovals || 1,
        timeout_minutes: params.timeoutInMinutes || null,
        status: 'pending',
      });
      
      this.logger.info(`Created approval request with ID: ${requestId}`);
      return requestId;
    } catch (error) {
      this.logger.error(`Failed to create approval request: ${error.message}`);
      throw error;
    }
  }

  async getRequest(requestId: string): Promise<ApprovalRequest | undefined> {
    const request = await this.db('approval_requests')
      .where({ id: requestId })
      .first();
    
    if (!request) {
      return undefined;
    }
    
    return {
      ...request,
      approvers: JSON.parse(request.approvers),
    };
  }

  async recordDecision(params: {
    requestId: string;
    approver: string;
    decision: 'approve' | 'reject';
    comment?: string;
  }): Promise<void> {
    const { requestId, approver, decision, comment } = params;
    const decisionId = `decision-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    await this.db('approval_decisions').insert({
      id: decisionId,
      request_id: requestId,
      approver,
      decision,
      comment,
    });
    
    // Update the request status if needed
    const request = await this.getRequest(requestId);
    if (!request) {
      throw new Error(`Approval request not found: ${requestId}`);
    }
    
    const decisions = await this.getDecisions(requestId);
    const approvals = decisions.filter(d => d.decision === 'approve').length;
    const rejections = decisions.filter(d => d.decision === 'reject').length;
    
    // If we have enough approvals or any rejection, update the status
    if (approvals >= request.min_approvals) {
      await this.db('approval_requests')
        .where({ id: requestId })
        .update({ status: 'approved' });
    } else if (rejections > 0) {
      await this.db('approval_requests')
        .where({ id: requestId })
        .update({ status: 'rejected' });
    }
  }

  async getDecisions(requestId: string): Promise<ApprovalDecision[]> {
    return this.db('approval_decisions')
      .where({ request_id: requestId })
      .orderBy('created_at', 'asc');
  }
}
