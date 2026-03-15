'use client';

import type { Customer } from '@/lib/types';
import { RAG_COLORS } from '@/lib/constants';
import { getL0Progress } from '@/lib/utils';

interface CustomerGanttProps {
  customer: Customer;
  showProgress?: boolean;
}

export default function CustomerGantt({ customer, showProgress = true }: CustomerGanttProps) {
  const tStart = new Date(customer.startDate);
  tStart.setDate(tStart.getDate() - 7);

  let tEndDate = customer.targetDate ? new Date(customer.targetDate) : new Date();
  if (customer.forecastCompletion && new Date(customer.forecastCompletion) > tEndDate) {
    tEndDate = new Date(customer.forecastCompletion);
  }
  customer.milestones.forEach(l0 => {
    if (l0.endDate && new Date(l0.endDate) > tEndDate) tEndDate = new Date(l0.endDate);
    l0.children.forEach(l1 => {
      if (l1.endDate && new Date(l1.endDate) > tEndDate) tEndDate = new Date(l1.endDate);
    });
  });
  const tEnd = new Date(tEndDate);
  tEnd.setDate(tEnd.getDate() + 14);

  const span = tEnd.getTime() - tStart.getTime();
  const totalWeeks = Math.max(1, Math.ceil(span / (7 * 24 * 60 * 60 * 1000)));
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i);
  const todayPct = Math.max(0, Math.min(100, ((Date.now() - tStart.getTime()) / span) * 100));
  const pct = (d: string | null | undefined): number | null => {
    if (!d) return null;
    return Math.max(0, Math.min(100, ((new Date(d).getTime() - tStart.getTime()) / span) * 100));
  };

  return (
    <div className="cgantt" style={{ position: 'relative' }}>
      <div className="cgantt-scroll">
        <div className="cgantt-inner" style={{ position: 'relative' }}>
          <div className="cgantt-timehead">
            <div className="cgantt-label-col">Milestone</div>
            <div className="cgantt-weeks">
              {weeks.map((w, i) => {
                const d = new Date(tStart);
                d.setDate(d.getDate() + w * 7);
                return (
                  <div key={w} className={`cgantt-wk ${i % 2 === 0 ? 'cgantt-wk-even' : ''}`}>
                    {i % 2 === 0 ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {customer.milestones.map((l0, l0i) => {
            const l0Start = pct(l0.startDate);
            const l0End = pct(l0.endDate);
            const hasSpan = l0Start !== null && l0End !== null;
            const barLeft = hasSpan ? l0Start! : (l0i / customer.milestones.length) * 100;
            const barRight = hasSpan ? l0End! : ((l0i + 1) / customer.milestones.length) * 100;
            const barW = Math.max(1, barRight - barLeft);
            const prog = l0.isNA ? 0 : getL0Progress(l0);
            const fillW = barW * (prog / 100);

            return (
              <div key={l0.id} className="cgantt-l0-group" style={{ opacity: l0.isNA ? 0.5 : 1 }}>
                <div className="cgantt-l0-row">
                  <div className="cgantt-l0-label">
                    <span className="rag-dot rag-dot-sm" style={{ background: RAG_COLORS[l0.rag] }} />
                    <span className="cgantt-l0-num">{l0i + 1}</span>
                    <span className="cgantt-l0-name" style={{ textDecoration: l0.isNA ? 'line-through' : 'none' }}>
                      {l0.label}
                    </span>
                    {l0.isNA && (
                      <span style={{ marginLeft: '6px', fontSize: '9px', padding: '1px 4px', background: '#2e3348', borderRadius: '3px', color: '#c5c8d6', fontWeight: 600 }}>
                        N/A
                      </span>
                    )}
                  </div>
                  <div className="cgantt-l0-track">
                    {weeks.map(w => <div key={w} className="cgantt-l0-track-cell" />)}
                    {!l0.isNA && (
                      showProgress ? (
                        <>
                          {fillW > 0 && (
                            <div className="cgantt-l0-bar-fill" style={{ left: `${barLeft}%`, width: `${fillW}%`, background: RAG_COLORS[l0.rag], opacity: 0.55, borderRadius: (barW - fillW) > 0.5 ? '4px 0 0 4px' : '4px' }} />
                          )}
                          {(barW - fillW) > 0.5 && (
                            <div className="cgantt-l0-bar" style={{ left: `${barLeft + fillW}%`, width: `${barW - fillW}%`, background: '#1e2230', borderRadius: fillW > 0 ? '0 4px 4px 0' : '4px' }} />
                          )}
                        </>
                      ) : (
                        <div className="cgantt-l0-bar-fill" style={{ left: `${barLeft}%`, width: `${barW}%`, background: RAG_COLORS[l0.rag], opacity: 0.55, borderRadius: '4px' }} />
                      )
                    )}
                    {todayPct > 0 && todayPct < 100 && (
                      <div className="cgantt-today" style={{ left: `${todayPct}%` }}>
                        {l0i === 0 && <span className="cgantt-today-label">Today</span>}
                      </div>
                    )}
                  </div>
                </div>

                {!l0.isNA && l0.children.map(l1 => {
                  const l1S = pct(l1.startDate);
                  const l1E = pct(l1.endDate);
                  const hasL1Span = l1S !== null && l1E !== null;
                  const l1Left = hasL1Span ? l1S! : barLeft;
                  const l1W = hasL1Span ? Math.max(1, l1E! - l1S!) : barW * 0.6;
                  const barColor = showProgress ? (l1.status === 'complete' ? '#565b6e' : RAG_COLORS[l1.rag]) : RAG_COLORS[l1.rag];
                  const barOp = showProgress ? (l1.status === 'complete' ? 0.35 : l1.status === 'upcoming' ? 0.2 : 0.7) : 0.5;
                  const dotColor = showProgress ? (l1.status === 'complete' ? '#565b6e' : RAG_COLORS[l1.rag]) : RAG_COLORS[l1.rag];

                  return (
                    <div key={l1.id} className="cgantt-l1-row">
                      <div className="cgantt-l1-label">
                        <span className="cgantt-l1-dot" style={{ background: dotColor }} />
                        <span className={`cgantt-l1-name ${showProgress && l1.status === 'complete' ? 'done' : ''}`}>
                          {l1.label}
                        </span>
                      </div>
                      <div className="cgantt-l1-track">
                        {weeks.map(w => <div key={w} className="cgantt-l1-track-cell" />)}
                        <div className="cgantt-l1-bar" style={{ left: `${l1Left}%`, width: `${l1W}%`, background: barColor, opacity: barOp }} />
                        {todayPct > 0 && todayPct < 100 && <div className="cgantt-today" style={{ left: `${todayPct}%` }} />}
                      </div>
                    </div>
                  );
                })}
                {!l0.isNA && l0.children.length === 0 && <div className="cgantt-l1-row" style={{ height: '4px' }} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
