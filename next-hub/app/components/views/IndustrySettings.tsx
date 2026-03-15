'use client';

import { useState } from 'react';

interface IndustrySettingsProps {
  industries: string[];
  onSave: (industries: string[]) => void;
  onClose: () => void;
}

export default function IndustrySettings({ industries, onSave, onClose }: IndustrySettingsProps) {
  const [items, setItems] = useState([...industries]);
  const [nl, setNl] = useState('');

  function add() {
    if (!nl.trim() || items.includes(nl.trim())) return;
    setItems([...items, nl.trim()].sort());
    setNl('');
  }

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
      <div className="card-header">
        <span className="card-title">Industries</span>
      </div>
      <p style={{ fontSize: '12.5px', color: '#6b7088', marginBottom: '16px', lineHeight: 1.6 }}>
        Define the industry options available when creating or editing onboardings.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
        {items.map(ind => (
          <div key={ind} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#181b26', borderRadius: '6px' }}>
            <span style={{ fontSize: '13px', color: '#e2e4eb', flex: 1 }}>{ind}</span>
            <button
              onClick={() => setItems(items.filter(x => x !== ind))}
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
          placeholder="New industry..."
          onKeyDown={e => e.key === 'Enter' && add()}
          style={{ flex: 1 }}
        />
        <button className="btn btn-ghost" onClick={add}>Add</button>
      </div>

      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(items)}>Save Industries</button>
      </div>
    </div>
  );
}
