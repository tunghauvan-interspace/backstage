import { HttpAuthService } from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import { z } from 'zod';
import express from 'express';
import Router from 'express-promise-router';
import { ApprovalService } from './services/ApprovalService/types';

export async function createRouter({
  httpAuth,
  approvalService,
}: {
  httpAuth: HttpAuthService;
  approvalService: ApprovalService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  // TEMPLATE NOTE:
  // Zod is a powerful library for data validation and recommended in particular
  // for user-defined schemas. In this case we use it for input validation too.
  //
  // If you want to define a schema for your API we recommend using Backstage's
  // OpenAPI tooling: https://backstage.io/docs/next/openapi/01-getting-started
  const approvalSchema = z.object({
    title: z.string(),
    entityRef: z.string().optional(),
  });

  const updateStatusSchema = z.object({
    status: z.enum(['approved', 'rejected']),
    comment: z.string().optional(),
  });

  router.post('/approvals', async (req, res) => {
    const parsed = approvalSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new InputError(parsed.error.toString());
    }

    const result = await approvalService.createApproval(parsed.data, {
      credentials: await httpAuth.credentials(req, { allow: ['user'] }),
    });

    res.status(201).json(result);
  });

  router.get('/approvals', async (_req, res) => {
    res.json(await approvalService.listApprovals());
  });

  router.get('/approvals/:id', async (req, res) => {
    res.json(await approvalService.getApproval({ id: req.params.id }));
  });

  router.put('/approvals/:id/status', async (req, res) => {
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new InputError(parsed.error.toString());
    }

    const result = await approvalService.updateApprovalStatus(
      {
        id: req.params.id,
        status: parsed.data.status,
        comment: parsed.data.comment,
      },
      {
        credentials: await httpAuth.credentials(req, { allow: ['user'] }),
      },
    );

    res.json(result);
  });

  return router;
}
