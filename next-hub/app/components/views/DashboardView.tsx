'use client';

import { useState } from 'react';
import type { Customer, Tier, GanttView } from '@/lib/types';
import { deriveCustomerRag, getTotalProgress } from '@/lib/utils';
import GanttChart from '@/app/components/dashboard/GanttChart';
import PortfolioTable from '@/app/components/views/PortfolioTable';

interface DashboardViewProps {
  customers: Customer[];
  onSelectCustomer: (id: string) => void;
  onUpdateCustomer: (c: Customer) => void;
  tiers: Tier[];
  industries: string[];
}

export default function DashboardView({ customers, onSelectCustomer, onUpdateCustomer, tiers, industries }: DashboardViewProps) {
  const greens = customers.filter(c => deriveCustomerRag(c.milestones) === 'green').length;
  const ambers = customers.filter(c => deriveCustomerRag(c.milestones) === 'amber').length;
  const reds   = customers.filter(c => deriveCustomerRag(c.milestones) === 'red').length;
  const [dashShowProgress, setDashShowProgress] = useState(true);
  const [ganttView, setGanttView] = useState<GanttView>('month');

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Active Onboardings</div>
          <div className="stat-value">{customers.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ color: '#22c55e' }}>Green</div>
          <div className="stat-value" style={{ color: '#22c55e' }}>{greens}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ color: '#f59e0b' }}>Amber</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{ambers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ color: '#ef4444' }}>Red</div>
          <div className="stat-value" style={{ color: reds > 0 ? '#ef4444' : '#565b6e' }}>{reds}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Onboarding Timeline</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '2px', background: '#1a1d28', borderRadius: '6px', padding: '2px' }}>
              {(['week', 'month', 'quarter'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setGanttView(v)}
                  style={{ fontSize: '10px', padding: '3px 9px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: ganttView === v ? '#2e3348' : 'transparent', color: ganttView === v ? '#c5c8d6' : '#565b6e', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, textTransform: 'capitalize' }}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <button
              className={`btn btn-sm ${dashShowProgress ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setDashShowProgress(p => !p)}
              style={{ fontSize: '11px' }}
            >
              {dashShowProgress ? 'Progress' : 'RAG Status'}
            </button>
          </div>
        </div>
        <GanttChart
          customers={customers.filter(c => getTotalProgress(c.milestones) < 100)}
          onSelectCustomer={onSelectCustomer}
          showProgress={dashShowProgress}
          ganttView={ganttView}
        />
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Portfolio</span></div>
        <PortfolioTable
          customers={customers}
          onSelectCustomer={onSelectCustomer}
          onUpdateCustomer={onUpdateCustomer}
          tiers={tiers}
          industries={industries}
        />
      </div>
    </div>
  );
}
