'use client';

import { useState } from 'react';
import type { Transcript } from '@/lib/types';
import { today } from '@/lib/utils';

interface AddTranscriptModalProps {
  onClose: () => void;
  onAdd: (transcript: Transcript) => void;
}

export default function AddTranscriptModal({ onClose, onAdd }: AddTranscriptModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today());
  const [text, setText] = useState('');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Add Gong Transcript</div>
        <div className="gong-notice">
          <strong>Gong API Integration:</strong> For production, connect to the Gong API. Paste transcript below for now.
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Call Title *</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Weekly Check-in" />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Transcript *</label>
          <textarea
            className="textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste transcript here..."
            style={{ minHeight: '180px' }}
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            disabled={!title || !text}
            onClick={() => { if (title && text) onAdd({ id: 't' + Date.now(), title, date, text, summary: '' }); }}
          >
            Add Transcript
          </button>
        </div>
      </div>
    </div>
  );
}
