'use client';

import { useState } from 'react';
import type {
  Customer, Tier, L0Milestone, L1Milestone, Rid, MilestoneSnapshot,
  RagStatus, OnboardingStatus,
} from '@/lib/types';
import { RAG_COLORS, RAG_LABELS, RID_TYPES, RID_STATUSES, RID_SEV_COLORS } from '@/lib/constants';
import {
  deriveCustomerRag, getTotalProgress, getL0Progress, syncL0, deriveL0Rag,
  nextStatus, nextRag, fmtDate, fmtRange, today,
} from '@/lib/utils';
import {
  buildL1Lookup, cascadeDependencies, mkL1, copyStatusUpdate,
  exportGanttSVG, exportGanttPNG,
} from '@/app/lib/utils.js';
import CustomerGantt from '@/app/components/dashboard/CustomerGantt';
import RagPill from '@/app/components/ui/RagPill';
import TierBadge from '@/app/components/ui/TierBadge';
import EditCustomerModal from '@/app/components/modals/EditCustomerModal';
import EditMilestoneModal from '@/app/components/modals/EditMilestoneModal';
import AddTranscriptModal from '@/app/components/modals/AddTranscriptModal';
import EditRidModal from '@/app/components/modals/EditRidModal';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CustomerDetailViewProps {
  customer: Customer;
  onUpdate: (customer: Customer) => void;
  tiers: Tier[];
  industries: string[];
}

// ─── Small helpers ────────────────────────────────────────────────────────────

type RidSortKey = 'type' | 'severity' | 'title' | 'status' | 'owner' | 'milestone' | 'date';

