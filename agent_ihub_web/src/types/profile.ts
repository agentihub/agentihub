// GitHub Profile 相关类型定义

export interface UserProfile {
  id: string;
  userName: string;
  displayName: string;
  pronouns?: string;
  avatar: string;
  bio: string;
  location?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  discord?: string;
  followers: number;
  following: number;
  isFollowing?: boolean;
  homeEmoji?: string;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks?: number;
  isPublic: boolean;
  isPinned?: boolean;
}

export interface Contribution {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // 0: 无贡献, 1-4: 不同级别的贡献量
}

export interface ContributionYear {
  year: number;
  total: number;
  contributions: Contribution[];
}

export interface Activity {
  id: string;
  type: 'commit' | 'pr' | 'issue' | 'star' | 'fork';
  repository: string;
  description: string;
  timestamp: string;
}

export interface ReadmeSection {
  type: 'heading' | 'text' | 'list' | 'code' | 'image' | 'link';
  content: string;
  level?: number; // for headings
  language?: string; // for code blocks
}

export interface UserStats {
  repositories: number;
  projects: number;
  packages: number;
  stars: number;
}

export interface TabItem {
  key: string;
  label: string;
  count?: number;
  active?: boolean;
}

/**
 * Profile 页面 Tab 类型枚举
 */
export enum ProfileTabType {
  OVERVIEW = 'overview',
  AGENTS = 'agents',
  STARS = 'stars',
  FOLLOWERS = 'followers',
  FOLLOWING = 'following',
}
