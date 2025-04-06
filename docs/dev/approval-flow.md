# Approval Flow for Software Templates

> **Navigation**: [Home](../README.md) > Approval Flow

Approval flows add governance to your software template scaffolding process, allowing designated approvers to review and authorize template executions before they complete. This document explains how to configure and implement approval flows in Backstage.

## Introduction

When working in regulated environments or with critical infrastructure, you may need additional oversight before allowing new services or components to be created. The approval flow feature provides this governance layer by:

1. Pausing template execution at a designated step
2. Notifying approvers about the pending request
3. Allowing approvers to review details and make decisions
4. Continuing or aborting the workflow based on approval decisions

## Development Process

### To-Do Tasks

- [x] **Feature Specification**: Define the approval flow requirements and user stories
- [ ] **Architecture Design**: Design the approval flow architecture and integration points
- [ ] **Notification System**: Implement notification delivery to approvers
- [ ] **UI Components**: Create approval request and response interfaces
- [ ] **Backend Logic**: Implement approval state management and workflow control
- [ ] **Testing**: Write unit and integration tests for approval flows
- [ ] **Documentation**: Complete this guide with all implementation details
- [ ] **Examples**: Provide working examples for common approval scenarios

### Feature List

| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Basic Approval Flow | High | Complete | Core approval step implementation |
| Multiple Approvers | High | Complete | Support for requiring approvals from multiple users |
| Timeout Handling | Medium | Complete | Auto-approve/reject based on configured timeout |
| Conditional Approvals | Medium | Complete | Context-aware approval requirements |
| External System Integration | Low | In Progress | Integration with ticket systems like JIRA |
| Approval History | Medium | Planned | Track history of approvals for audit purposes |
| Mobile Notifications | Low | Planned | Push notifications for mobile approvers |
| Approval Delegation | Low | Not Started | Allow approvers to delegate to others |

## Configuring Approval Flows

### Prerequisites

- Backstage with Software Templates plugin installed
- Configured authentication and authorization providers
- Optional: Notification system for alerting approvers

### Basic Configuration

To add an approval step to your template, use the `scaffolder:approval` action:

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: service-with-approval
  title: Create Service with Approval
spec:
  owner: team-platform
  type: service
  parameters:
    # ... template parameters ...
  steps:
    # Initial steps to create resources
    - id: fetch-base
      name: Fetch Base
      action: fetch:template
      input:
        url: ./templates/service-template
        values:
          name: ${{ parameters.name }}
          description: ${{ parameters.description }}
    
    # Approval step
    - id: approval-required
      name: Get Manager Approval
      action: scaffolder:approval
      input:
        title: Approve new service creation
        description: |
          A new service is being created with the following details:
          - Name: ${{ parameters.name }}
          - Owner: ${{ parameters.owner }}
          - Description: ${{ parameters.description }}
        approvers:
          - group:team-leads
          - user:manager-id
        timeoutInMinutes: 2880 # 48 hours
    
    # Steps that run only after approval
    - id: publish
      name: Publish
      action: publish:github
      input:
        repoUrl: ${{ parameters.repoUrl }}
        description: ${{ parameters.description }}
```

### Configuration Options

The approval action accepts the following input properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | string | Yes | Title of the approval request |
| `description` | string | Yes | Detailed description of what is being approved |
| `approvers` | array | Yes | List of users or groups who can approve |
| `minApprovals` | number | No | Minimum number of approvals required (default: 1) |
| `timeoutInMinutes` | number | No | How long to wait for approval before timing out |
| `requiredDecision` | string | No | Can be 'approve' or 'reject' or undefined for either |

## Approval Process

### For Template Users

1. **Initiate Template**: A user selects and fills in the template form
2. **Pre-approval Steps**: Any steps before the approval action run normally
3. **Waiting for Approval**: The workflow pauses, and the user sees a status indicating approval is pending
4. **Notification**: The system notifies designated approvers
5. **Post-approval**: Once approved, remaining steps continue automatically

### For Approvers

1. **Receive Notification**: Approvers are notified of pending requests
2. **Review Request**: Review the template details and any related information
3. **Make Decision**: Approvers can:
   - Approve the request
   - Reject the request
   - Request changes (with comments)
4. **Provide Feedback**: Add comments explaining the decision

## Advanced Configuration

### Multiple Approval Levels

You can create templates with multiple approval steps for complex workflows:

```yaml
steps:
  # First level approval
  - id: team-lead-approval
    name: Team Lead Approval
    action: scaffolder:approval
    input:
      title: Team Lead Approval
      approvers:
        - group:team-leads

  # Some intermediate steps
  - id: intermediate-setup
    name: Intermediate Setup
    action: debug:log
    input:
      message: Setting up intermediate resources...
    if: ${{ steps['team-lead-approval'].output.decision === 'approved' }}

  # Second level approval
  - id: security-approval
    name: Security Team Approval
    action: scaffolder:approval
    input:
      title: Security Review
      approvers:
        - group:security-team
```

### Conditional Approvals

You can make approval steps conditional based on template parameters:

```yaml
steps:
  - id: conditional-approval
    name: Conditional Approval
    action: scaffolder:approval
    if: ${{ parameters.requiresApproval === true }}
    input:
      title: Approve Production Deployment
      approvers:
        - group:production-approvers
```

### Approval Timeouts

Setting timeouts ensures that requests don't remain pending indefinitely:

```yaml
- id: time-sensitive-approval
  name: Time Sensitive Approval
  action: scaffolder:approval
  input:
    title: Urgent Change Approval
    timeoutInMinutes: 60 # 1 hour timeout
    timeoutAction: reject # or 'approve' to auto-approve on timeout
```

## Integration with External Systems

### JIRA Integration

```yaml
- id: approval-with-ticket
  name: Approval with JIRA Ticket
  action: scaffolder:approval
  input:
    title: Approve Service Creation
    externalSystemConfig:
      type: jira
      project: APPROVAL
      issueType: Approval Request
```

### ServiceNow Integration

```yaml
- id: servicenow-approval
  name: ServiceNow Change Request
  action: scaffolder:approval
  input:
    title: Change Request Approval
    externalSystemConfig:
      type: servicenow
      changeRequestType: normal
```

## Best Practices

1. **Clear Descriptions**: Provide detailed information about what is being approved
2. **Reasonable Timeouts**: Set appropriate timeouts based on urgency and availability of approvers
3. **Fallback Approvers**: Configure multiple approvers or groups to prevent bottlenecks
4. **Actionable Notifications**: Ensure notifications contain direct links to the approval interface
5. **Audit Trail**: Maintain records of who approved what and when

## Troubleshooting

### Common Issues

1. **Stuck in Approval State**: Check if approvers have been notified and if the timeout is configured correctly
2. **Unauthorized Approvers**: Verify that approvers have the necessary permissions
3. **Missing Notifications**: Ensure notification providers are properly configured

### Debugging

Enable debug logging for approval flows:

```yaml
app:
  logging:
    level: debug
    areas:
      scaffolder-approval: debug
```

## Conclusion

Approval flows provide a critical governance layer for software template execution in regulated or sensitive environments. By properly configuring approvals, you can ensure that all new resources created through Backstage meet your organization's compliance and security requirements.

## See Also

- [Writing Templates](../writing-template.md)
- [Custom Actions](../custom-actions.md)
- [Built-in Actions](../buildin-actions.md)

---

_Return to [Software Templates Home](../index.md)_