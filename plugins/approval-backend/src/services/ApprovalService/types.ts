import {
  BackstageCredentials,
  BackstageUserPrincipal,
} from '@backstage/backend-plugin-api';

export interface ApprovalItem {
  title: string;
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  entityRef?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
  comment?: string;
}

export interface ApprovalService {
  createApproval(
    input: {
      title: string;
      entityRef?: string;
    },
    options: {
      credentials: BackstageCredentials<BackstageUserPrincipal>;
    },
  ): Promise<ApprovalItem>;

  listApprovals(): Promise<{ items: ApprovalItem[] }>;

  getApproval(request: { id: string }): Promise<ApprovalItem>;
  
  updateApprovalStatus(
    request: { 
      id: string;
      status: 'approved' | 'rejected';
      comment?: string;
    },
    options: {
      credentials: BackstageCredentials<BackstageUserPrincipal>;
    },
  ): Promise<ApprovalItem>;
}
