'use client';

import { useState } from 'react';
import type { L0Milestone, L1Milestone, RagStatus, OnboardingStatus } from '@/lib/types';
import { RAG_COLORS } from '@/lib/constants';
import { getAllL1Options } from '@/app/lib/utils.js';
import RagSelector from '@/app/components/ui/RagSelector';

type MilestoneItem = L0Milestone | L1Milestone;

interface EditMilestoneModalProps {
  item: MilestoneItem;
  isL0: boolean;
  onClose: () => void;
  onSave: (item: MilestoneItem) => void;
  allMilestones?: L0Milestone[];
}

export default function EditMilestoneModal({ item, isL0, onClose, onSave, allMilestones }: EditMilestoneModalProps) {
  const [notes, setNotes] = useState(item.notes ?? '');
  const [status, setStatus] = useState<OnboardingStatus>(item.status);
  const [rag, setRag] = useState<RagStatus>(item.rag ?? 'green');
  const [sd, setSd] = useState(item.startDate ?? '');
  const [ed, setEd] = useState(item.endDate ?? '');
  const [ptg, setPtg] = useState(item.pathToGreen ?? '');
  const [deps, setDeps] = useState<string[]>((item as L1Milestone).dependsOn ?? []);
  const [isNA, setIsNA] = useState((item as L0Milestone).isNA ?? false);

  const l0Item = item as L0Milestone;
  const canEdit = !isL0 || !(l0Item.children?.length > 0);
  const depOptions = !isL0 && allMilestones ? getAllL1Options(allMilestones, item.id) : [];

  const toggleDep = (id: string) =>
    setDeps(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">
          {isL0 && <span style={{ fontSize: '11px', color: '#565b6e', marginRight: '8px' }}>L0 PHASE</span>}
          {item.label}
        </div>

        {isL0 && (
          <div className="form-group" style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid #1e2230' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={isNA} onChange={e => setIsNA(e.target.checked)} style={{ width: '16px', height: '16px' }} />
              <span style={{ fontSize: '13px', color: '#e2e4eb', fontWeight: 500 }}>Mark phase as Not Applicable (N/A)</span>
            </label>
            <div style={{ fontSize: '11px', color: '#6b7088', marginTop: '4px', marginLeft: '24px' }}>
              This will exclude the phase from overall progress and RAG calculations.
            </div>
          </div>
        )}

        {!isNA && (
          <>
            {isL0 && l0Item.children?.length > 0 && (
              <p style={{ fontSize: '12px', color: '#6b7088', marginBottom: '14px' }}>
                Completion status and RAG are auto-derived from sub-milestones. You can still set dates, notes, and the Path to Green.
              </p>
            )}

            {canEdit && (
              <div className="form-group">
                <label className="form-label">Completion Status</label>
                <select className="input select-input" value={status} onChange={e => {
                  const s = e.target.value as OnboardingStatus;
                  setStatus(s);
                  if (s === 'complete') setRag('blue');
                }}>
                  <option value="upcoming">Upcoming</option>
                  <option value="in-progress">In Progress</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="input" type="date" value={sd} onChange={e => setSd(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input className="input" type="date" value={ed} onChange={e => setEd(e.target.value)} />
              </div>
            </div>

            {canEdit && (
              <div className="form-group">
                <label className="form-label">RAG Status</label>
                <RagSelector value={rag} onChange={setRag} disabled={status === 'complete'} />
              </div>
            )}

            {(rag === 'amber' || rag === 'red') && (
              <div className="form-group">
                <label className="form-label" style={{ color: RAG_COLORS[rag] }}>
                  Path to Green {rag === 'red' ? '(Required)' : '(Recommended)'}
                </label>
                <textarea
                  className="textarea"
                  value={ptg}
                  onChange={e => setPtg(e.target.value)}
                  placeholder="What actions are needed to get back to Green?"
                  style={{ borderColor: rag === 'red' && !ptg.trim() ? '#ef4444' : undefined }}
                />
              </div>
            )}

            {!isL0 && depOptions.length > 0 && (
              <div className="form-group">
                <label className="form-label">Depends On (select predecessors)</label>
                <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid #2e3348', borderRadius: '7px', background: '#181b26' }}>
                  {depOptions.map((opt: { id: string; label: string; phase: string }) => {
                    const sel = deps.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        onClick={() => toggleDep(opt.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px', cursor: 'pointer', background: sel ? 'rgba(99,102,241,0.08)' : 'transparent', transition: 'background 0.12s', borderBottom: '1px solid #1a1d28' }}
                      >
                        <span style={{ width: '14px', height: '14px', borderRadius: '3px', border: sel ? '2px solid #6366f1' : '2px solid #2e3348', background: sel ? '#6366f1' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'white', flexShrink: 0 }}>
                          {sel ? '\u2713' : ''}
                        </span>
                        <span style={{ fontSize: '12px', color: sel ? '#c5c8d6' : '#8b8fa3' }}>{opt.label}</span>
                        <span style={{ fontSize: '10px', color: '#464b5e', marginLeft: 'auto' }}>{opt.phase}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="General notes..." style={{ minHeight: '80px' }} />
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={() => onSave({
              ...item,
              isNA,
              notes,
              status: isNA ? 'complete' : status,
              rag: isNA ? 'blue' : rag,
              startDate: sd || null,
              endDate: ed || null,
              pathToGreen: (rag === 'green' || rag === 'blue' || isNA) ? '' : ptg,
              dependsOn: deps,
            } as MilestoneItem)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
