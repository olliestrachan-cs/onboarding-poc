'use client';

import { useState } from 'react';
import type { Customer, Tier, ComplexityConfig } from '@/lib/types';
import { RAG_COLORS, DEFAULT_L0, DEFAULT_TIERS, DEFAULT_INDUSTRIES, DEFAULT_COMPLEXITY } from '@/lib/constants';
import { deriveCustomerRag } from '@/lib/utils';
import { SAMPLES } from '@/app/lib/utils.js';

import DashboardView     from '@/app/components/views/DashboardView';
import CustomerDetailView from '@/app/components/views/CustomerDetailView';
import MetricsView       from '@/app/components/views/MetricsView';
import CapacityView      from '@/app/components/views/CapacityView';
import MilestoneSettings from '@/app/components/views/MilestoneSettings';
import TierSettings      from '@/app/components/views/TierSettings';
import IndustrySettings  from '@/app/components/views/IndustrySettings';
import AddCustomerModal  from '@/app/components/modals/AddCustomerModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewName = 'dashboard' | 'capacity' | 'metrics' | 'settings' | 'customer';

interface MilestoneTemplate {
  id: string;
  label: string;
  color: string;
}

// ─── App shell ────────────────────────────────────────────────────────────────

export default function Home() {
  const [customers, setCustomers]               = useState<Customer[]>(SAMPLES as Customer[]);
  const [view, setView]                         = useState<ViewName>('dashboard');
  const [selId, setSelId]                       = useState<string | null>(null);
  const [showAdd, setShowAdd]                   = useState(false);
  const [tmpl, setTmpl]                         = useState<MilestoneTemplate[]>([...DEFAULT_L0]);
  const [tiers, setTiers]                       = useState<Tier[]>(DEFAULT_TIERS);
  const [industries, setIndustries]             = useState<string[]>(DEFAULT_INDUSTRIES);
  const [complexityConfig, setComplexityConfig] = useState<ComplexityConfig[]>(DEFAULT_COMPLEXITY);

  const cur = customers.find(c => c.id === selId);

  const navigate = (v: ViewName, id?: string) => {
    setView(v);
    if (id !== undefined) setSelId(id);
  };

  const updateCustomer = (updated: Customer) =>
    setCustomers(cs => cs.map(c => c.id === updated.id ? updated : c));

  // ── Header copy ────────────────────────────────────────────────────────────

  const headerTitle = () => {
    if (view === 'customer' && cur) return cur.name;
    if (view === 'settings')  return 'Workspace Settings';
    if (view === 'capacity')  return 'Capacity Planning';
    if (view === 'metrics')   return 'Metrics';
    return 'Dashboard';
  };

  const headerSubtitle = () => {
    if (view === 'dashboard') return `${customers.length} active onboardings`;
    if (view === 'customer' && cur) return `${cur.tier} \u00B7 ${cur.stakeholder}`;
    if (view === 'settings') return 'Manage default templates and categorization';
    if (view === 'capacity') {
      const mgrs = new Set(customers.map(c => c.onboardingManager || 'Unassigned')).size;
      return `${customers.length} onboardings across ${mgrs} manager${mgrs !== 1 ? 's' : ''}`;
    }
    if (view === 'metrics') return `Aggregated data across ${customers.length} onboarding${customers.length !== 1 ? 's' : ''}`;
    return '';
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="app">

      {/* ── Sidebar ── */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">CS</div>
            <h1>Onboarding Hub</h1>
          </div>
          <div className="sidebar-brand-sub">Cloudsmith &middot; Onboarding Ops</div>
        </div>

        <div className="sidebar-nav">
          <button className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => { setView('dashboard'); setSelId(null); }}>
            <span className="nav-icon">{'\u25EB'}</span> Dashboard
          </button>
          <button className={`nav-item ${view === 'capacity' ? 'active' : ''}`} onClick={() => setView('capacity')}>
            <span className="nav-icon">◈</span> Capacity
          </button>
          <button className={`nav-item ${view === 'metrics' ? 'active' : ''}`} onClick={() => setView('metrics')}>
            <span className="nav-icon">◎</span> Metrics
          </button>
          <button className={`nav-item ${view === 'settings' ? 'active' : ''}`} onClick={() => setView('settings')}>
            <span className="nav-icon">{'\u2699'}</span> Settings
          </button>
        </div>

        <div className="sidebar-customers">
          <div className="sidebar-section-title">Customers</div>
          {customers.map(c => {
            const r = deriveCustomerRag(c.milestones);
            return (
              <button
                key={c.id}
                className={`customer-item ${selId === c.id ? 'active' : ''}`}
                onClick={() => navigate('customer', c.id)}
              >
                <div
                  className="customer-avatar"
                  style={{ background: `linear-gradient(135deg,${c.milestones[0]?.color},${c.milestones[2]?.color})` }}
                >
                  {c.logo}
                </div>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                <span className="rag-dot" style={{ background: RAG_COLORS[r], marginLeft: 'auto' }} />
              </button>
            );
          })}
        </div>

        <div className="add-customer-sidebar">
          <button
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setShowAdd(true)}
          >
            + Add Customer
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="main">
        <div className="main-header">
          <div>
            <div className="main-title">{headerTitle()}</div>
            <div className="main-subtitle">{headerSubtitle()}</div>
          </div>
          {view === 'dashboard' && (
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ New Customer</button>
          )}
        </div>

        <div className="main-body">
          {view === 'dashboard' && (
            <DashboardView
              customers={customers}
              onSelectCustomer={id => navigate('customer', id)}
              onUpdateCustomer={updateCustomer}
              tiers={tiers}
              industries={industries}
            />
          )}

          {view === 'customer' && cur && (
            <CustomerDetailView
              customer={cur}
              onUpdate={updateCustomer}
              tiers={tiers}
              industries={industries}
            />
          )}

          {view === 'metrics' && (
            <MetricsView customers={customers} industries={industries} />
          )}

          {view === 'capacity' && (
            <CapacityView
              customers={customers}
              complexityConfig={complexityConfig}
              onUpdateComplexity={setComplexityConfig}
              onSelectCustomer={id => navigate('customer', id)}
              onUpdateCustomer={updateCustomer}
            />
          )}

          {view === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-start' }}>
              <MilestoneSettings
                milestones={tmpl}
                onSave={setTmpl}
                onClose={() => setView('dashboard')}
              />
              <TierSettings
                tiers={tiers}
                onSave={setTiers}
                onClose={() => setView('dashboard')}
              />
              <IndustrySettings
                industries={industries}
                onSave={setIndustries}
                onClose={() => setView('dashboard')}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Add customer modal ── */}
      {showAdd && (
        <AddCustomerModal
          onClose={() => setShowAdd(false)}
          onAdd={nc => {
            setCustomers(cs => [...cs, nc]);
            setShowAdd(false);
            navigate('customer', nc.id);
          }}
          tmpl={tmpl}
          tiers={tiers}
          industries={industries}
        />
      )}
    </div>
  );
}
