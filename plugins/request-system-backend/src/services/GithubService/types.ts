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

export type PullRequest = {
  id: number;
  number: number;
  title: string;
  description?: string;
  state: 'open' | 'closed' | 'merged';
  url: string;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  authorUrl?: string;
  repositoryName: string;
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
  
  listPullRequests(options: {
    repoId?: string;
    state?: string;
    token: string;
  }): Promise<PullRequest[]>;
}
