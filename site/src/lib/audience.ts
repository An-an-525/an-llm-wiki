import type { LibraryItem, Path } from '@/types';

export type AudienceTier = 'beginner' | 'geek' | 'master';

export type AudienceFilter = 'all' | AudienceTier;

export const audienceOrder: AudienceTier[] = ['beginner', 'geek', 'master'];

export const audienceConfig: Record<
  AudienceTier,
  {
    label: string;
    hint: string;
    bg: string;
    text: string;
    border: string;
  }
> = {
  beginner: {
    label: '入门',
    hint: '看目标、步骤和最小成果',
    bg: 'bg-[#6B9E7C]/10',
    text: 'text-[#6B9E7C]',
    border: 'border-[#6B9E7C]/30',
  },
  geek: {
    label: '进阶',
    hint: '看结构、边界和方法',
    bg: 'bg-[#C8956C]/10',
    text: 'text-[#C8956C]',
    border: 'border-[#C8956C]/30',
  },
  master: {
    label: '深水',
    hint: '看系统、治理和长期维护',
    bg: 'bg-[#C47D6E]/10',
    text: 'text-[#C47D6E]',
    border: 'border-[#C47D6E]/30',
  },
};

export const audienceFilters = [
  { key: 'all', label: '全部' },
  ...audienceOrder.map((key) => ({
    key,
    label: audienceConfig[key].label,
  })),
] as const;

export function getAudienceTierFromLibraryDifficulty(
  difficulty?: LibraryItem['difficulty']
): AudienceTier {
  switch (difficulty) {
    case 'medium':
      return 'geek';
    case 'hard':
      return 'master';
    case 'easy':
    default:
      return 'beginner';
  }
}

export function getAudienceTierFromPathDifficulty(
  difficulty?: Path['difficulty']
): AudienceTier {
  switch (difficulty) {
    case 'intermediate':
      return 'geek';
    case 'advanced':
      return 'master';
    case 'beginner':
    default:
      return 'beginner';
  }
}

export function getAudienceTierLabel(tier: AudienceTier) {
  return audienceConfig[tier].label;
}

export function getAudienceTierHint(tier: AudienceTier) {
  return audienceConfig[tier].hint;
}