function StatusIcon({ status }: { status: OnboardingStatus | 'complete' }) {
  if (status === 'complete') return <>{'\u2713'}</>;
  if (status === 'in-progress') return <>{'\u25C9'}</>;
  return <></>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomerDetailView({ customer, onUpdate, tiers, industries }: CustomerDetailViewProps) {
  const [tab, setTab] = useState<'plan' | 'milestones' | 'transcripts' | 'weekly' | 'rids'>('plan');
  const [expanded, setExpanded] = useState<Set<number>>(() => {
    const ip = customer.milestones.findIndex(m => m.status === 'in-progress');
    return new Set(ip >= 0 ? [ip] : [0]);
  });

  const [editItem, setEditItem] = useState<L0Milestone | L1Milestone | null>(null);
  const [editIsL0, setEditIsL0] = useState(false);
  const [showAddTr, setShowAddTr] = useState(false);
  const [addingL1, setAddingL1] = useState<number | null>(null);
  const [newL1, setNewL1] = useState('');
  const [genUp, setGenUp] = useState(false);
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [manualDate, setManualDate] = useState(today());
  const [manualCtx, setManualCtx] = useState('');
  const [editCust, setEditCust] = useState(false);
  const [editRid, setEditRid] = useState<Rid | Partial<Rid> | null>(null);
  const [viewingTranscript, setViewingTranscript] = useState<Customer['transcripts'][number] | null>(null);
  const [copied, setCopied] = useState(false);
  const [updatesAsc, setUpdatesAsc] = useState(false);
  const [manualSnapshot, setManualSnapshot] = useState<MilestoneSnapshot[]>([]);
  const [copiedUpdateId, setCopiedUpdateId] = useState<string | number | null>(null);
  const [ridSortKey, setRidSortKey] = useState<RidSortKey>('severity');
  const [ridSortDir, setRidSortDir] = useState<'asc' | 'desc'>('desc');
  const [ridFilterType, setRidFilterType] = useState<string | null>(null);
  const [ridFilterStatus, setRidFilterStatus] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(true);

  const cRag = deriveCustomerRag(customer.milestones);
  const l1Lookup = buildL1Lookup(customer.milestones) as Record<string, string>;

  const save = (ms: L0Milestone[]) => onUpdate({ ...customer, milestones: ms });

  // ── Milestone mutations ────────────────────────────────────────────────────

  const cycleL1Status = (l0i: number, l1Id: string) => {
    save(customer.milestones.map((l0, i) => {
      if (i !== l0i) return l0;
      const nc = l0.children.map(c => {
        if (c.id !== l1Id) return c;
        const ns = nextStatus(c.status);
        return {
          ...c,
          status: ns,
          rag: ns === 'complete' ? 'blue' : c.rag === 'blue' ? 'green' : c.rag,
          endDate: ns === 'complete' && !c.endDate ? today() : c.endDate,
          startDate: !c.startDate && ns === 'in-progress' ? today() : c.startDate,
        };
      });
      return syncL0({ ...l0, children: nc });
    }));
  };

  const cycleL0Status = (l0i: number) => {
    if (customer.milestones[l0i].children.length) return;
    save(customer.milestones.map((m, i) => {
      if (i !== l0i) return m;
      const ns = nextStatus(m.status);
      return {
        ...m,
        status: ns,
        rag: ns === 'complete' ? 'blue' : m.rag === 'blue' ? 'green' : m.rag,
        endDate: ns === 'complete' && !m.endDate ? today() : m.endDate,
        startDate: !m.startDate && ns === 'in-progress' ? today() : m.startDate,
      };
    }));
  };

  const handleEditSave = (updated: L0Milestone | L1Milestone) => {
    let ms: L0Milestone[];
    if (editIsL0) {
      const u = updated as L0Milestone;
      ms = customer.milestones.map(m => {
        if (m.id !== u.id) return m;
        const newL0: L0Milestone = {
          ...m,
          isNA: u.isNA,
          notes: u.notes,
          startDate: u.startDate,
          endDate: u.endDate,
          pathToGreen: u.pathToGreen,
        };
        if (u.isNA) {
          newL0.status = 'complete';
          newL0.rag = 'blue';
        } else if (m.children.length === 0) {
          newL0.status = u.status;
          newL0.rag = u.rag;
        }
        return newL0;
      });
    } else {
      const u = updated as L1Milestone;
      let oldEndDate: string | null = null;
      customer.milestones.forEach(l0 => l0.children.forEach(c => { if (c.id === u.id) oldEndDate = c.endDate; }));

      ms = customer.milestones.map(l0 => {
        const nc = l0.children.map(c => c.id === u.id ? u : c);
        const changed = nc.some((c, i) => c !== l0.children[i]);
        return changed ? syncL0({ ...l0, children: nc }) : l0;
      });

      if (oldEndDate !== u.endDate) {
        ms = (cascadeDependencies(ms, u.id, oldEndDate as unknown as string, u.endDate) as L0Milestone[]);
        ms = ms.map(l0 => syncL0(l0));
      }
    }
    save(ms);
    setEditItem(null);
  };

  const addL1Item = (l0i: number) => {
    if (!newL1.trim()) return;
    save(customer.milestones.map((l0, i) =>
      i !== l0i ? l0 : syncL0({ ...l0, children: [...l0.children, mkL1(`l1-${Date.now()}`, newL1.trim()) as L1Milestone] })
    ));
    setNewL1('');
    setAddingL1(null);
  };

  const rmL1 = (l0i: number, l1Id: string) => {
    save(customer.milestones.map((l0, i) => {
      if (i !== l0i) return l0;
      return syncL0({ ...l0, children: l0.children.filter(c => c.id !== l1Id) });
    }));
  };

  // ── AI / snapshot helpers ──────────────────────────────────────────────────

  const buildSnapshot = (): MilestoneSnapshot[] =>
    customer.milestones.filter(l0 => !l0.isNA).map(l0 => ({
      id: l0.id,
      label: l0.label,
      status: l0.status,
      rag: l0.rag,
      endDate: l0.endDate,
    }));

  const summarize = async (tr: Customer['transcripts'][number]) => {
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: `Summarise this onboarding call transcript in 2-3 sentences, focusing on decisions, blockers, and next steps:\n\n${tr.text}` }],
        }),
      });
      const d = await r.json();
      const s = d.content?.map((b: { text?: string }) => b.text || '').join('') || '';
      onUpdate({ ...customer, transcripts: customer.transcripts.map(t => t.id === tr.id ? { ...t, summary: s } : t) });
    } catch {}
  };

  const genWeekly = async () => {
    setGenUp(true);
    setShowAddUpdate(true);
    setManualCtx('');
    setManualSnapshot(buildSnapshot());
    const mCtx = customer.milestones.map(l0 => {
      const l1s = l0.children.map(c =>
        `    [L1] ${c.label}: ${c.status} | RAG: ${c.rag} | ${fmtRange(c.startDate, c.endDate)}${c.pathToGreen ? ` | P2G: ${c.pathToGreen}` : ''}${c.notes ? ` | ${c.notes}` : ''}`
      ).join('\n');
      return `[L0] ${l0.label}: ${l0.status} | RAG: ${l0.rag.toUpperCase()} | ${fmtRange(l0.startDate, l0.endDate)} (${getL0Progress(l0)}%)${l0.pathToGreen ? `\n    Path to Green: ${l0.pathToGreen}` : ''}${l0.notes ? ` | ${l0.notes}` : ''}\n${l1s}`;
    }).join('\n');
    const tCtx = customer.transcripts.slice(-5).map(t => `Call: ${t.title} (${t.date})\n${t.summary || t.text.slice(0, 500)}`).join('\n\n');
    const prev = customer.weeklyUpdates.slice(-3).map(u => `[${u.date}]\n${u.context || u.text || ''}`).join('\n\n');
    const prompt = `You are a senior onboarding manager at Cloudsmith. Generate a weekly status update for ${customer.name}.\n\nCustomer: ${customer.name} (${customer.tier}) | Stakeholder: ${customer.stakeholder}\nTimeline: ${customer.startDate} | Overall RAG: ${cRag.toUpperCase()}\nProgress: ${getTotalProgress(customer.milestones)}%\n\nMilestones with date ranges (phases may overlap):\n${mCtx}\n\nRecent Calls:\n${tCtx || 'None.'}\n${prev ? `\nPrevious Updates:\n${prev}` : ''}\n\nWrite a professional 150-250 word weekly status update narrative:\n1. State overall RAG and current phase(s) — note any running in parallel\n2. Highlight accomplishments (reference specific L1s)\n3. For Amber/Red items: state the issue AND Path to Green actions\n4. Next steps for the coming week\n5. Escalation items if any Red milestones exist\n\nDirect, clear tone for leadership. Use GREEN/AMBER/RED labels. Short paragraphs, no bullets. Do NOT repeat the milestone list — that is shown separately above your text.`;
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] }),
      });
      const d = await r.json();
      const txt = d.content?.map((b: { text?: string }) => b.text || '').join('') || 'Failed.';
      setManualCtx(txt);
    } catch {
      setManualCtx('Error generating update.');
    }
    setGenUp(false);
  };

  const saveManualUpdate = () => {
    const update = { id: 'u' + Date.now(), date: manualDate, milestoneSnapshot: manualSnapshot, context: manualCtx };
    onUpdate({ ...customer, weeklyUpdates: [...customer.weeklyUpdates, update] });
    setShowAddUpdate(false);
    setManualCtx('');
    setManualDate(today());
    setManualSnapshot([]);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div
          className="customer-avatar"
          style={{ background: `linear-gradient(135deg,${customer.milestones[0]?.color},${customer.milestones[2]?.color})`, width: '48px', height: '48px', fontSize: '16px', borderRadius: '12px' }}
        >
          {customer.logo}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px', fontWeight: 600, color: '#f0f1f5' }}>{customer.name}</span>
            <TierBadge tier={customer.tier} tiers={tiers} />
            <RagPill rag={cRag} onClick={() => {}} />
          </div>
          <div style={{ fontSize: '12.5px', color: '#6b7088', marginTop: '3px' }}>
            {customer.industry && <span>{customer.industry} &middot; </span>}
            {customer.onboardingManager && <span>{customer.onboardingManager} &middot; </span>}
            {customer.stakeholder} &middot; {fmtDate(customer.startDate)} &rarr; {fmtDate(customer.targetDate)} &middot; {getTotalProgress(customer.milestones)}% complete
            {customer.forecastCompletion && customer.baselineCompletion && customer.forecastCompletion !== customer.baselineCompletion && (
              <span style={{ color: '#f59e0b' }}> &middot; Forecast: {fmtDate(customer.forecastCompletion)}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditCust(true)}>Edit details</button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => copyStatusUpdate(customer).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}
            >
              {copied ? '\u2713 Copied' : 'Copy Status Update'}
            </button>
          </div>
        </div>
      </div>

      {/* Phase RAG bar */}
      <div style={{ display: 'flex', gap: '3px', marginBottom: '18px' }}>
        {customer.milestones.map(l0 => {
          if (l0.isNA) return (
            <div key={l0.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }} title={`${l0.label}: N/A`}>
              <div style={{ height: '6px', background: '#1e2230', borderRadius: '3px', opacity: 0.5 }} />
              <div style={{ fontSize: '9px', color: '#464b5e', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l0.label}</div>
            </div>
          );
          return (
            <div key={l0.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }} title={`${l0.label}: ${RAG_LABELS[l0.rag]} (${getL0Progress(l0)}%)`}>
              <div style={{ height: '6px', background: '#1e2230', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${getL0Progress(l0)}%`, height: '100%', background: RAG_COLORS[l0.rag], borderRadius: '3px', transition: 'width 0.4s' }} />
              </div>
              <div style={{ fontSize: '9px', color: '#6b7088', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l0.label}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'plan' ? 'active' : ''}`} onClick={() => setTab('plan')}>Plan</button>
        <button className={`tab ${tab === 'milestones' ? 'active' : ''}`} onClick={() => setTab('milestones')}>Milestones</button>
        <button className={`tab ${tab === 'rids' ? 'active' : ''}`} onClick={() => setTab('rids')}>
          RIDs ({(customer.rids || []).filter(r => r.status !== 'Closed').length})
        </button>
        <div style={{ width: '1px', background: '#2e3348', margin: '4px 6px', borderRadius: '1px' }} />
        <button className={`tab ${tab === 'transcripts' ? 'active' : ''}`} onClick={() => setTab('transcripts')}>
          Transcripts ({customer.transcripts.length})
        </button>
        <button className={`tab ${tab === 'weekly' ? 'active' : ''}`} onClick={() => setTab('weekly')}>
          Updates ({customer.weeklyUpdates.length})
        </button>
      </div>

      {/* ── PLAN ── */}
      {tab === 'plan' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '14px', alignItems: 'center' }}>
            <button className={`btn btn-sm ${showProgress ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setShowProgress(p => !p)} style={{ fontSize: '11px' }}>
              {showProgress ? 'Progress' : 'RAG Status'}
            </button>
            <span style={{ width: '1px', height: '18px', background: '#2e3348' }} />
            <button className="btn btn-ghost btn-sm" onClick={() => exportGanttSVG(customer)}>{'\u2B07'} Export SVG</button>
            <button className="btn btn-ghost btn-sm" onClick={() => exportGanttPNG(customer)}>{'\u2B07'} Export PNG</button>
          </div>
          <CustomerGantt customer={customer} showProgress={showProgress} />
          <div style={{ display: 'flex', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
            {(['green', 'amber', 'red'] as const).map(r => (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6b7088' }}>
                <span style={{ width: '20px', height: '6px', borderRadius: '3px', background: RAG_COLORS[r], opacity: 0.55 }} /> {RAG_LABELS[r]}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6b7088' }}>
              <span style={{ width: '20px', height: '6px', borderRadius: '3px', background: RAG_COLORS.blue, opacity: 0.55 }} /> Blue (Complete)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6b7088' }}>
              <span style={{ width: '2px', height: '12px', background: '#ef4444', opacity: 0.6 }} /> Today
            </div>
          </div>
        </div>
      )}

      {/* ── MILESTONES ── */}
      {tab === 'milestones' && (
        <div>
          {customer.milestones.map((l0, l0i) => {
            const open = expanded.has(l0i);
            const prog = l0.isNA ? 100 : getL0Progress(l0);
            return (
              <div
                key={l0.id}
                className="l0-phase"
                style={{
                  borderColor: (l0.rag === 'amber' || l0.rag === 'red') && !l0.isNA ? `${RAG_COLORS[l0.rag]}30` : undefined,
                  opacity: l0.isNA ? 0.6 : 1,
                }}
              >
                <div
                  className="l0-header"
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpanded(p => { const n = new Set(p); n.has(l0i) ? n.delete(l0i) : n.add(l0i); return n; })}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setExpanded(p => { const n = new Set(p); n.has(l0i) ? n.delete(l0i) : n.add(l0i); return n; }); }}
                >
                  <button
                    className={`milestone-check ${l0.isNA ? 'complete' : l0.status}`}
                    onClick={e => { e.stopPropagation(); if (!l0.isNA) cycleL0Status(l0i); }}
                    disabled={l0.isNA}
                    title={l0.isNA ? 'Not Applicable' : l0.children.length ? 'Auto-derived' : 'Click to cycle'}
                  >
                    <StatusIcon status={l0.isNA ? 'complete' : l0.status} />
                  </button>
                  <div className="l0-label">
                    <span className="phase-num">{l0i + 1}</span>
                    <span style={{ textDecoration: l0.isNA ? 'line-through' : 'none' }}>{l0.label}</span>
                    {l0.isNA && (
                      <span style={{ marginLeft: '8px', fontSize: '10px', padding: '2px 6px', background: '#2e3348', borderRadius: '4px', color: '#c5c8d6', fontWeight: 600 }}>N/A</span>
                    )}
                    {l0.children.length > 0 && !l0.isNA && (
                      <span style={{ fontSize: '11px', color: '#565b6e' }}>({l0.children.filter(c => c.status === 'complete').length}/{l0.children.length})</span>
                    )}
                  </div>
                  {!l0.isNA ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="l0-progress-bar" style={{ width: '60px' }}>
                        <div className="l0-progress-fill" style={{ width: `${prog}%`, background: RAG_COLORS[l0.rag] }} />
                      </div>
                      <span style={{ fontSize: '11px', color: '#8b8fa3', fontFamily: "'JetBrains Mono',monospace", minWidth: '28px' }}>{prog}%</span>
                    </div>
                  ) : <div style={{ width: '60px' }} />}
                  {!l0.isNA
                    ? <span className={`status-pill status-${l0.status}`}>{l0.status.replace('-', ' ')}</span>
                    : <span style={{ width: '76px' }} />
                  }
                  {!l0.isNA ? (
                    <RagPill rag={l0.rag} small onClick={e => {
                      e.stopPropagation();
                      if (!l0.children.length && l0.status !== 'complete') {
                        save(customer.milestones.map((m, i) => i === l0i ? { ...m, rag: nextRag(m.rag) } : m));
                      }
                    }} />
                  ) : <span style={{ width: '70px' }} />}
                  <span className={`l0-chevron ${open ? 'open' : ''}`}>{'\u25B8'}</span>
                </div>

                {(l0.rag === 'amber' || l0.rag === 'red') && !l0.isNA && (
                  <div
                    className={`ptg-bar ptg-bar-${l0.rag}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => { setEditItem(l0); setEditIsL0(true); }}
                    title="Click to edit Path to Green"
                  >
                    <span className="ptg-label">Path to Green:</span>
                    <span className="ptg-text">
                      {l0.pathToGreen || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Click to set path to green...</span>}
                    </span>
                  </div>
                )}

                {open && (
                  <div className="l1-container">
                    {l0.isNA && (
                      <div style={{ padding: '8px 10px 14px 32px', fontSize: '12.5px', color: '#8b8fa3', fontStyle: 'italic' }}>
                        This phase is marked as Not Applicable and is excluded from progress calculations.
                      </div>
                    )}
                    {l0.notes && (
                      <div style={{ padding: '6px 10px 10px 32px', fontSize: '12px', color: '#6b7088', fontStyle: 'italic' }}>{l0.notes}</div>
                    )}
                    {(l0.startDate || l0.endDate) && !l0.isNA && (
                      <div style={{ padding: '2px 10px 8px 32px', fontSize: '11px', color: '#464b5e', fontFamily: "'JetBrains Mono',monospace" }}>
                        {fmtRange(l0.startDate, l0.endDate)}
                      </div>
                    )}

                    {!l0.isNA && l0.children.map(l1 => (
                      <div key={l1.id}>
                        <div className="l1-row">
                          <button className={`milestone-check sm ${l1.status}`} onClick={() => cycleL1Status(l0i, l1.id)}>
                            <StatusIcon status={l1.status} />
                          </button>
                          <span className="l1-name" style={{ opacity: l1.status === 'complete' ? 0.55 : 1, textDecoration: l1.status === 'complete' ? 'line-through' : 'none' }}>
                            {l1.label}
                          </span>
                          <span className="l1-date">{fmtRange(l1.startDate, l1.endDate)}</span>
                          <span className={`status-pill status-${l1.status}`} style={{ fontSize: '9px' }}>{l1.status.replace('-', ' ')}</span>
                          <RagPill rag={l1.rag} small onClick={() => {
                            if (l1.status === 'complete') return;
                            const ms = customer.milestones.map((m, i) => {
                              if (i !== l0i) return m;
                              const nc = m.children.map(c => c.id === l1.id ? { ...c, rag: nextRag(c.rag) } : c);
                              return { ...m, children: nc, rag: deriveL0Rag(nc, m.rag) };
                            });
                            save(ms);
                          }} />
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => { setEditItem(l1); setEditIsL0(false); }}>Edit</button>
                            <button
                              style={{ background: 'none', border: 'none', color: '#464b5e', cursor: 'pointer', fontSize: '12px', padding: '2px 6px' }}
                              onClick={() => rmL1(l0i, l1.id)}
                            >
                              {'\u2715'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {!l0.isNA && (
                      addingL1 === l0i ? (
                        <div className="inline-add">
                          <input
                            className="input"
                            value={newL1}
                            onChange={e => setNewL1(e.target.value)}
                            placeholder="Sub-milestone name..."
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') addL1Item(l0i);
                              if (e.key === 'Escape') { setAddingL1(null); setNewL1(''); }
                            }}
                            style={{ flex: 1 }}
                          />
                          <button className="btn btn-primary btn-sm" onClick={() => addL1Item(l0i)}>Add</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setAddingL1(null); setNewL1(''); }}>Cancel</button>
                        </div>
                      ) : (
                        <button className="add-l1-btn" onClick={() => setAddingL1(l0i)}>+ Add sub-milestone</button>
                      )
                    )}

                    <div style={{ padding: '4px 10px 2px 32px' }}>
                      <button
                        style={{ background: 'none', border: 'none', color: '#464b5e', fontSize: '11px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                        onClick={() => { setEditItem(l0); setEditIsL0(true); }}
                      >
                        Edit phase details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── TRANSCRIPTS ── */}
      {tab === 'transcripts' && (
        <div>
          <div className="gong-notice">
            <strong>Gong Integration:</strong> In production, connects to Gong API (v2/calls) to auto-import. Paste manually for now.
          </div>
          <div style={{ marginBottom: '12px' }}>
            <button className="btn btn-primary" onClick={() => setShowAddTr(true)}>+ Add Transcript</button>
          </div>
          {!customer.transcripts.length ? (
            <div className="empty-state">
              <div className="empty-state-icon">{'\uD83C\uDF99'}</div>
              <div className="empty-state-text">No transcripts yet.</div>
            </div>
          ) : (
            <div className="transcript-list">
              {customer.transcripts.map(t => (
                <div key={t.id} className="transcript-item" style={{ cursor: 'pointer' }} onClick={() => setViewingTranscript(t)}>
                  <span className="transcript-date">{fmtDate(t.date)}</span>
                  <div style={{ flex: 1 }}>
                    <div className="transcript-title">{t.title}</div>
                    <div className="transcript-summary">{t.summary || <span style={{ fontStyle: 'italic', color: '#464b5e' }}>No summary yet</span>}</div>
                  </div>
                  {!t.summary && (
                    <button className="btn btn-ghost" style={{ fontSize: '11px', whiteSpace: 'nowrap' }} onClick={e => { e.stopPropagation(); summarize(t); }}>
                      {'\u2726'} Summarise
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {viewingTranscript && (
            <div className="modal-overlay" onClick={() => setViewingTranscript(null)}>
              <div className="modal" style={{ maxWidth: '680px', width: '100%' }} onClick={e => e.stopPropagation()}>
                <div className="modal-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{viewingTranscript.title}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setViewingTranscript(null)}>{'\u2715'}</button>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7088', marginBottom: '12px' }}>{fmtDate(viewingTranscript.date)}</div>
                {viewingTranscript.summary && (
                  <div style={{ marginBottom: '16px', padding: '10px 12px', background: '#1a1d28', borderRadius: '6px', fontSize: '12.5px', color: '#c5c8d6', lineHeight: 1.6, borderLeft: '3px solid #6366f1' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>Summary</div>
                    {viewingTranscript.summary}
                  </div>
                )}
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#6b7088', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>Full Transcript</div>
                <div style={{ fontSize: '12.5px', color: '#c5c8d6', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: '480px', overflowY: 'auto', padding: '12px', background: '#1a1d28', borderRadius: '6px' }}>
                  {viewingTranscript.text}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── WEEKLY UPDATES ── */}
      {tab === 'weekly' && <WeeklyTab
        customer={customer}
        onUpdate={onUpdate}
        showAddUpdate={showAddUpdate}
        setShowAddUpdate={setShowAddUpdate}
        manualDate={manualDate}
        setManualDate={setManualDate}
        manualCtx={manualCtx}
        setManualCtx={setManualCtx}
        manualSnapshot={manualSnapshot}
        setManualSnapshot={setManualSnapshot}
        genUp={genUp}
        updatesAsc={updatesAsc}
        setUpdatesAsc={setUpdatesAsc}
        copiedUpdateId={copiedUpdateId}
        setCopiedUpdateId={setCopiedUpdateId}
        onGenWeekly={genWeekly}
        onSaveUpdate={saveManualUpdate}
      />}

      {/* ── RIDs ── */}
      {tab === 'rids' && (
        <RidsTab
          customer={customer}
          onUpdate={onUpdate}
          ridSortKey={ridSortKey}
          setRidSortKey={setRidSortKey}
          ridSortDir={ridSortDir}
          setRidSortDir={setRidSortDir}
          ridFilterType={ridFilterType}
          setRidFilterType={setRidFilterType}
          ridFilterStatus={ridFilterStatus}
          setRidFilterStatus={setRidFilterStatus}
          editRid={editRid}
          setEditRid={setEditRid}
        />
      )}

      {/* Modals */}
      {editRid !== null && (
        <EditRidModal
          rid={'id' in editRid && editRid.id ? editRid as Rid : null}
          milestones={customer.milestones}
          onClose={() => setEditRid(null)}
          onSave={rid => {
            const rids = customer.rids || [];
            const existing = rids.find(r => r.id === rid.id);
            onUpdate({ ...customer, rids: existing ? rids.map(r => r.id === rid.id ? rid : r) : [...rids, rid] });
            setEditRid(null);
          }}
          onDelete={id => {
            onUpdate({ ...customer, rids: (customer.rids || []).filter(r => r.id !== id) });
            setEditRid(null);
          }}
        />
      )}
      {editItem && (
        <EditMilestoneModal
          item={editItem}
          isL0={editIsL0}
          onClose={() => setEditItem(null)}
          onSave={handleEditSave}
          allMilestones={customer.milestones}
        />
      )}
      {showAddTr && (
        <AddTranscriptModal
          onClose={() => setShowAddTr(false)}
          onAdd={t => { onUpdate({ ...customer, transcripts: [...customer.transcripts, t] }); setShowAddTr(false); }}
        />
      )}
      {editCust && (
        <EditCustomerModal
          customer={customer}
          onClose={() => setEditCust(false)}
          onSave={u => { onUpdate(u); setEditCust(false); }}
          tiers={tiers}
          industries={industries}
        />
      )}
    </div>
  );
}

// ─── WeeklyTab ────────────────────────────────────────────────────────────────

interface WeeklyTabProps {
  customer: Customer;
  onUpdate: (c: Customer) => void;
  showAddUpdate: boolean;
  setShowAddUpdate: (v: boolean) => void;
  manualDate: string;
  setManualDate: (v: string) => void;
  manualCtx: string;
  setManualCtx: (v: string) => void;
  manualSnapshot: MilestoneSnapshot[];
  setManualSnapshot: (v: MilestoneSnapshot[]) => void;
  genUp: boolean;
  updatesAsc: boolean;
  setUpdatesAsc: (v: boolean) => void;
  copiedUpdateId: string | number | null;
  setCopiedUpdateId: (v: string | number | null) => void;
  onGenWeekly: () => void;
  onSaveUpdate: () => void;
}

function WeeklyTab({
  customer, showAddUpdate, setShowAddUpdate,
  manualDate, setManualDate, manualCtx, setManualCtx,
  manualSnapshot, setManualSnapshot, genUp, updatesAsc, setUpdatesAsc,
  copiedUpdateId, setCopiedUpdateId, onGenWeekly, onSaveUpdate,
}: WeeklyTabProps) {
  const fmtSlash = (d: string | null | undefined) => {
    if (!d) return 'TBD';
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
  };
  const statusLabel = (s: string) =>
    s === 'complete' ? 'Complete' : s === 'in-progress' ? 'In Progress' : 'Not Started';
  const RAG_STATUS_COLOR: Record<string, string> = { blue: '#3b82f6', green: '#22c55e', amber: '#f59e0b', red: '#ef4444' };
  const snapColor = (m: MilestoneSnapshot) => m.status === 'upcoming' ? '#565b6e' : (RAG_STATUS_COLOR[m.rag] || '#565b6e');

  const SnapshotRow = ({ m }: { m: MilestoneSnapshot }) => {
    const c = snapColor(m);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid #1a1d28' }}>
        <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: c, flexShrink: 0, boxShadow: `0 0 5px ${c}70` }} />
        <span style={{ flex: 1, fontSize: '12.5px', color: '#c5c8d6' }}>{m.label}</span>
        <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', background: `${c}18`, color: c, fontWeight: 700, letterSpacing: '0.3px' }}>{statusLabel(m.status)}</span>
        <span style={{ fontSize: '11px', color: '#6b7088', fontFamily: "'JetBrains Mono',monospace", minWidth: '72px', textAlign: 'right' }}>{fmtSlash(m.endDate)}</span>
      </div>
    );
  };

  const sel: React.CSSProperties = { background: '#1a1d28', border: '1px solid #2e3348', borderRadius: '4px', color: '#c5c8d6', fontSize: '11px', padding: '2px 5px', cursor: 'pointer' };

  const EditableSnapshotRow = ({ m, onChange }: { m: MilestoneSnapshot; onChange: (m: MilestoneSnapshot) => void }) => {
    const c = snapColor(m);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid #1a1d28' }}>
        <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: c, flexShrink: 0, boxShadow: `0 0 5px ${c}70` }} />
        <span style={{ flex: 1, fontSize: '12.5px', color: '#c5c8d6' }}>{m.label}</span>
        <select
          style={sel}
          value={m.status}
          onChange={e => {
            const s = e.target.value as OnboardingStatus;
            onChange({ ...m, status: s, rag: s === 'upcoming' ? 'green' : s === 'complete' ? 'blue' : m.rag === 'blue' ? 'green' : m.rag });
          }}
        >
          <option value="upcoming">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="complete">Complete</option>
        </select>
        {m.status !== 'upcoming' && (
          <select style={sel} value={m.rag} onChange={e => onChange({ ...m, rag: e.target.value as RagStatus })}>
            <option value="green">Green</option>
            <option value="amber">Amber</option>
            <option value="red">Red</option>
            <option value="blue">Blue (Done)</option>
          </select>
        )}
        <input
          type="date"
          value={m.endDate || ''}
          onChange={e => onChange({ ...m, endDate: e.target.value })}
          style={{ ...sel, width: '130px', fontFamily: "'JetBrains Mono',monospace" }}
        />
      </div>
    );
  };

  const copyUpdate = (u: Customer['weeklyUpdates'][number], uid: string | number) => {
    const EMOJI: Record<string, string> = { blue: '\uD83D\uDD35', green: '\uD83D\uDFE2', amber: '\uD83D\uDFE0', red: '\uD83D\uDD34' };
    const lines = (u.milestoneSnapshot || []).map(m => {
      const emoji = m.status === 'upcoming' ? '\u26AA' : (EMOJI[m.rag] || '\u26AA');
      return `${emoji} ${m.label} | ${statusLabel(m.status)} | ${fmtSlash(m.endDate)}`;
    });
    const ctx = u.context || u.text || '';
    const full = [...lines, ...(ctx ? ['', ctx] : [])].join('\n');
    navigator.clipboard.writeText(full)
      .then(() => { setCopiedUpdateId(uid); setTimeout(() => setCopiedUpdateId(null), 2000); })
      .catch(() => {});
  };

  const sorted = [...customer.weeklyUpdates].sort((a, b) =>
    updatesAsc ? new Date(a.date).getTime() - new Date(b.date).getTime() : new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {!showAddUpdate && (
          <>
            <button className="btn btn-primary" onClick={() => { setShowAddUpdate(true); setManualDate(today()); setManualCtx(''); setManualSnapshot(customer.milestones.filter(l0 => !l0.isNA).map(l0 => ({ id: l0.id, label: l0.label, status: l0.status, rag: l0.rag, endDate: l0.endDate }))); }}>
              + Add Update
            </button>
            <button className="btn btn-ghost" onClick={onGenWeekly} disabled={genUp}>
              {genUp ? 'Generating\u2026' : '\u2726 Generate with AI'}
            </button>
          </>
        )}
        <div style={{ flex: 1 }} />
        {customer.weeklyUpdates.length > 1 && (
          <button className="btn btn-ghost btn-sm" onClick={() => setUpdatesAsc(!updatesAsc)} style={{ fontSize: '11px' }}>
            {updatesAsc ? 'Oldest first \u2191' : 'Newest first \u2193'}
          </button>
        )}
      </div>

      {/* Composer */}
      {showAddUpdate && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">New Update</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: '#6b7088' }}>Date</label>
              <input className="input" type="date" value={manualDate} onChange={e => setManualDate(e.target.value)} style={{ width: '140px', padding: '4px 8px', fontSize: '12px' }} />
            </div>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7088', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>Milestone Status</div>
          <div style={{ marginBottom: '14px' }}>
            {manualSnapshot.map((m, i) => (
              <EditableSnapshotRow key={i} m={m} onChange={nm => setManualSnapshot(manualSnapshot.map((r, j) => j === i ? nm : r))} />
            ))}
          </div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7088', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>Context</div>
          {genUp && (
            <div className="generating">
              <div className="generating-dot" />Generating narrative...
            </div>
          )}
          <textarea
            className="textarea"
            value={manualCtx}
            onChange={e => setManualCtx(e.target.value)}
            placeholder="Add context, blockers, next steps, escalations..."
            style={{ minHeight: '120px', marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onGenWeekly} disabled={genUp}>{genUp ? 'Generating\u2026' : '\u2726 Generate with AI'}</button>
            <button className="btn btn-ghost" onClick={() => { setShowAddUpdate(false); setManualCtx(''); setManualSnapshot([]); }}>Cancel</button>
            <button className="btn btn-primary" disabled={!manualCtx.trim()} onClick={onSaveUpdate}>Save Update</button>
          </div>
        </div>
      )}

      {/* Update list */}
      {!customer.weeklyUpdates.length && !showAddUpdate && (
        <div className="empty-state">
          <div className="empty-state-icon">{'\uD83D\uDCCB'}</div>
          <div className="empty-state-text">No updates yet.</div>
        </div>
      )}
      {sorted.map((u, i) => {
        const uid = u.id || i;
        const hasSnap = !!u.milestoneSnapshot?.length;
        const isCopied = copiedUpdateId === uid;
        return (
          <div key={uid} className="card">
            <div className="card-header">
              <span className="card-title">Update &mdash; {fmtDate(u.date)}</span>
              {hasSnap && (
                <button className="btn btn-ghost btn-sm" style={{ fontSize: '11px' }} onClick={() => copyUpdate(u, uid)}>
                  {isCopied ? '\u2713 Copied' : 'Copy'}
                </button>
              )}
            </div>
            {hasSnap && <div style={{ marginBottom: '8px' }}>{u.milestoneSnapshot.map((m, j) => <SnapshotRow key={j} m={m} />)}</div>}
            {(u.context || u.text) && <div className="update-output" style={{ marginTop: hasSnap ? '8px' : 0 }}>{u.context || u.text}</div>}
          </div>
        );
      })}
    </div>
  );
}

// ─── RidsTab ──────────────────────────────────────────────────────────────────

interface RidsTabProps {
  customer: Customer;
  onUpdate: (c: Customer) => void;
  ridSortKey: RidSortKey;
  setRidSortKey: (k: RidSortKey) => void;
  ridSortDir: 'asc' | 'desc';
  setRidSortDir: (d: 'asc' | 'desc') => void;
  ridFilterType: string | null;
  setRidFilterType: (v: string | null) => void;
  ridFilterStatus: string | null;
  setRidFilterStatus: (v: string | null) => void;
  editRid: Rid | Partial<Rid> | null;
  setEditRid: (v: Rid | Partial<Rid> | null) => void;
}

function RidsTab({ customer, ridSortKey, setRidSortKey, ridSortDir, setRidSortDir, ridFilterType, setRidFilterType, ridFilterStatus, setRidFilterStatus, setEditRid }: RidsTabProps) {
  const rids = customer.rids || [];
  const toggle = (cur: string | null, v: string) => cur === v ? null : v;

  const msLookup: Record<string, string> = {};
  customer.milestones.forEach(l0 => {
    msLookup[l0.id] = l0.label;
    l0.children.forEach(l1 => { msLookup[l1.id] = l1.label; });
  });

  let filtered = rids;
  if (ridFilterType) filtered = filtered.filter(r => r.type === ridFilterType);
  if (ridFilterStatus) filtered = filtered.filter(r => r.status === ridFilterStatus);

  const sevOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  const statOrder: Record<string, number> = { Open: 0, Mitigated: 1, Closed: 2 };

  const sorted = [...filtered].sort((a, b) => {
    let av: string | number, bv: string | number;
    switch (ridSortKey) {
      case 'type':      av = a.type;                                        bv = b.type;                                        break;
      case 'title':     av = a.title.toLowerCase();                         bv = b.title.toLowerCase();                         break;
      case 'severity':  av = sevOrder[a.severity];                          bv = sevOrder[b.severity];                          break;
      case 'status':    av = statOrder[a.status];                           bv = statOrder[b.status];                           break;
      case 'owner':     av = (a.owner || '').toLowerCase();                 bv = (b.owner || '').toLowerCase();                 break;
      case 'milestone': av = (msLookup[a.linkedMilestone || ''] || '').toLowerCase(); bv = (msLookup[b.linkedMilestone || ''] || '').toLowerCase(); break;
      case 'date':      av = a.createdDate || '';                           bv = b.createdDate || '';                           break;
      default:          av = a.title; bv = b.title;
    }
    if (av < bv) return ridSortDir === 'asc' ? -1 : 1;
    if (av > bv) return ridSortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleRidSort = (k: RidSortKey) => {
    if (ridSortKey === k) setRidSortDir(ridSortDir === 'asc' ? 'desc' : 'asc');
    else { setRidSortKey(k); setRidSortDir(k === 'severity' ? 'desc' : 'asc'); }
  };

  function SortTh({ k, children }: { k: RidSortKey; children: React.ReactNode }) {
    return (
      <th className={ridSortKey === k ? 'sorted' : ''} onClick={() => handleRidSort(k)}>
        {children}
        <span className="sort-arrow">{ridSortKey === k ? (ridSortDir === 'asc' ? '\u25B2' : '\u25BC') : ''}</span>
      </th>
    );
  }

  const openCount = rids.filter(r => r.status === 'Open').length;
  const critCount = rids.filter(r => r.severity === 'Critical' && r.status !== 'Closed').length;

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: '#c5c8d6' }}>{rids.length} total</span>
        {openCount > 0 && <span style={{ fontSize: '12px', color: '#ef4444', background: 'rgba(239,68,68,0.08)', padding: '3px 8px', borderRadius: '4px' }}>{openCount} open</span>}
        {critCount > 0 && <span style={{ fontSize: '12px', color: '#dc2626', background: 'rgba(220,38,38,0.08)', padding: '3px 8px', borderRadius: '4px' }}>{critCount} critical</span>}
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setEditRid({})}>+ Add RID</button>
        </div>
      </div>

      <div className="filter-bar">
        <span className="filter-label">Type</span>
        {RID_TYPES.map(t => (
          <button key={t} className={`filter-chip ${ridFilterType === t ? 'active' : ''}`} onClick={() => setRidFilterType(toggle(ridFilterType, t))}>{t}</button>
        ))}
        <div className="filter-sep" />
        <span className="filter-label">Status</span>
        {RID_STATUSES.map(s => (
          <button key={s} className={`filter-chip ${ridFilterStatus === s ? 'active' : ''}`} onClick={() => setRidFilterStatus(toggle(ridFilterStatus, s))}>{s}</button>
        ))}
        {(ridFilterType || ridFilterStatus) && (
          <button className="filter-chip" style={{ color: '#818cf8', borderColor: '#6366f1' }} onClick={() => { setRidFilterType(null); setRidFilterStatus(null); }}>Clear</button>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="ptable">
          <thead>
            <tr>
              <SortTh k="type">Type</SortTh>
              <SortTh k="severity">Severity</SortTh>
              <SortTh k="title">Title</SortTh>
              <SortTh k="status">Status</SortTh>
              <SortTh k="milestone">Linked Milestone</SortTh>
              <SortTh k="owner">Owner</SortTh>
              <SortTh k="date">Created</SortTh>
              <th style={{ cursor: 'default' }}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(r => (
              <tr key={r.id} className="clickable" onClick={() => setEditRid(r)}>
                <td><span className={`rid-type rid-type-${r.type.toLowerCase()}`}>{r.type}</span></td>
                <td><span className="rid-sev" style={{ background: `${RID_SEV_COLORS[r.severity]}15`, color: RID_SEV_COLORS[r.severity] }}>{r.severity}</span></td>
                <td style={{ whiteSpace: 'normal', maxWidth: '280px', lineHeight: 1.4 }}>{r.title}</td>
                <td><span className={`status-pill rid-status-${r.status.toLowerCase()}`}>{r.status}</span></td>
                <td>
                  {r.linkedMilestone
                    ? <span className="rid-link" title={msLookup[r.linkedMilestone] || r.linkedMilestone}>{msLookup[r.linkedMilestone] || '\u2014'}</span>
                    : <span className="mono" style={{ color: '#464b5e' }}>{'\u2014'}</span>
                  }
                </td>
                <td style={{ color: '#8b8fa3' }}>{r.owner || '\u2014'}</td>
                <td className="mono">{fmtDate(r.createdDate)}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setEditRid(r); }}>Edit</button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#464b5e' }}>
                  {rids.length === 0 ? 'No risks, issues or dependencies logged yet' : 'No RIDs match filters'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: '11px', color: '#464b5e', marginTop: '10px' }}>{sorted.length} of {rids.length} RIDs shown</div>
    </div>
  );
}
