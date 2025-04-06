// ...existing code...

export type RouterOptions = {
  // ...existing code...
  approvalService: {
    createRequest: (params: {
      taskId: string;
      title: string;
      description: string;
      approvers: string[];
      minApprovals?: number;
      timeoutInMinutes?: number;
    }) => Promise<string>;
    waitForDecision: (requestId: string) => Promise<{ approved: boolean; decisions?: any[] }>;
  };
  // ...existing code...
};