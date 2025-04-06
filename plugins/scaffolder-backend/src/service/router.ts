import { createApprovalAction } from '../actions/approval';
// ...existing code...

export default async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  // ...existing code...
  
  const actions = [
    // ...existing actions...
    createApprovalAction({
      approvalService: options.approvalService,
    }),
  ];
  
  // ...existing code...
}