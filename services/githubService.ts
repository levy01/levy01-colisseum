
import { GithubRepoData } from '../types';

export const fetchRepoData = async (url: string): Promise<GithubRepoData> => {
  // Extract owner and repo from URL, handling potential .git suffix and trailing slashes
  const match = url.replace(/\.git$/, '').replace(/\/$/, '').match(/github\.com\/([^/]+)\/([^/]+)/);
  
  if (!match) {
    throw new Error('Invalid GitHub URL. Please use the format: https://github.com/owner/repo');
  }

  const [, owner, repo] = match;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  
  const response = await fetch(apiUrl);
  if (!response.ok) {
    if (response.status === 404) throw new Error('Repository not found. Ensure it is a public repository.');
    if (response.status === 403) throw new Error('GitHub API rate limit exceeded. Please try again later.');
    throw new Error('Failed to fetch repository data.');
  }

  return response.json();
};

export const fetchLanguages = async (url: string): Promise<Record<string, number>> => {
  const response = await fetch(url);
  if (!response.ok) return {};
  return response.json();
};
