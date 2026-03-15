'use client';

import { useState } from 'react';
import type { Tier } from '@/lib/types';

interface TierSettingsProps {
  tiers: Tier[];
  onSave: (tiers: Tier[]) => void;
  onClose: () => void;
}

const COLORS = ['#a78bfa', '#38bdf8', '#8b8fa3', '#f472b6', '#fb923c', '#34d399', '#fbbf24', '#c084fc'];

export default function TierSettings({ tiers, onSave, onClose }: TierSettingsProps) {
  const [items, setItems] = useState(tiers.map(t => ({ ...t })));
  const [nl, setNl] = useState('');

  function add() {
    if (!nl.trim()) return;
    setItems([...items, { id: 't-' + Date.now(), label: nl.trim(), color: COLORS[items.length % COLORS.length] }]);
    setNl('');
  }

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
      <div className="card-header">
        <span className="card-title">Customer Tiers</span>
      </div>
      <p style={{ fontSize: '12.5px', color: '#6b7088', marginBottom: '16px', lineHeight: 1.6 }}>
        Define the tier options available when creating or editing onboardings.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
        {items.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#181b26', borderRadius: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.color, flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#e2e4eb', flex: 1 }}>{t.label}</span>
            <button
              onClick={() => setItems(items.filter(x => x.id !== t.id))}
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
          placeholder="New tier name..."
          onKeyDown={e => e.key === 'Enter' && add()}
          style={{ flex: 1 }}
        />
        <button className="btn btn-ghost" onClick={add}>Add</button>
      </div>

      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(items)}>Save Tiers</button>
      </div>
    </div>
  );
}
