'use client';

import { useState } from 'react';
import type { Customer, Tier, ComplexityKey, L0Milestone } from '@/lib/types';
import { COMPLEXITY_KEYS } from '@/lib/constants';
import { mkCustomerMilestones } from '@/app/lib/utils.js';

interface AddCustomerModalProps {
  onClose: () => void;
  onAdd: (customer: Customer) => void;
  tmpl: { id: string; label: string; color: string }[];
  tiers: Tier[];
  industries: string[];
}

export default function AddCustomerModal({ onClose, onAdd, tmpl, tiers, industries }: AddCustomerModalProps) {
  const [name, setName] = useState('');
  const [tier, setTier] = useState(tiers[0]?.label ?? '');
  const [stakeholder, setStakeholder] = useState('');
  const [sd, setSd] = useState('');
  const [mgr, setMgr] = useState('You');
  const [complexity, setComplexity] = useState<ComplexityKey>('M');
  const [industry, setIndustry] = useState(industries[0] ?? '');

  function handleAdd() {
    onAdd({
      id: 'c' + Date.now(),
      name,
      logo: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      tier,
      complexity,
      industry,
      startDate: sd,
      targetDate: null,
      baselineCompletion: null,
      forecastCompletion: null,
      onboardingManager: mgr,
      owner: mgr,
      stakeholder,
      milestones: mkCustomerMilestones(tmpl) as L0Milestone[],
      transcripts: [],
      weeklyUpdates: [],
      rids: [],
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Add New Customer</div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Acme Corp" />
          </div>
          <div className="form-group">
            <label className="form-label">Tier</label>
            <select className="input select-input" value={tier} onChange={e => setTier(e.target.value)}>
              {tiers.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Key Stakeholder</label>
            <input className="input" value={stakeholder} onChange={e => setStakeholder(e.target.value)} placeholder="e.g. Jamie Chen (VP Eng)" />
          </div>
          <div className="form-group">
            <label className="form-label">Onboarding Manager</label>
            <input className="input" value={mgr} onChange={e => setMgr(e.target.value)} placeholder="e.g. You" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Complexity</label>
            <select className="input select-input" value={complexity} onChange={e => setComplexity(e.target.value as ComplexityKey)}>
              {COMPLEXITY_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Industry</label>
            <select className="input select-input" value={industry} onChange={e => setIndustry(e.target.value)}>
              <option value="">— None —</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date *</label>
            <input className="input" type="date" value={sd} onChange={e => setSd(e.target.value)} />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!name || !sd} onClick={handleAdd}>
            Add Customer
          </button>
        </div>
      </div>
    </div>
  );
}
