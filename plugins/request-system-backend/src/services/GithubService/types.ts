import { Request } from 'express';
import {
  BackstageCredentials,
  BackstageUserPrincipal,
} from '@backstage/backend-plugin-api';

export type GithubRepo = {
  id: string;
  title: string;
  createdBy: string;
  createdAt: string;
  repoUrl?: string;
  repoSlug?: string;
};

export interface GithubService {
  createRepo(
    input: {
      title: string;
      entityRef?: string;
    },
    options: {
      credentials: BackstageCredentials<BackstageUserPrincipal>;
    },
  ): Promise<GithubRepo>;

  listRepos(
    request: Request,
    options: {
      token: string;
    },
  ): Promise<GithubRepo[]>;

  getRepo(request: { id: string }): Promise<GithubRepo>;
}
