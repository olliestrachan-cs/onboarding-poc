'use client';

import { useState } from 'react';

interface MilestoneTemplate {
  id: string;
  label: string;
  color: string;
}

interface MilestoneSettingsProps {
  milestones: MilestoneTemplate[];
  onSave: (milestones: MilestoneTemplate[]) => void;
  onClose: () => void;
}

const COLORS = ['#6366f1', '#8b5cf6', '#0ea5e9', '#14b8a6', '#f59e0b', '#22c55e', '#ec4899', '#ef4444'];

export default function MilestoneSettings({ milestones, onSave, onClose }: MilestoneSettingsProps) {
  const [items, setItems] = useState(milestones.map(m => ({ ...m })));
  const [nl, setNl] = useState('');

  function add() {
    if (!nl.trim()) return;
    setItems([...items, { id: 'l0-' + Date.now(), label: nl.trim(), color: COLORS[items.length % COLORS.length] }]);
    setNl('');
  }

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
      <div className="card-header">
        <span className="card-title">L0 Phase Template</span>
      </div>
      <p style={{ fontSize: '12.5px', color: '#6b7088', marginBottom: '16px', lineHeight: 1.6 }}>
        Default Level 0 phases for new onboardings. L1 sub-milestones are added per-customer.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
        {items.map(m => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#181b26', borderRadius: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: m.color, flexShrink: 0 }} />
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#464b5e', width: '20px' }}>L0</span>
            <span style={{ fontSize: '13px', color: '#e2e4eb', flex: 1 }}>{m.label}</span>
            <button
              onClick={() => setItems(items.filter(x => x.id !== m.id))}
              style={{ background: 'none', border: 'none', color: '#565b6e', cursor: 'pointer', fontSize: '14px' }}
            >
              {'\u2715'}
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          className="input"
          value={nl}
          onChange={e => setNl(e.target.value)}
          placeholder="New phase name..."
          onKeyDown={e => e.key === 'Enter' && add()}
          style={{ flex: 1 }}
        />
        <button className="btn btn-ghost" onClick={add}>Add</button>
      </div>

      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(items)}>Save Template</button>
      </div>
    </div>
  );
}
