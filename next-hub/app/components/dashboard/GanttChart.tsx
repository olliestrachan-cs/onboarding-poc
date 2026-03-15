'use client';

import type { Customer, GanttView } from '@/lib/types';
import { RAG_COLORS } from '@/lib/constants';
import { deriveCustomerRag, getTotalProgress, today } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface GanttChartProps {
  customers: Customer[];
  onSelectCustomer?: (id: string) => void;
  showProgress?: boolean;
  ganttView?: GanttView;
}

// ─── Helpers (local to this component) ───────────────────────────────────────

function getEffectiveEnd(c: Customer): Date {
  if (c.targetDate)          return new Date(c.targetDate);
  if (c.forecastCompletion)  return new Date(c.forecastCompletion);
  const withEnd = [...c.milestones].filter(m => m.endDate).reverse();
  if (withEnd.length)        return new Date(withEnd[0].endDate!);
  const d = new Date(c.startDate);
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

const UNIT_DAYS: Record<GanttView, number> = { week: 7, month: 30, quarter: 91 };

// ─── Component ───────────────────────────────────────────────────────────────

export default function GanttChart({
  customers,
  onSelectCustomer,
  showProgress = true,
  ganttView = 'month',
}: GanttChartProps) {
  if (!customers.length) {
    return (
      <div className="gantt-empty">
        <div className="gantt-empty-text">No customers yet</div>
      </div>
    );
  }

  const unitMs = UNIT_DAYS[ganttView] * 86_400_000;

  const starts = customers.map(c => new Date(c.startDate)).filter(d => !isNaN(d.getTime()));
  const ends   = customers.map(c => getEffectiveEnd(c)).filter(d => !isNaN(d.getTime()));

  const rangeStart = new Date(Math.min(...starts.map(d => d.getTime())));
  rangeStart.setTime(rangeStart.getTime() - unitMs);

  const rangeEnd = new Date(Math.max(...ends.map(d => d.getTime())));
  rangeEnd.setTime(rangeEnd.getTime() + unitMs);

  const totalMs  = rangeEnd.getTime() - rangeStart.getTime();
  const numUnits = Math.max(1, Math.ceil(totalMs / unitMs));
  const units    = Array.from({ length: numUnits }, (_, i) => i);

  /** Convert a date to a 0-100 percentage position along the timeline. */
  function toPct(d: Date | string | null | undefined): number | null {
    if (!d) return null;
    const dt = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dt.getTime())) return null;
    return Math.max(0, Math.min(100, ((dt.getTime() - rangeStart.getTime()) / totalMs) * 100));
  }

  function unitLabel(i: number): string {
    const d = new Date(rangeStart.getTime() + i * unitMs);
    if (ganttView === 'week')    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    if (ganttView === 'month')   return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    return `Q${Math.floor(d.getMonth() / 3) + 1} '${String(d.getFullYear()).slice(2)}`;
  }

  const showEvery = ganttView === 'week' ? 2 : 1;
  const todayPct  = toPct(new Date(today()));

  return (
    <div className="gantt-wrapper">
      {/* Timeline header */}
      <div className="gantt-header">
        {units.map(u => (
          <div key={u} className="gantt-unit">
            {u % showEvery === 0 ? unitLabel(u) : ''}
          </div>
        ))}
      </div>

      {/* Customer rows */}
      {customers.map((c, ci) => {
        const rag  = deriveCustomerRag(c.milestones);
        const sp   = toPct(c.startDate);
        const ep   = toPct(getEffectiveEnd(c));
        if (sp === null || ep === null) return null;

        const barW    = Math.max(ep - sp, 0.5);
        const prog    = getTotalProgress(c.milestones);
        const filledW = barW * (prog / 100);
        const remainW = barW - filledW;
        const ragColor = RAG_COLORS[rag];

        return (
          <div key={c.id} className="gantt-row">
            {/* Left label */}
            <button
              className="gantt-label"
              onClick={() => onSelectCustomer?.(c.id)}
            >
              <span
                className="gantt-rag-dot"
                style={{ background: ragColor }}
              />
              <span
                className="gantt-avatar"
                style={{
                  background: `linear-gradient(135deg, ${c.milestones[0]?.color}, ${c.milestones[2]?.color})`,
                }}
              >
                {c.logo}
              </span>
              <span className="gantt-customer-name">{c.name}</span>
            </button>

            {/* Bar track */}
            <div className="gantt-cells">
              {units.map(u => <div key={u} className="gantt-cell" />)}

              {showProgress ? (
                <>
                  {filledW > 0 && (
                    <div
                      className="gantt-bar"
                      style={{
                        left: `${sp}%`,
                        width: `${filledW}%`,
                        background: `linear-gradient(90deg, ${ragColor}88, ${ragColor}cc)`,
                        borderRadius: remainW > 0 ? '3px 0 0 3px' : '3px',
                      }}
                    />
                  )}
                  {remainW > 0 && (
                    <div
                      className="gantt-bar"
                      style={{
                        left: `${sp + filledW}%`,
                        width: `${remainW}%`,
                        background: '#1e2230',
                        borderRadius: filledW > 0 ? '0 3px 3px 0' : '3px',
                      }}
                    />
                  )}
                </>
              ) : (
                <div
                  className="gantt-bar"
                  style={{
                    left: `${sp}%`,
                    width: `${barW}%`,
                    background: `linear-gradient(90deg, ${ragColor}88, ${ragColor}cc)`,
                    borderRadius: '3px',
                  }}
                />
              )}

              {/* Today line */}
              {todayPct !== null && todayPct > 0 && todayPct < 100 && (
                <div className="gantt-today" style={{ left: `${todayPct}%` }}>
                  {ci === 0 && <span className="gantt-today-label">Today</span>}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
