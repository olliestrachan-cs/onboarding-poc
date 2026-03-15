// ─── Enumerations ────────────────────────────────────────────────────────────

export type RagStatus = 'green' | 'amber' | 'red' | 'blue';
export type OnboardingStatus = 'complete' | 'in-progress' | 'upcoming';
export type ComplexityKey = 'S' | 'M' | 'L' | 'XL' | 'XXL';
export type RidType = 'Risk' | 'Issue' | 'Dependency';
export type RidSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type RidStatusValue = 'Open' | 'Mitigated' | 'Closed';
export type GanttView = 'week' | 'month' | 'quarter';

// ─── Milestone hierarchy ──────────────────────────────────────────────────────

export interface L1Milestone {
  id: string;
  label: string;
  status: OnboardingStatus;
  rag: RagStatus;
  startDate: string | null;
  endDate: string | null;
  notes: string;
  pathToGreen: string;
  dependsOn: string[];
}

export interface L0Milestone {
  id: string;
  label: string;
  color: string;
  status: OnboardingStatus;
  rag: RagStatus;
  startDate: string | null;
  endDate: string | null;
  notes: string;
  pathToGreen: string;
  isNA?: boolean;
  children: L1Milestone[];
}

// ─── Customer sub-documents ───────────────────────────────────────────────────

export interface Transcript {
  id: string;
  date: string;
  title: string;
  summary: string;
  text: string;
}

export interface MilestoneSnapshot {
  id: string;
  label: string;
  status: OnboardingStatus;
  rag: RagStatus;
  endDate: string | null;
}

/** New format. The legacy format only has { date, text }. */
export interface WeeklyUpdate {
  id: string;
  date: string;
  milestoneSnapshot: MilestoneSnapshot[];
  context: string;
  /** Legacy plain-text field — present on old records only. */
  text?: string;
}

export interface Rid {
  id: string;
  type: RidType;
  title: string;
  severity: RidSeverity;
  status: RidStatusValue;
  linkedMilestone: string | null;
  owner: string;
  description: string;
  mitigation: string;
  createdDate: string;
}

// ─── Top-level entities ───────────────────────────────────────────────────────

export interface Tier {
  id: string;
  label: string;
  color: string;
}

export interface ComplexityConfig {
  key: ComplexityKey;
  capPct: number;
  maxConcurrent: number;
  hoursPerWeek: number;
}

export interface Customer {
  id: string;
  name: string;
  logo: string;
  tier: string;
  complexity: ComplexityKey;
  industry?: string;
  startDate: string;
  targetDate: string | null;
  baselineCompletion: string | null;
  forecastCompletion: string | null;
  onboardingManager: string;
  owner: string;
  stakeholder: string;
  milestones: L0Milestone[];
  transcripts: Transcript[];
  weeklyUpdates: WeeklyUpdate[];
  rids: Rid[];
}
