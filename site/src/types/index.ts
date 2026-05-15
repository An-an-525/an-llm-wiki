export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Content {
  id: string;
  type: 'resource' | 'path' | 'feed' | 'work' | 'journal' | 'timeline' | 'page';
  title: string;
  slug: string;
  description?: string;
  cover?: string;
  body?: string;
  status: 'draft' | 'published' | 'archived';
  tags: Tag[];
  category?: Category;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  sortOrder?: number;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'article' | 'video' | 'book' | 'course' | 'tool' | 'doc';
  description?: string;
}

export type LibraryReaderCategory =
  | 'frontend'
  | 'backend'
  | 'tools'
  | 'agents'
  | 'xiaoan'
  | 'prompts'
  | 'archive'
  | 'security'
  | 'learning'
  | 'sources'
  | 'other';

export interface PathStage {
  id: string;
  title: string;
  description: string;
  order: number;
  resources: Resource[];
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  checklist?: string[];
  deliverable?: string;
  tips?: string;
}

export interface Path {
  id: string;
  title: string;
  description: string;
  cover?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
  status: 'in_progress' | 'completed' | 'planned';
  stages: PathStage[];
  tags: string[];
  whoFor?: string;
  prerequisites?: string[];
  outcomes?: string[];
  actionText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedItem {
  id: string;
  type: 'resource' | 'path_update' | 'work' | 'journal' | 'milestone';
  title: string;
  content: string;
  body?: string;
  link?: string;
  source?: string;
  importanceLevel?: 'critical' | 'important' | 'normal';
  actionText?: string;
  tags: string[];
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  body?: string;
  category: 'milestone' | 'learning' | 'work' | 'life';
  importance: 'normal' | 'important' | 'major';
  cover?: string;
  relatedLinks?: string[];
  achievements?: string[];
  reflection?: string;
  stage?: string;
  actionText?: string;
  relatedPathIds?: string[];
}

export interface Work {
  id: string;
  title: string;
  description: string;
  cover?: string;
  techStack: string[];
  status: 'in_progress' | 'completed' | 'archived';
  link?: string;
  github?: string;
  duration?: string;
  teamSize?: string;
  whoFor?: string;
  recommendedFor?: string;
  challenges?: string;
  learnings?: string;
  whyItMattered?: string;
  operationStory?: string[];
  replicationSteps?: string[];
  failureModes?: string[];
  lessons?: string[];
  anReminders?: string[];
  actionText?: string;
  nextPlan?: string;
  psychologicalLayer?: string;
  sociologicalLayer?: string;
  philosophicalLayer?: string;
  sourceLabels?: string[];
  publicSafety?: string;
  body?: string;
  relatedPathIds?: string[];
  relatedJournalIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  body: string;
  cover?: string;
  readingTime?: number;
  keyTakeaways?: string[];
  actionText?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  relatedPathIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'book' | 'course' | 'tool' | 'doc';
  readerCategory?: LibraryReaderCategory;
  readerCategoryLabel?: string;
  tags: string[];
  links: { label: string; url: string }[];
  rating?: number;
  status: 'todo' | 'doing' | 'done';
  cover?: string;
  useCase?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeToLearn?: string;
  myThoughts?: string;
  isRecommended?: boolean;
  recommendedFor?: string;
  pros?: string[];
  cons?: string[];
  whoFor?: string;
  actionText?: string;
  body?: string;
  sourceLabels?: string[];
  publicSafety?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

export interface SiteConfig {
  title: string;
  subtitle: string;
  description: string;
  navItems: NavItem[];
  modules: {
    library: { enabled: boolean; label: string };
    paths: { enabled: boolean; label: string };
    feed: { enabled: boolean; label: string };
    works: { enabled: boolean; label: string };
    journal: { enabled: boolean; label: string };
    timeline: { enabled: boolean; label: string };
    about: { enabled: boolean; label: string };
  };
}
