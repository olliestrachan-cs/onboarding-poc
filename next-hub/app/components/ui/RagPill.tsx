'use client';

import type { RagStatus } from '@/lib/types';
import { RAG_COLORS, RAG_LABELS } from '@/lib/constants';

interface RagPillProps {
  rag: RagStatus;
  onClick?: (e: React.MouseEvent) => void;
  small?: boolean;
}

export default function RagPill({ rag, onClick, small }: RagPillProps) {
  return (
    <button
      className={`rag-pill rag-pill-${rag}`}
      onClick={onClick}
      style={small ? { fontSize: '9px', padding: '2px 6px' } : {}}
    >
      <span className={`rag-dot ${small ? 'rag-dot-sm' : ''}`} style={{ background: RAG_COLORS[rag] }} />
      {RAG_LABELS[rag]}
    </button>
  );
}
