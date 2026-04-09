export interface VaultInfo {
  name: string;
  wikiDir: string;
  rawDir: string;
}

export interface WikiPage {
  slug: string;
  title: string;
  type: string;
  created: string;
  updated: string;
  tags: string[];
  sources: string[];
  content: string;
  links: string[];
}

export interface BackupStatus {
  lastBackup: string | null;
  lastLabel: string | null;
  filesUploaded: number;
  inProgress: boolean;
  error: string | null;
}
