'use client';

import { useState } from 'react';
import type { Customer, ComplexityConfig, ComplexityKey } from '@/lib/types';
import { RAG_COLORS, COMPLEXITY_KEYS, DEFAULT_COMPLEXITY } from '@/lib/constants';
import { deriveCustomerRag, getTotalProgress } from '@/lib/utils';
import ComplexityBadge from '@/app/components/ui/ComplexityBadge';

interface CapacityViewProps {
  customers: Customer[];
  complexityConfig: ComplexityConfig[];
  onUpdateComplexity: (config: ComplexityConfig[]) => void;
  onSelectCustomer: (id: string) => void;
  onUpdateCustomer: (customer: Customer) => void;
}

const COMPLEXITY_COLORS: Record<string, string> = {
  S: '#22c55e',
  M: '#0ea5e9',
  L: '#8b5cf6',
  XL: '#f59e0b',
  XXL: '#ef4444',
};

export default function CapacityView({ customers, complexityConfig, onUpdateComplexity, onSelectCustomer, onUpdateCustomer }: CapacityViewProps) {
  const [cfg, setCfg] = useState([...complexityConfig]);
  const [dirty, setDirty] = useState(false);

  const cfgRow = (key: string) => cfg.find(r => r.key === key) ?? { capPct: 10, maxConcurrent: 6, hoursPerWeek: 4 };
  const isActive = (c: Customer) => getTotalProgress(c.milestones) < 100;
  const active = customers.filter(isActive);
  const managers = [...new Set(customers.map(c => c.onboardingManager || 'Unassigned'))].sort();

  function updateCfg(key: string, field: keyof ComplexityConfig, val: string) {
    setCfg(prev => prev.map(r => r.key === key ? { ...r, [field]: Math.max(1, +val || 1) } : r));
    setDirty(true);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Capacity Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Complexity Capacity Table</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {dirty && (
              <button className="btn btn-primary btn-sm" onClick={() => { onUpdateComplexity(cfg); setDirty(false); }}>
                Save changes
              </button>
            )}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setCfg([...DEFAULT_COMPLEXITY]); setDirty(true); }}
            >
              Reset defaults
            </button>
          </div>
        </div>
        <p style={{ fontSize: '12.5px', color: '#6b7088', marginBottom: '14px', lineHeight: 1.5 }}>
          Define how much capacity each complexity tier consumes per onboarding manager. Click any value to edit.
        </p>
        <table className="cap-table">
          <thead>
            <tr>
              <th>Complexity</th>
              <th>Max concurrent</th>
              <th>Capacity % per onboarding</th>
              <th>Hours / week per onboarding</th>
            </tr>
          </thead>
          <tbody>
            {cfg.map(row => (
              <tr key={row.key}>
                <td><ComplexityBadge complexity={row.key} /></td>
                <td>
                  <input className="cap-input" type="number" min={1} max={20} value={row.maxConcurrent}
                    onChange={e => updateCfg(row.key, 'maxConcurrent', e.target.value)} />
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input className="cap-input" type="number" min={1} max={100} value={row.capPct}
                      onChange={e => updateCfg(row.key, 'capPct', e.target.value)} />
                    <span style={{ fontSize: '12px', color: '#6b7088' }}>%</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input className="cap-input" type="number" min={1} max={80} value={row.hoursPerWeek}
                      onChange={e => updateCfg(row.key, 'hoursPerWeek', e.target.value)} />
                    <span style={{ fontSize: '12px', color: '#6b7088' }}>hrs</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-manager cards */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#c5c8d6', marginBottom: '12px' }}>Manager Capacity</div>
        <div className="manager-grid">
          {managers.map(mgr => {
            const mgrActive = active.filter(c => (c.onboardingManager || 'Unassigned') === mgr);
            const mgrAll = customers.filter(c => (c.onboardingManager || 'Unassigned') === mgr);
            const totalCap = mgrActive.reduce((s, c) => s + cfgRow(c.complexity || 'M').capPct, 0);
            const totalHrs = mgrActive.reduce((s, c) => s + cfgRow(c.complexity || 'M').hoursPerWeek, 0);
            const capColor = totalCap >= 100 ? '#ef4444' : totalCap >= 75 ? '#f59e0b' : '#22c55e';
            const overCap = mgrActive.some(c => {
              const maxC = cfgRow(c.complexity || 'M').maxConcurrent;
              return mgrActive.filter(x => (x.complexity || 'M') === (c.complexity || 'M')).length > maxC;
            });

            return (
              <div key={mgr} className="card">
                <div className="card-header" style={{ marginBottom: '10px' }}>
                  <span className="card-title">{mgr}</span>
                  <span style={{ fontSize: '12px', color: capColor, fontWeight: 700 }}>{totalCap}%</span>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '11px', color: '#6b7088' }}>
                      {mgrActive.length} active · {mgrAll.length - mgrActive.length} complete · {totalHrs} hrs/wk
                    </span>
                    <span style={{ fontSize: '11px', color: capColor, fontWeight: 600 }}>{totalCap}% capacity</span>
                  </div>
                  <div className="cap-bar-track">
                    <div className="cap-bar-fill" style={{ width: `${Math.min(totalCap, 100)}%`, background: capColor }} />
                  </div>
                </div>

                {mgrActive.length === 0
                  ? <div style={{ fontSize: '12px', color: '#464b5e', fontStyle: 'italic' }}>No active onboardings</div>
                  : mgrActive.map(c => {
                    const cx = c.complexity || 'M';
                    const row = cfgRow(cx);
                    const cRag = deriveCustomerRag(c.milestones);
                    const prog = getTotalProgress(c.milestones);
                    const cxColor = COMPLEXITY_COLORS[cx] || '#6b7088';
                    return (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderTop: '1px solid #1a1d28' }}>
                        <select
                          value={cx}
                          onChange={e => onUpdateCustomer({ ...c, complexity: e.target.value as ComplexityKey })}
                          onClick={e => e.stopPropagation()}
                          title="Change complexity"
                          style={{ background: `${cxColor}18`, color: cxColor, border: `1px solid ${cxColor}40`, borderRadius: '4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', padding: '2px 5px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", appearance: 'none', WebkitAppearance: 'none' }}
                        >
                          {COMPLEXITY_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>

                        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => onSelectCustomer(c.id)}>
                          <div style={{ fontSize: '12.5px', color: '#c5c8d6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                          <div style={{ fontSize: '11px', color: '#6b7088' }}>{row.capPct}% · {row.hoursPerWeek}h/wk</div>
                        </div>

                        <span className="rag-dot" style={{ background: RAG_COLORS[cRag], flexShrink: 0 }} />
                        <span style={{ fontSize: '11px', color: '#8b8fa3', fontFamily: "'JetBrains Mono',monospace", minWidth: '28px', textAlign: 'right' }}>{prog}%</span>
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: '11px', flexShrink: 0 }} onClick={() => onSelectCustomer(c.id)}>
                          View →
                        </button>
                      </div>
                    );
                  })
                }

                {overCap && <div className="over-cap-warning">⚠ Exceeds max concurrent for one or more complexity tiers</div>}
                {totalCap > 100 && <div className="over-cap-warning">⚠ Over capacity — {totalCap - 100}% above limit</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
