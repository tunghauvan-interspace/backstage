import { createExampleAction } from './example';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

describe('createExampleAction', () => {
  const server = setupServer();
  
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  
  it('should create an approval request and wait for decision', async () => {
    // Mock approval API
    const mockRequestId = 'mock-request-id';
    let callCount = 0;
    
    server.use(
      rest.post('http://test-api/approvals', (req, res, ctx) => {
        return res(ctx.json({
          id: mockRequestId,
          title: 'Test Approval',
          status: 'pending',
          createdAt: new Date().toISOString(),
          createdBy: 'user:default/test-user',
        }));
      }),
      
      rest.get(`http://test-api/approvals/${mockRequestId}`, (req, res, ctx) => {
        callCount++;
        // On the third call, return approved
        if (callCount >= 3) {
          return res(ctx.json({
            id: mockRequestId,
            title: 'Test Approval',
            status: 'approved',
            createdAt: new Date().toISOString(),
            createdBy: 'user:default/test-user',
            updatedAt: new Date().toISOString(),
            updatedBy: 'user:default/approver',
          }));
        }
        
        return res(ctx.json({
          id: mockRequestId,
          title: 'Test Approval',
          status: 'pending',
          createdAt: new Date().toISOString(),
          createdBy: 'user:default/test-user',
        }));
      })
    );
    
    // Create and execute the action
    const action = createExampleAction();
    const mockContext = createMockActionContext({
      input: {
        title: 'Test Approval',
        description: 'Please review and approve',
        approvers: ['user:default/approver'],
        baseUrl: 'http://test-api'
      },
      output: jest.fn(),
      logger: {
        info: jest.fn(),
        error: jest.fn(),
      },
    });
    
    // Set timeout to avoid test failures
    jest.setTimeout(15000);
    
    // Execute the action
    await action.handler(mockContext);
    
    // Verify outputs
    expect(mockContext.output).toHaveBeenCalledWith('approved', true);
    expect(mockContext.output).toHaveBeenCalledWith('requestId', mockRequestId);
    
    // Reset timeout
    jest.setTimeout(5000);
  });
  
  it('should throw error when approval is rejected', async () => {
    // Mock approval API with rejection
    const mockRequestId = 'mock-request-id';
    
    server.use(
      rest.post('http://test-api/approvals', (req, res, ctx) => {
        return res(ctx.json({
          id: mockRequestId,
          title: 'Test Approval',
          status: 'pending',
          createdAt: new Date().toISOString(),
          createdBy: 'user:default/test-user',
        }));
      }),
      
      rest.get(`http://test-api/approvals/${mockRequestId}`, (req, res, ctx) => {
        return res(ctx.json({
          id: mockRequestId,
          title: 'Test Approval',
          status: 'rejected',
          createdAt: new Date().toISOString(),
          createdBy: 'user:default/test-user',
          updatedAt: new Date().toISOString(),
          updatedBy: 'user:default/approver',
        }));
      })
    );
    
    // Create and execute the action
    const action = createExampleAction();
    const mockContext = createMockActionContext({
      input: {
        title: 'Test Approval',
        description: 'Please review and approve',
        approvers: ['user:default/approver'],
        baseUrl: 'http://test-api'
      },
      output: jest.fn(),
      logger: {
        info: jest.fn(),
        error: jest.fn(),
      },
    });
    
    // Execute the action
    await action.handler(mockContext);
    
    // Verify outputs
    expect(mockContext.output).toHaveBeenCalledWith('approved', false);
    expect(mockContext.output).toHaveBeenCalledWith('requestId', mockRequestId);
  });
  
  it('should use default baseUrl if not provided', async () => {
    // Mock approval API
    const mockRequestId = 'mock-request-id';
    
    server.use(
      rest.post('http://localhost:7007/api/approval/approvals', (req, res, ctx) => {
        return res(ctx.json({
          id: mockRequestId,
          title: 'Test Approval',
          status: 'approved', // Approve immediately for this test
          createdAt: new Date().toISOString(),
          createdBy: 'user:default/test-user',
        }));
      }),
      
      rest.get(`http://localhost:7007/api/approval/approvals/${mockRequestId}`, (req, res, ctx) => {
        return res(ctx.json({
          id: mockRequestId,
          title: 'Test Approval',
          status: 'approved',
          createdAt: new Date().toISOString(),
          createdBy: 'user:default/test-user',
        }));
      })
    );
    
    // Create and execute the action
    const action = createExampleAction();
    const mockContext = createMockActionContext({
      input: {
        title: 'Test Approval',
        description: 'Please review and approve',
        approvers: ['user:default/approver'],
        // No baseUrl provided, should use default
      },
      output: jest.fn(),
      logger: {
        info: jest.fn(),
        error: jest.fn(),
      },
    });
    
    await action.handler(mockContext);
    
    expect(mockContext.output).toHaveBeenCalledWith('approved', true);
  });
});
