'use client';

import { useState } from 'react';
import type { Customer, Tier, ComplexityKey } from '@/lib/types';
import { COMPLEXITY_KEYS } from '@/lib/constants';

interface EditCustomerModalProps {
  customer: Customer;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  tiers: Tier[];
  industries: string[];
}

export default function EditCustomerModal({ customer, onClose, onSave, tiers, industries }: EditCustomerModalProps) {
  const [name, setName] = useState(customer.name);
  const [tier, setTier] = useState(customer.tier);
  const [complexity, setComplexity] = useState<ComplexityKey>((customer.complexity as ComplexityKey) ?? 'M');
  const [industry, setIndustry] = useState(customer.industry ?? '');
  const [stakeholder, setStakeholder] = useState(customer.stakeholder);
  const [mgr, setMgr] = useState(customer.onboardingManager ?? '');
  const [sd, setSd] = useState(customer.startDate ?? '');
  const [bc, setBc] = useState(customer.baselineCompletion ?? '');
  const [fc, setFc] = useState(customer.forecastCompletion ?? '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Edit Onboarding &mdash; {customer.name}</div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Tier</label>
            <select className="input select-input" value={tier} onChange={e => setTier(e.target.value)}>
              {tiers.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
              {!tiers.find(t => t.label === tier) && <option value={tier}>{tier}</option>}
            </select>
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
              {industry && !industries.includes(industry) && <option value={industry}>{industry}</option>}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Key Stakeholder</label>
            <input className="input" value={stakeholder} onChange={e => setStakeholder(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Onboarding Manager</label>
            <input className="input" value={mgr} onChange={e => setMgr(e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input className="input" type="date" value={sd} onChange={e => setSd(e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Baseline Completion</label>
            <input className="input" type="date" value={bc} onChange={e => setBc(e.target.value)} />
            <div style={{ fontSize: '10px', color: '#464b5e', marginTop: '4px' }}>Original target date (set once at kickoff)</div>
          </div>
          <div className="form-group">
            <label className="form-label">Forecast Completion</label>
            <input className="input" type="date" value={fc} onChange={e => setFc(e.target.value)} />
            <div style={{ fontSize: '10px', color: '#464b5e', marginTop: '4px' }}>Current best estimate</div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={() => onSave({
              ...customer,
              name,
              tier,
              complexity,
              industry,
              stakeholder,
              onboardingManager: mgr,
              startDate: sd || customer.startDate,
              baselineCompletion: bc || null,
              forecastCompletion: fc || null,
              logo: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
            })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
