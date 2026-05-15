import type { Path } from '@/types';
import { libraryItems, pathDetails, paths } from './siteData.generated';

export interface PathDetail {
  id: string;
  title: string;
  description: string;
  cover?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
  status: 'in_progress' | 'completed' | 'planned';
  stages: Path['stages'];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  whoFor?: string;
  actionText?: string;
  prerequisites: { title: string; description: string }[];
  outcomes: string[];
  longDescription: string;
  pitfalls: { title: string; description: string }[];
  advancedDirections: { title: string; link: string }[];
  relatedResourceIds: string[];
}

export { pathDetails, paths };

export function getRelatedResources(pathId: string) {
  const detail = pathDetails[pathId];
  if (!detail) return [];
  return libraryItems.filter((item) => detail.relatedResourceIds.includes(item.id));
}

export default paths;
