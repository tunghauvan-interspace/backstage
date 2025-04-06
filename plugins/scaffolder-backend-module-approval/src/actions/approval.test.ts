import { createApprovalAction } from './approval';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';

describe('createApprovalAction', () => {
  const mockApprovalService = {
    createRequest: jest.fn().mockResolvedValue('request-123'),
    waitForDecision: jest.fn().mockResolvedValue({ approved: true, decisions: [] }),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should create approval request and wait for decision', async () => {
    const action = createApprovalAction({
      approvalService: mockApprovalService,
    });

    const ctx = createMockActionContext({
      input: {
        title: 'Test Approval',
        description: 'Please approve this test',
        approvers: ['user:default/john', 'group:default/admins'],
        minApprovals: 2,
      },
      taskId: 'task-xyz',
    });

    await action.handler(ctx);

    expect(mockApprovalService.createRequest).toHaveBeenCalledWith({
      taskId: 'task-xyz',
      title: 'Test Approval',
      description: 'Please approve this test',
      approvers: ['user:default/john', 'group:default/admins'],
      minApprovals: 2,
      timeoutInMinutes: undefined,
    });

    expect(mockApprovalService.waitForDecision).toHaveBeenCalledWith('request-123');
    
    expect(ctx.output).toHaveBeenCalledWith('approved', true);
    expect(ctx.output).toHaveBeenCalledWith('requestId', 'request-123');
    expect(ctx.output).toHaveBeenCalledWith('decisions', []);
  });

  it('should handle rejection', async () => {
    mockApprovalService.waitForDecision.mockResolvedValueOnce({ 
      approved: false, 
      decisions: [{ user: 'john', approved: false, reason: 'Not needed' }] 
    });

    const action = createApprovalAction({
      approvalService: mockApprovalService,
    });

    const ctx = createMockActionContext({
      input: {
        title: 'Test Approval',
        description: 'Please approve this test',
        approvers: ['user:default/john'],
      },
      taskId: 'task-abc',
    });

    await action.handler(ctx);

    expect(ctx.output).toHaveBeenCalledWith('approved', false);
    expect(ctx.output).toHaveBeenCalledWith('decisions', [
      { user: 'john', approved: false, reason: 'Not needed' }
    ]);
  });
});
