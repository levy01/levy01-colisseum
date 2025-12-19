
export interface GithubRepoData {
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  languages_url: string;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  topics: string[];
}

export interface AIAnalysis {
  summary: string;
  potentialIssues: string[];
  recommendations: string[];
  score: number;
  techStackInsights: string[];
}

export interface AppState {
  repoUrl: string;
  isLoading: boolean;
  repoData: GithubRepoData | null;
  analysis: AIAnalysis | null;
  error: string | null;
}
