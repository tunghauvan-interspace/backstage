import {
  BackstageCredentials,
  BackstageUserPrincipal,
} from '@backstage/backend-plugin-api';

export interface GithubRepo {
  title: string;
  id: string;
  createdBy: string;
  createdAt: string;
  repoUrl?: string;
  repoSlug?: string;
}

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

  listRepos(): Promise<{ items: GithubRepo[] }>;

  getRepo(request: { id: string }): Promise<GithubRepo>;
}
