import type { Customer, L0Milestone, RagStatus, OnboardingStatus } from './types';

// ─── RAG / status derivation ─────────────────────────────────────────────────

export function deriveL0Rag(
  children: L0Milestone['children'],
  fallback: RagStatus,
): RagStatus {
  if (!children.length) return fallback;
  if (children.some(c => c.rag === 'red'))   return 'red';
  if (children.some(c => c.rag === 'amber')) return 'amber';
  if (children.some(c => c.rag === 'green')) return 'green';
  return 'blue';
}

export function deriveL0Status(
  children: L0Milestone['children'],
  fallback: OnboardingStatus,
): OnboardingStatus {
  if (!children.length) return fallback;
  if (children.every(c => c.status === 'complete'))  return 'complete';
  if (children.some(c => c.status === 'in-progress' || c.status === 'complete')) return 'in-progress';
  return 'upcoming';
}

export function deriveCustomerRag(milestones: L0Milestone[]): RagStatus {
  const active = milestones.filter(m => !m.isNA);
  if (!active.length) return 'blue';
  if (active.some(m => m.rag === 'red'   || m.children.some(c => c.rag === 'red')))   return 'red';
  if (active.some(m => m.rag === 'amber' || m.children.some(c => c.rag === 'amber'))) return 'amber';
  if (active.some(m => m.rag === 'green' || m.children.some(c => c.rag === 'green'))) return 'green';
  return 'blue';
}

// ─── Syncing ──────────────────────────────────────────────────────────────────

export function syncL0(l0: L0Milestone): L0Milestone {
  if (l0.isNA || !l0.children.length) return l0;
  let minStart: string | null = null;
  let maxEnd: string | null = null;
  l0.children.forEach(c => {
    if (c.startDate && (!minStart || new Date(c.startDate) < new Date(minStart))) minStart = c.startDate;
    if (c.endDate   && (!maxEnd   || new Date(c.endDate)   > new Date(maxEnd)))   maxEnd   = c.endDate;
  });
  return {
    ...l0,
    status:    deriveL0Status(l0.children, l0.status),
    rag:       deriveL0Rag(l0.children, l0.rag),
    startDate: minStart ?? l0.startDate,
    endDate:   maxEnd   ?? l0.endDate,
  };
}

// ─── Progress ────────────────────────────────────────────────────────────────

export function getL0Progress(l0: L0Milestone): number {
  if (!l0.children.length) {
    return l0.status === 'complete' ? 100 : l0.status === 'in-progress' ? 50 : 0;
  }
  return Math.round(
    (l0.children.filter(c => c.status === 'complete').length / l0.children.length) * 100,
  );
}

export function getTotalProgress(milestones: L0Milestone[]): number {
  const active   = milestones.filter(m => !m.isNA);
  const statuses = active.flatMap(l =>
    l.children.length ? l.children.map(c => c.status) : [l.status],
  );
  const done = statuses.filter(s => s === 'complete').length;
  return statuses.length ? Math.round((done / statuses.length) * 100) : 0;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function fmtDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function fmtRange(sd: string | null | undefined, ed: string | null | undefined): string {
  if (!sd && !ed) return '—';
  if (sd && ed)   return `${fmtDate(sd)} – ${fmtDate(ed)}`;
  return fmtDate(sd ?? ed);
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function getSlipDays(customer: Customer): number {
  if (!customer.baselineCompletion || !customer.forecastCompletion) return 0;
  return Math.round(
    (new Date(customer.forecastCompletion).getTime() - new Date(customer.baselineCompletion).getTime()) /
    (24 * 60 * 60 * 1000),
  );
}

// ─── Tier helpers ─────────────────────────────────────────────────────────────

export function getTierColor(label: string, tiers: Array<{ label: string; color: string }>): string {
  return tiers.find(t => t.label === label)?.color ?? '#8b8fa3';
}

// ─── Status / RAG cycling ─────────────────────────────────────────────────────

export function nextStatus(s: OnboardingStatus): OnboardingStatus {
  const cycle: OnboardingStatus[] = ['upcoming', 'in-progress', 'complete'];
  return cycle[(cycle.indexOf(s) + 1) % cycle.length];
}

export function nextRag(r: RagStatus): RagStatus {
  const cycle: RagStatus[] = ['green', 'amber', 'red', 'blue'];
  return cycle[(cycle.indexOf(r) + 1) % cycle.length];
}
