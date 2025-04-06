# Approval Workflow Usage Examples

This document provides examples of how to use the `scaffolder:approval` action in different scenarios.

## Basic Approval Step

```yaml
steps:
  - id: request-approval
    name: Request Approval
    action: scaffolder:approval
    input:
      title: Basic Approval Request
      description: Please review and approve to continue
      approvers: ['user:default/johndoe', 'group:default/admins']
```

## Multi-level Approval Process

```yaml
steps:
  # First level - Team Lead approval
  - id: team-lead-approval
    name: Team Lead Approval
    action: scaffolder:approval
    input:
      title: Team Lead Approval
      description: Team lead needs to approve this resource creation
      approvers: ['user:default/teamlead']
  
  # Second level - Security approval
  - id: security-approval
    name: Security Approval
    action: scaffolder:approval
    input:
      title: Security Review
      description: Security team needs to verify this resource meets security requirements
      approvers: ['group:default/security-team']
      minApprovals: 2
```

## Conditional Approval Based on Parameters

```yaml
steps:
  - id: conditional-approval
    name: Conditional Approval Step
    action: scaffolder:approval
    if: ${{ parameters.requiresApproval === true }}
    input:
      title: Production Deployment Approval
      description: This deployment targets production and requires approval
      approvers: ${{ parameters.environment === 'production' ? parameters.productionApprovers : parameters.stagingApprovers }}
      minApprovals: ${{ parameters.environment === 'production' ? 3 : 1 }}
      timeoutInMinutes: 1440  # 1 day
```

## Using Approval Results

```yaml
steps:
  - id: approval-step
    name: Get Approval
    action: scaffolder:approval
    input:
      title: Approve Resource Creation
      description: Review the proposed resources
      approvers: ['group:default/reviewers']
  
  - id: handle-approval-result
    name: Handle Approval Result
    action: debug:log
    input:
      message: |
        Approval decision: ${{ steps.approval-step.output.approved ? 'APPROVED' : 'REJECTED' }}
        Request ID: ${{ steps.approval-step.output.requestId }}
        Number of decisions: ${{ steps.approval-step.output.decisions.length }}
```

## Approval with External System Integration

If you have integrated your approval system with external tools:

```yaml
steps:
  - id: jira-linked-approval
    name: JIRA-Linked Approval
    action: scaffolder:approval
    input:
      title: Resource Approval (JIRA Integration)
      description: |
        This will create the following resources:
        - New S3 bucket
        - IAM roles
        - Lambda function
      approvers: ['group:default/cloud-admins']
      externalSystem: 'jira'
      externalConfig:
        project: 'CLOUD'
        issueType: 'Approval'
```

Remember that the approval step will pause the template execution until it receives the required number of approvals or is rejected.
