'use client';

import { useState } from 'react';
import type { Customer, Tier } from '@/lib/types';
import { RAG_COLORS, RAG_LABELS, DEFAULT_L0 } from '@/lib/constants';
import { deriveCustomerRag, getTotalProgress, getSlipDays, fmtDate } from '@/lib/utils';
import TierBadge from '@/app/components/ui/TierBadge';
import EditCustomerModal from '@/app/components/modals/EditCustomerModal';

interface PortfolioTableProps {
  customers: Customer[];
  onSelectCustomer: (id: string) => void;
  onUpdateCustomer: (customer: Customer) => void;
  tiers: Tier[];
  industries: string[];
}

type SortKey = 'name' | 'tier' | 'industry' | 'manager' | 'phase' | 'rag' | 'progress' | 'start' | 'baseline' | 'forecast' | 'slip';
type FilterStatus = 'active' | 'complete' | null;

const RAG_ORDER: Record<string, number> = { red: 0, amber: 1, green: 2, blue: 3 };
const ALL_PHASES = DEFAULT_L0.map(l => l.label);

function getCurrentPhase(c: Customer): string {
  const p =
    c.milestones.find(m => m.status === 'in-progress') ||
    c.milestones.find(m => m.status !== 'complete') ||
    c.milestones[c.milestones.length - 1];
  return p?.label ?? '\u2014';
}

