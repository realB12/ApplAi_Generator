export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  gistUrl?: string;
  masterResumeFile?: string;
  preferredCvName?: string;
}

export interface MasterCVNode {
  id: string;
  label: string;
  selected: boolean;
  expanded: boolean;
  info?: string;
  children?: MasterCVNode[];
}

export interface GistFile {
  filename: string;
  raw_url?: string;
}