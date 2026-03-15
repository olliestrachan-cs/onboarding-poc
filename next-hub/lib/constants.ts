import type { ComplexityConfig, Tier } from './types';

// ─── RAG ──────────────────────────────────────────────────────────────────────

export const RAG_COLORS: Record<string, string> = {
  green: '#22c55e',
  amber: '#f59e0b',
  red:   '#ef4444',
  blue:  '#3b82f6',
};

export const RAG_LABELS: Record<string, string> = {
  green: 'Green',
  amber: 'Amber',
  red:   'Red',
  blue:  'Blue',
};

export const RAG_CYCLE = ['green', 'amber', 'red', 'blue'] as const;

// ─── Default templates ────────────────────────────────────────────────────────

export const DEFAULT_L0 = [
  { id: 'l0-1', label: 'Kickoff',            color: '#6366f1' },
  { id: 'l0-2', label: 'Discovery',          color: '#8b5cf6' },
  { id: 'l0-3', label: 'Configuration',      color: '#0ea5e9' },
  { id: 'l0-4', label: 'Artifact Migration', color: '#14b8a6' },
  { id: 'l0-5', label: 'Rollout',            color: '#f59e0b' },
  { id: 'l0-6', label: 'Decommission',       color: '#22c55e' },
] as const;

export const DEFAULT_TIERS: Tier[] = [
  { id: 't1', label: 'Strategic', color: '#a78bfa' },
  { id: 't2', label: 'Enterprise', color: '#38bdf8' },
  { id: 't3', label: 'Ultra',      color: '#f59e0b' },
];

export const DEFAULT_INDUSTRIES: string[] = [
  'Artificial Intelligence',
  'Cloud Infrastructure',
  'Data & Analytics',
  'Developer Tools',
  'Financial Services',
  'Healthcare',
  'Manufacturing',
  'Media & Entertainment',
  'Retail',
  'Telecommunications',
];

export const DEFAULT_COMPLEXITY: ComplexityConfig[] = [
  { key: 'S',   capPct: 10, maxConcurrent: 6, hoursPerWeek: 4  },
  { key: 'M',   capPct: 15, maxConcurrent: 6, hoursPerWeek: 6  },
  { key: 'L',   capPct: 20, maxConcurrent: 5, hoursPerWeek: 8  },
  { key: 'XL',  capPct: 20, maxConcurrent: 4, hoursPerWeek: 8  },
  { key: 'XXL', capPct: 50, maxConcurrent: 3, hoursPerWeek: 16 },
];

export const COMPLEXITY_KEYS = ['S', 'M', 'L', 'XL', 'XXL'] as const;

// ─── RID ──────────────────────────────────────────────────────────────────────

export const RID_TYPES    = ['Risk', 'Issue', 'Dependency'] as const;
export const RID_SEVERITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
export const RID_STATUSES   = ['Open', 'Mitigated', 'Closed'] as const;

export const RID_SEV_COLORS: Record<string, string> = {
  Low:      '#565b6e',
  Medium:   '#f59e0b',
  High:     '#ef4444',
  Critical: '#dc2626',
};