export default function PortfolioTable({ customers, onSelectCustomer, onUpdateCustomer, tiers, industries }: PortfolioTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterRag, setFilterRag] = useState<string | null>(null);
  const [filterPhase, setFilterPhase] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<string | null>(null);
  const [filterMgr, setFilterMgr] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('active');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const allManagers = [...new Set(customers.map(c => c.onboardingManager || 'Unassigned'))].sort();

  const toggle = <T,>(current: T | null, val: T): T | null => current === val ? null : val;

  // Filter
  let filtered = customers;
  if (filterStatus === 'active')    filtered = filtered.filter(c => getTotalProgress(c.milestones) < 100);
  if (filterStatus === 'complete')  filtered = filtered.filter(c => getTotalProgress(c.milestones) === 100);
  if (filterRag)   filtered = filtered.filter(c => deriveCustomerRag(c.milestones) === filterRag);
  if (filterPhase) filtered = filtered.filter(c => getCurrentPhase(c) === filterPhase);
  if (filterTier)  filtered = filtered.filter(c => c.tier === filterTier);
  if (filterMgr)   filtered = filtered.filter(c => (c.onboardingManager || 'Unassigned') === filterMgr);

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let av: string | number, bv: string | number;
    switch (sortKey) {
      case 'name':     av = a.name.toLowerCase();                         bv = b.name.toLowerCase();                         break;
      case 'tier':     av = a.tier;                                        bv = b.tier;                                        break;
      case 'industry': av = (a.industry || '').toLowerCase();              bv = (b.industry || '').toLowerCase();              break;
      case 'manager':  av = (a.onboardingManager || '').toLowerCase();     bv = (b.onboardingManager || '').toLowerCase();     break;
      case 'phase':    av = getCurrentPhase(a);                            bv = getCurrentPhase(b);                            break;
      case 'rag':      av = RAG_ORDER[deriveCustomerRag(a.milestones)];    bv = RAG_ORDER[deriveCustomerRag(b.milestones)];    break;
      case 'progress': av = getTotalProgress(a.milestones);                bv = getTotalProgress(b.milestones);                break;
      case 'start':    av = a.startDate || '';                             bv = b.startDate || '';                             break;
      case 'baseline': av = a.baselineCompletion || '';                    bv = b.baselineCompletion || '';                    break;
      case 'forecast': av = a.forecastCompletion || '';                    bv = b.forecastCompletion || '';                    break;
      case 'slip':     av = getSlipDays(a);                                bv = getSlipDays(b);                                break;
      default:         av = a.name;                                        bv = b.name;
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  function SortTh({ k, children }: { k: SortKey; children: React.ReactNode }) {
    return (
      <th className={sortKey === k ? 'sorted' : ''} onClick={() => handleSort(k)}>
        {children}
        <span className="sort-arrow">{sortKey === k ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : ''}</span>
      </th>
    );
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', gap: '2px', background: '#1a1d28', borderRadius: '6px', padding: '2px', marginRight: '4px' }}>
          {([['active', 'Active'], ['complete', 'Complete'], ['all', 'All']] as const).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilterStatus(v === 'all' ? null : v)}
              style={{ fontSize: '10px', padding: '3px 9px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: (filterStatus ?? 'all') === v ? '#2e3348' : 'transparent', color: (filterStatus ?? 'all') === v ? '#c5c8d6' : '#565b6e', fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="filter-sep" />
        <span className="filter-label">RAG</span>
        {['green', 'amber', 'red', 'blue'].map(r => (
          <button key={r} className={`filter-chip filter-chip-rag ${filterRag === r ? `active-${r}` : ''}`} onClick={() => setFilterRag(toggle(filterRag, r))}>
            {RAG_LABELS[r]}
          </button>
        ))}
        <div className="filter-sep" />
        <span className="filter-label">Phase</span>
        {ALL_PHASES.map(p => (
          <button key={p} className={`filter-chip ${filterPhase === p ? 'active' : ''}`} onClick={() => setFilterPhase(toggle(filterPhase, p))}>
            {p}
          </button>
        ))}
        <div className="filter-sep" />
        <span className="filter-label">Tier</span>
        {tiers.map(t => (
          <button key={t.id} className={`filter-chip ${filterTier === t.label ? 'active' : ''}`} onClick={() => setFilterTier(toggle(filterTier, t.label))}>
            {t.label}
          </button>
        ))}
        {allManagers.length > 1 && (
          <>
            <div className="filter-sep" />
            <span className="filter-label">Manager</span>
            {allManagers.map(m => (
              <button key={m} className={`filter-chip ${filterMgr === m ? 'active' : ''}`} onClick={() => setFilterMgr(toggle(filterMgr, m))}>
                {m}
              </button>
            ))}
          </>
        )}
        {(filterRag || filterPhase || filterTier || filterMgr) && (
          <button
            className="filter-chip"
            style={{ color: '#818cf8', borderColor: '#6366f1' }}
            onClick={() => { setFilterRag(null); setFilterPhase(null); setFilterTier(null); setFilterMgr(null); }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="ptable">
          <thead>
            <tr>
              <SortTh k="name">Customer</SortTh>
              <SortTh k="tier">Tier</SortTh>
              <SortTh k="industry">Industry</SortTh>
              <SortTh k="manager">Manager</SortTh>
              <SortTh k="phase">Current Phase</SortTh>
              <SortTh k="rag">RAG</SortTh>
              <SortTh k="progress">Progress</SortTh>
              <SortTh k="start">Start</SortTh>
              <SortTh k="baseline">Baseline</SortTh>
              <SortTh k="forecast">Forecast</SortTh>
              <SortTh k="slip">Slip</SortTh>
              <th style={{ cursor: 'default' }}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(c => {
              const cRag = deriveCustomerRag(c.milestones);
              const pr = getTotalProgress(c.milestones);
              const slip = getSlipDays(c);
              const slipClass = slip <= 0 ? 'slip-on-track' : slip <= 14 ? 'slip-minor' : 'slip-major';
              return (
                <tr key={c.id} className="clickable" onClick={() => onSelectCustomer(c.id)}>
                  <td className="name-cell">{c.name}</td>
                  <td><TierBadge tier={c.tier} tiers={tiers} /></td>
                  <td style={{ color: '#8b8fa3', fontSize: '12px' }}>{c.industry || '\u2014'}</td>
                  <td style={{ color: '#8b8fa3' }}>{c.onboardingManager || '\u2014'}</td>
                  <td style={{ color: '#818cf8', fontSize: '11.5px' }}>{getCurrentPhase(c)}</td>
                  <td>
                    <span className={`rag-pill rag-pill-${cRag}`} style={{ fontSize: '9px', padding: '2px 7px' }}>
                      <span className="rag-dot rag-dot-sm" style={{ background: RAG_COLORS[cRag] }} />
                      {RAG_LABELS[cRag]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '80px' }}>
                      <div style={{ flex: 1, height: '3px', background: '#2e3348', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${pr}%`, height: '100%', background: RAG_COLORS[cRag], borderRadius: '2px' }} />
                      </div>
                      <span className="mono">{pr}%</span>
                    </div>
                  </td>
                  <td className="mono">{fmtDate(c.startDate)}</td>
                  <td className="mono">{fmtDate(c.baselineCompletion)}</td>
                  <td className="mono">{fmtDate(c.forecastCompletion)}</td>
                  <td>
                    {slip !== 0
                      ? <span className={`slip ${slipClass}`}>{slip > 0 ? `+${slip}d` : `${slip}d`}</span>
                      : <span className="mono" style={{ color: '#565b6e' }}>{'\u2014'}</span>}
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setEditingCustomer(c); }}>
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '32px', color: '#464b5e' }}>
                  No onboardings match filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: '11px', color: '#464b5e', marginTop: '10px' }}>
        {sorted.length} of {customers.length} onboardings shown
      </div>

      {editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSave={u => { onUpdateCustomer(u); setEditingCustomer(null); }}
          tiers={tiers}
          industries={industries}
        />
      )}
    </div>
  );
}
