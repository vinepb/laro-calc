import { OFFENSIVE_SKILL_NAMES } from '../constants/skill-name';

export interface AutoAttackProcDefinition {
  skillName: typeof OFFENSIVE_SKILL_NAMES[number];
  baseSkillLevel: number;
  chanceScriptKey?: string;
  chancePercent?: number;
  useLearnedLevelIfHigher?: boolean;
  requiresMelee?: boolean;
  sourceLabel?: string;
}

export interface AutoAttackProcSummaryModel {
  sourceLabel: string;
  skillLabel: string;
  chancePercent: number;
  minDamage: number;
  maxDamage: number;
  totalHit: number;
  dps: number;
}
