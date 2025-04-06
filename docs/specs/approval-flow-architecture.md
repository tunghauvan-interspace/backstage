# Approval Flow Architecture Design

> **Navigation**: [Home](../README.md) > [Approval Flow](../dev/approval-flow.md) > Architecture Design

This document outlines the technical architecture and integration points for implementing approval flows in Backstage software templates.

## System Architecture Overview

The approval flow system is designed as an extension to the existing Backstage scaffolder plugin, adding a governance layer that can pause template execution pending approval decisions.

![Approval Flow Architecture](../assets/approval-flow-architecture.png)

## Core Components

### 1. Scaffolder Plugin Extensions

- **Approval Action**: A custom action (`scaffolder:approval`) that pauses template execution
- **Task State Manager**: Manages the lifecycle of approval tasks and their status
- **Approval Backend Service**: Handles approval requests and decisions

### 2. Frontend Components

- **Approval Dashboard**: UI for approvers to view and manage pending requests
- **Request Details View**: Detailed view of template execution context
- **Approval Action UI**: Controls for approvers to approve, reject, or request changes
- **Template Execution Status**: Enhanced status display showing approval state

### 3. Persistence Layer

- **Approval State Store**: Stores approval requests, decisions, and metadata
- **Approval History Database**: Maintains audit trail of all approval activities
- **Template Context Store**: Preserves template context during approval waiting periods

## Integration Points

### 1. Internal Backstage Integrations

| System | Integration Point | Purpose |
|--------|-------------------|---------|
| **Scaffolder Plugin** | Task Manager API | Pause and resume template execution tasks |
| **Auth/Identity** | Permission Framework | Control who can approve what types of requests |
| **Notification System** | Event Bus | Send notifications to approvers |
| **Catalog** | Entity API | Resolve group references to actual users |
| **UI/UX** | Components API | Render approval UI consistently with Backstage design |

### 2. External System Integrations

| System | Integration Method | Data Exchange |
|--------|-------------------|---------------|
| **JIRA** | REST API | Create and update issues for approvals |
| **ServiceNow** | REST API | Create change requests and track approvals |
| **Email** | SMTP | Send approval notifications and collect responses |
| **Slack** | Webhooks | Interactive approval notifications and responses |
| **MS Teams** | Adaptive Cards | Rich approval cards with action buttons |

## Data Flow

1. **Initiation**: Template execution reaches an approval step
2. **Suspension**: Task execution is suspended, state preserved
3. **Notification**: Approvers are notified through configured channels
4. **Review**: Approvers access the approval interface 
5. **Decision**: Approvers make a decision (approve/reject/request changes)
6. **Continuation**: Upon approval, template execution resumes
7. **Completion**: Execution finishes, approval records are stored

## API Specifications

### Approval Request API

```typescript
interface ApprovalRequest {
  id: string;
  templateId: string;
  taskId: string;
  title: string;
  description: string;
  createdBy: string;
  parameters: Record<string, any>;
  approvers: string[];
  minApprovals: number;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  decisions: ApprovalDecision[];
  createdAt: string;
  expiresAt?: string;
}
```

### Approval Decision API

```typescript
interface ApprovalDecision {
  requestId: string;
  approver: string;
  decision: 'approve' | 'reject' | 'request_changes';
  comment?: string;
  timestamp: string;
}
```

## State Management

The approval flow maintains the following states for a template execution:

- **Pending**: Awaiting review by approvers
- **Approved**: Received necessary approvals, execution can continue
- **Rejected**: Execution is terminated, will not proceed
- **Changes Requested**: Paused pending additional information or changes
- **Expired**: Timeout reached without sufficient decisions

## Security Considerations

1. **Authorization**: Only authorized users can approve specific templates
2. **Tampering Prevention**: Cryptographic signatures to verify context integrity
3. **Audit Trail**: Immutable record of all approval activities
4. **Privilege Separation**: Different permission levels for different approval types
5. **Secure Context Sharing**: Controlled exposure of sensitive template parameters

## Scalability Considerations

- **Distributed Approval**: Support for multiple approvers working concurrently
- **Asynchronous Processing**: Non-blocking approval operations
- **Caching**: Efficient caching of approval contexts and status
- **Rate Limiting**: Protection against approval spam or DoS
- **Persistence**: Reliable storage for approval states spanning long durations

## Implementation Phases

1. **Phase 1**: Basic approval flow with single-level approvals
2. **Phase 2**: Multi-level approvals and conditional logic
3. **Phase 3**: External system integration (JIRA, ServiceNow)
4. **Phase 4**: Advanced notification options and mobile support
5. **Phase 5**: Delegation and proxy approval capabilities

## Open Questions

- How to handle approver absence/unavailability?
- What conflict resolution strategies for contradicting decisions?
- How to securely share context without exposing sensitive data?
- What metrics to collect for approval flow effectiveness?

---

_Return to [Approval Flow Documentation](../dev/approval-flow.md)_
