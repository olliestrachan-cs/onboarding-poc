'use client';

import { useState } from 'react';
import type { Rid, L0Milestone, RidType, RidSeverity, RidStatusValue } from '@/lib/types';
import { RID_TYPES, RID_SEVERITIES, RID_STATUSES } from '@/lib/constants';

interface EditRidModalProps {
  rid: Rid | null;
  milestones: L0Milestone[];
  onClose: () => void;
  onSave: (rid: Rid) => void;
  onDelete?: (id: string) => void;
}

export default function EditRidModal({ rid, milestones, onClose, onSave, onDelete }: EditRidModalProps) {
  const [type, setType] = useState<RidType>(rid?.type ?? 'Risk');
  const [title, setTitle] = useState(rid?.title ?? '');
  const [severity, setSeverity] = useState<RidSeverity>(rid?.severity ?? 'Medium');
  const [status, setStatus] = useState<RidStatusValue>(rid?.status ?? 'Open');
  const [linked, setLinked] = useState(rid?.linkedMilestone ?? '');
  const [owner, setOwner] = useState(rid?.owner ?? '');
  const [desc, setDesc] = useState(rid?.description ?? '');
  const [mit, setMit] = useState(rid?.mitigation ?? '');

  const isNew = !rid?.id;

  // Flat list of all L0 + L1 milestones for linking
  const msOptions: { id: string; label: string }[] = [];
  milestones.forEach(l0 => {
    msOptions.push({ id: l0.id, label: `L0: ${l0.label}` });
    l0.children.forEach(l1 => msOptions.push({ id: l1.id, label: `  L1: ${l1.label}` }));
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{isNew ? 'Add RID' : 'Edit RID'}</div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Type *</label>
            <select className="input select-input" value={type} onChange={e => setType(e.target.value as RidType)}>
              {RID_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Severity</label>
            <select className="input select-input" value={severity} onChange={e => setSeverity(e.target.value as RidSeverity)}>
              {RID_SEVERITIES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief description of the risk, issue or dependency" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="input select-input" value={status} onChange={e => setStatus(e.target.value as RidStatusValue)}>
              {RID_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Owner</label>
            <input className="input" value={owner} onChange={e => setOwner(e.target.value)} placeholder="e.g. Jamie Chen" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Linked Milestone</label>
          <select className="input select-input" value={linked} onChange={e => setLinked(e.target.value)}>
            <option value="">None</option>
            {msOptions.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="textarea" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Full description of the risk, issue or dependency..." style={{ minHeight: '80px' }} />
        </div>

        <div className="form-group">
          <label className="form-label">Mitigation / Resolution</label>
          <textarea className="textarea" value={mit} onChange={e => setMit(e.target.value)} placeholder="What actions are being taken or planned..." style={{ minHeight: '80px' }} />
        </div>

        <div className="modal-actions">
          {!isNew && onDelete && (
            <button
              className="btn btn-ghost"
              style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', marginRight: 'auto' }}
              onClick={() => onDelete(rid!.id)}
            >
              Delete
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            disabled={!title.trim()}
            onClick={() => onSave({
              id: rid?.id ?? `rid-${Date.now()}`,
              type,
              title: title.trim(),
              severity,
              status,
              linkedMilestone: linked || null,
              owner,
              description: desc,
              mitigation: mit,
              createdDate: rid?.createdDate ?? new Date().toISOString().split('T')[0],
            })}
          >
            {isNew ? 'Add' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
