'use client';

import { useState } from 'react';
import type { Customer } from '@/lib/types';
import { RAG_COLORS, DEFAULT_L0, COMPLEXITY_KEYS } from '@/lib/constants';
import { deriveCustomerRag, getTotalProgress, getSlipDays } from '@/lib/utils';

interface MetricsViewProps {
  customers: Customer[];
  industries: string[];
}

const CMPLX_COLORS: Record<string, string> = {
  S: '#22c55e',
  M: '#0ea5e9',
  L: '#8b5cf6',
  XL: '#f59e0b',
  XXL: '#ef4444',
};

function daysBetween(a: string | null | undefined, b: string | null | undefined): number | null {
  if (!a || !b) return null;
  const da = new Date(a), db = new Date(b);
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return null;
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

export default function MetricsView({ customers, industries }: MetricsViewProps) {
  const [filterComplexity, setFilterComplexity] = useState<string | null>(null);
  const [filterIndustry, setFilterIndustry] = useState<string | null>(null);

  const filtered = customers.filter(c => {
    if (filterComplexity && c.complexity !== filterComplexity) return false;
    if (filterIndustry && c.industry !== filterIndustry) return false;
    return true;
  });

  const completed = filtered.filter(c => getTotalProgress(c.milestones) === 100);
  const active    = filtered.filter(c => getTotalProgress(c.milestones) < 100);

  // RAG distribution
  const ragCounts: Record<string, number> = { green: 0, amber: 0, red: 0, blue: 0 };
  filtered.forEach(c => { ragCounts[deriveCustomerRag(c.milestones)]++; });

  // Phase durations — completed phases only
  const phaseDurMap: Record<string, number[]> = {};
  filtered.forEach(c => {
    c.milestones.forEach(l0 => {
      if (l0.status === 'complete' && l0.startDate && l0.endDate && !l0.isNA) {
        const d = daysBetween(l0.startDate, l0.endDate);
        if (d !== null && d >= 0) {
          if (!phaseDurMap[l0.label]) phaseDurMap[l0.label] = [];
          phaseDurMap[l0.label].push(d);
        }
      }
    });
  });
  const phaseAvgs = DEFAULT_L0
    .map(l0 => ({ label: l0.label, color: l0.color, vals: phaseDurMap[l0.label] || [] }))
    .map(p => ({ ...p, avg: p.vals.length ? Math.round(p.vals.reduce((s, v) => s + v, 0) / p.vals.length) : null }))
    .filter((p): p is typeof p & { avg: number } => p.avg !== null);
  const maxPhaseAvg = Math.max(...phaseAvgs.map(p => p.avg), 1);

  // Avg overall completion for completed onboardings
  const completedDurations = completed
    .map(c => daysBetween(c.startDate, c.forecastCompletion || c.targetDate))
    .filter((d): d is number => d !== null && d > 0);
  const avgCompletionDays = completedDurations.length
    ? Math.round(completedDurations.reduce((s, v) => s + v, 0) / completedDurations.length)
    : null;

  // Duration by complexity
  const byComplexity: Record<string, number[]> = {};
  filtered.forEach(c => {
    const end = c.forecastCompletion || c.targetDate;
    const d = daysBetween(c.startDate, end);
    if (d !== null && d > 0 && c.complexity) {
      if (!byComplexity[c.complexity]) byComplexity[c.complexity] = [];
      byComplexity[c.complexity].push(d);
    }
  });
  const complexityAvgs = COMPLEXITY_KEYS
    .map(k => ({ key: k, count: (byComplexity[k] || []).length, avg: (byComplexity[k] || []).length ? Math.round((byComplexity[k] || []).reduce((s, v) => s + v, 0) / (byComplexity[k] || []).length) : null }))
    .filter((x): x is typeof x & { avg: number } => x.avg !== null);
  const maxComplexityAvg = Math.max(...complexityAvgs.map(x => x.avg), 1);

  // Slip counts
  const slipped = active.filter(c => getSlipDays(c) > 0).length;
  const onTrack  = active.filter(c => getSlipDays(c) <= 0).length;

  // Industry breakdown
  const byIndustry: Record<string, number> = {};
  filtered.forEach(c => { const ind = c.industry || 'Unknown'; byIndustry[ind] = (byIndustry[ind] || 0) + 1; });
  const maxInd = Math.max(...Object.values(byIndustry), 1);

  const presentIndustries = [...new Set(customers.map(c => c.industry).filter(Boolean))].sort() as string[];

  return (
    <div>
      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: '24px', flexWrap: 'wrap' }}>
        <span className="filter-label">Complexity</span>
        {COMPLEXITY_KEYS.map(k => (
          <button key={k} className={`filter-chip ${filterComplexity === k ? 'active' : ''}`} onClick={() => setFilterComplexity(filterComplexity === k ? null : k)}>
            {k}
          </button>
        ))}
        {presentIndustries.length > 0 && (
          <>
            <div className="filter-sep" />
            <span className="filter-label">Industry</span>
            {presentIndustries.map(ind => (
              <button key={ind} className={`filter-chip ${filterIndustry === ind ? 'active' : ''}`} onClick={() => setFilterIndustry(filterIndustry === ind ? null : ind)}>
                {ind}
              </button>
            ))}
          </>
        )}
        {(filterComplexity || filterIndustry) && (
          <button className="filter-chip" style={{ color: '#818cf8', borderColor: '#6366f1' }} onClick={() => { setFilterComplexity(null); setFilterIndustry(null); }}>
            Clear filters
          </button>
        )}
      </div>

      {/* KPI strip */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-value">{filtered.length}</div>
          <div className="stat-label">Onboardings</div>
          <div style={{ fontSize: '11px', color: '#464b5e', marginTop: '4px' }}>{active.length} active &middot; {completed.length} complete</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avgCompletionDays !== null ? `${avgCompletionDays}d` : '—'}</div>
          <div className="stat-label">Avg Completion Time</div>
          <div style={{ fontSize: '11px', color: '#464b5e', marginTop: '4px' }}>{completed.length} completed onboarding{completed.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: slipped > 0 ? '#f59e0b' : '#22c55e' }}>{onTrack}</div>
          <div className="stat-label">Active On Track</div>
          <div style={{ fontSize: '11px', color: '#464b5e', marginTop: '4px' }}>{slipped} slipped</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{filtered.length ? `${Math.round((ragCounts.green + ragCounts.blue) / filtered.length * 100)}%` : '—'}</div>
          <div className="stat-label">Green / Blue RAG</div>
          <div style={{ fontSize: '11px', color: '#464b5e', marginTop: '4px' }}>{ragCounts.amber} amber &middot; {ragCounts.red} red</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Phase avg duration */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Avg Phase Duration</span>
            <span style={{ fontSize: '11px', color: '#464b5e' }}>completed phases only</span>
          </div>
          {phaseAvgs.length === 0
            ? <div style={{ color: '#464b5e', fontSize: '12px', padding: '12px 0' }}>No completed phases in selection</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px' }}>
              {phaseAvgs.map(p => (
                <div key={p.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12px', color: '#c5c8ff' }}>{p.label}</span>
                    <span style={{ fontSize: '12px', color: '#8b8fa3' }}>
                      {p.avg}d <span style={{ fontSize: '10px', color: '#464b5e' }}>({p.vals.length} sample{p.vals.length !== 1 ? 's' : ''})</span>
                    </span>
                  </div>
                  <div style={{ height: '6px', background: '#1e2230', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round((p.avg / maxPhaseAvg) * 100)}%`, height: '100%', background: p.color, borderRadius: '3px' }} />
                  </div>
                </div>
              ))}
            </div>
          }
        </div>

        {/* Duration by complexity */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Avg Duration by Complexity</span>
            <span style={{ fontSize: '11px', color: '#464b5e' }}>forecast or target end date</span>
          </div>
          {complexityAvgs.length === 0
            ? <div style={{ color: '#464b5e', fontSize: '12px', padding: '12px 0' }}>No data in selection</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px' }}>
              {complexityAvgs.map(x => (
                <div key={x.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12px', color: '#c5c8ff' }}>{x.key}</span>
                    <span style={{ fontSize: '12px', color: '#8b8fa3' }}>
                      {x.avg}d <span style={{ fontSize: '10px', color: '#464b5e' }}>({x.count} onboarding{x.count !== 1 ? 's' : ''})</span>
                    </span>
                  </div>
                  <div style={{ height: '6px', background: '#1e2230', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round((x.avg / maxComplexityAvg) * 100)}%`, height: '100%', background: CMPLX_COLORS[x.key], borderRadius: '3px' }} />
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* RAG distribution */}
        <div className="card">
          <div className="card-header"><span className="card-title">RAG Distribution</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px' }}>
            {(['green', 'amber', 'red', 'blue'] as const).map(r => {
              const count = ragCounts[r];
              const pct = filtered.length ? Math.round((count / filtered.length) * 100) : 0;
              return (
                <div key={r}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#c5c8ff' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: RAG_COLORS[r], display: 'inline-block' }} />
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </span>
                    <span style={{ fontSize: '12px', color: '#8b8fa3' }}>{count} <span style={{ fontSize: '10px', color: '#464b5e' }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height: '6px', background: '#1e2230', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: RAG_COLORS[r], borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Industry breakdown */}
        <div className="card">
          <div className="card-header"><span className="card-title">Onboardings by Industry</span></div>
          {Object.keys(byIndustry).length === 0
            ? <div style={{ color: '#464b5e', fontSize: '12px', padding: '12px 0' }}>No industry data in selection</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
              {Object.entries(byIndustry).sort((a, b) => b[1] - a[1]).map(([ind, count]) => (
                <div key={ind}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#c5c8ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>{ind}</span>
                    <span style={{ fontSize: '12px', color: '#8b8fa3' }}>{count}</span>
                  </div>
                  <div style={{ height: '5px', background: '#1e2230', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round((count / maxInd) * 100)}%`, height: '100%', background: '#6366f1', borderRadius: '3px' }} />
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      </div>

      {/* Phase heatmap */}
      <div className="card">
        <div className="card-header"><span className="card-title">Phase Status Heatmap</span></div>
        <div style={{ overflowX: 'auto' }}>
          <table className="ptable">
            <thead>
              <tr>
                <th style={{ minWidth: '140px' }}>Customer</th>
                <th style={{ minWidth: '72px', textAlign: 'center', fontSize: '10px', color: '#6b7088' }}>Complexity</th>
                {DEFAULT_L0.map(l0 => (
                  <th key={l0.id} style={{ textAlign: 'center', fontSize: '11px', minWidth: '96px', color: l0.color }}>{l0.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td className="name-cell" style={{ fontSize: '12px' }}>{c.name}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#8b8fa3' }}>{c.complexity || '—'}</span>
                  </td>
                  {DEFAULT_L0.map(l0 => {
                    const phase = c.milestones.find(m => m.label === l0.label);
                    if (!phase || phase.isNA) {
                      return <td key={l0.id} style={{ textAlign: 'center' }}><span style={{ fontSize: '10px', color: '#2e3348' }}>N/A</span></td>;
                    }
                    const d = daysBetween(phase.startDate, phase.endDate);
                    return (
                      <td key={l0.id} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                          <span className={`rag-pill rag-pill-${phase.rag}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                            <span className="rag-dot rag-dot-sm" style={{ background: RAG_COLORS[phase.rag] }} />
                            {phase.status === 'complete' ? 'Done' : phase.status === 'in-progress' ? 'Active' : '—'}
                          </span>
                          {d !== null && phase.status === 'complete' && <span style={{ fontSize: '9px', color: '#565b6e' }}>{d}d</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
