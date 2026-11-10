import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { STATUS_OPTIONS, INDUSTRY_TAGS } from '../utils/constants';

export default function FilterBar({ filters, onChange }) {
  const [open, setOpen] = useState(false);

  const hasActive = filters.status || filters.industry || filters.search;

  const clear = () => onChange({ status: '', industry: '', search: '' });

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px' }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', background: 'white',
          borderRadius: 8, padding: '0 10px', border: '1.5px solid #e2e8f0', gap: 6
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            style={{ flex: 1, border: 'none', background: 'none', fontSize: 13, padding: '8px 0', outline: 'none', color: '#0a1628' }}
            placeholder="Search businesses…"
            value={filters.search}
            onChange={e => onChange({ ...filters, search: e.target.value })}
          />
          {filters.search && (
            <button onClick={() => onChange({ ...filters, search: '' })} style={{ background: 'none', color: '#94a3b8', padding: 2 }}>
              <X size={12} />
            </button>
          )}
        </div>
        <button
          onClick={() => setOpen(!open)}
          style={{
            padding: '8px 10px', borderRadius: 8, background: hasActive ? '#0a1628' : 'white',
            border: '1.5px solid', borderColor: hasActive ? '#0a1628' : '#e2e8f0',
            color: hasActive ? 'white' : '#64748b', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600
          }}>
          <Filter size={14} />
          {hasActive && <span style={{ width: 6, height: 6, borderRadius: 3, background: '#14b8c8' }} />}
        </button>
      </div>

      {open && (
        <div style={{ padding: '0 12px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={filters.status} onChange={e => onChange({ ...filters, status: e.target.value })}>
                <option value="">All</option>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Industry</label>
              <select className="form-select" value={filters.industry} onChange={e => onChange({ ...filters, industry: e.target.value })}>
                <option value="">All</option>
                {INDUSTRY_TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          {hasActive && (
            <button className="btn btn-secondary" onClick={clear} style={{ marginTop: 8, fontSize: 12 }}>
              <X size={12} /> Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
