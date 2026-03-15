'use client';

import { RAG_COLORS, RAG_LABELS, RAG_CYCLE } from '@/lib/constants';
import type { RagStatus } from '@/lib/types';

interface RagSelectorProps {
  value: RagStatus;
  onChange: (r: RagStatus) => void;
  disabled?: boolean;
}

export default function RagSelector({ value, onChange, disabled }: RagSelectorProps) {
  return (
    <div className="rag-selector" style={disabled ? { opacity: 0.45, pointerEvents: 'none' } : undefined}>
      {RAG_CYCLE.map(r => (
        <button
          key={r}
          className={`rag-option ${value === r ? `sel-${r}` : 'unsel'}`}
          onClick={() => onChange(r)}
        >
          {RAG_LABELS[r]}
        </button>
      ))}
    </div>
  );
}
