import { useState } from 'react';
import { X } from 'lucide-react';
import { STATUS_OPTIONS, INDUSTRY_TAGS, SERVICE_INTERESTS, PIPELINE_STAGES } from '../utils/constants';

export default function AddBusinessModal({ onClose, onAdd, defaultLat, defaultLng }) {
  const [data, setData] = useState({
    name: '',
    address: '',
    phone: '',
    website: '',
    industry: '',
    contact_name: '',
    status: 'New',
    lat: defaultLat || null,
    lng: defaultLng || null,
    notes: '',
    estimated_deal_value: '',
    pipeline_stage: 'Lead',
    service_interests: [],
    follow_up_date: '',
    follow_up_notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleService = (s) => {
    setData(p => ({
      ...p,
      service_interests: p.service_interests.includes(s)
        ? p.service_interests.filter(x => x !== s)
        : [...p.service_interests, s]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.name.trim()) { setError('Business name is required.'); return; }
    setSaving(true);
    const { error } = await onAdd({
      ...data,
      estimated_deal_value: data.estimated_deal_value ? Number(data.estimated_deal_value) : null,
    });
    if (error) { setError(error.message); setSaving(false); }
    else onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: '100%', maxWidth: 520, background: 'white',
        borderRadius: '16px 16px 0 0', maxHeight: '90dvh',
        display: 'flex', flexDirection: 'column'
      }} className="slide-up">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e2e8f0', margin: '0 auto 12px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0a1628' }}>Add Business</h2>
            <button onClick={onClose} style={{ padding: 6, borderRadius: 8, background: '#f1f5f9', color: '#64748b' }}><X size={16} /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Business Name *</label>
            <input className="form-input" value={data.name} onChange={e => setData(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Joe's Pizza" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={data.status} onChange={e => setData(p => ({ ...p, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Industry</label>
              <select className="form-select" value={data.industry} onChange={e => setData(p => ({ ...p, industry: e.target.value }))}>
                <option value="">Select…</option>
                {INDUSTRY_TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="form-input" value={data.address} onChange={e => setData(p => ({ ...p, address: e.target.value }))} placeholder="123 Main St, Dallas TX" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" type="tel" value={data.phone} onChange={e => setData(p => ({ ...p, phone: e.target.value }))} placeholder="(214) 555-0100" />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Name</label>
              <input className="form-input" value={data.contact_name} onChange={e => setData(p => ({ ...p, contact_name: e.target.value }))} placeholder="Manager's name" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Website</label>
            <input className="form-input" type="url" value={data.website} onChange={e => setData(p => ({ ...p, website: e.target.value }))} placeholder="https://example.com" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Pipeline Stage</label>
              <select className="form-select" value={data.pipeline_stage} onChange={e => setData(p => ({ ...p, pipeline_stage: e.target.value }))}>
                {PIPELINE_STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Est. Deal Value $</label>
              <input className="form-input" type="number" value={data.estimated_deal_value} onChange={e => setData(p => ({ ...p, estimated_deal_value: e.target.value }))} placeholder="0.00" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Services of Interest</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SERVICE_INTERESTS.map(s => (
                <button key={s} type="button" onClick={() => toggleService(s)} style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: data.service_interests.includes(s) ? '#0a1628' : '#f1f5f9',
                  color: data.service_interests.includes(s) ? 'white' : '#64748b',
                  border: '1.5px solid', borderColor: data.service_interests.includes(s) ? '#0a1628' : '#e2e8f0',
                  transition: 'all 0.15s'
                }}>{s}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Follow-Up Date</label>
              <input className="form-input" type="date" value={data.follow_up_date} onChange={e => setData(p => ({ ...p, follow_up_date: e.target.value }))} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-input" value={data.notes} onChange={e => setData(p => ({ ...p, notes: e.target.value }))} rows={3} style={{ resize: 'vertical' }} placeholder="Anything important to remember…" />
          </div>

          {data.lat && (
            <p style={{ fontSize: 12, color: '#64748b' }}>
              📍 Pin dropped at {data.lat.toFixed(5)}, {data.lng.toFixed(5)}
            </p>
          )}

          {error && <p style={{ fontSize: 13, color: '#ef4444' }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8, paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
            <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1, justifyContent: 'center', padding: 12 }}>
              {saving ? 'Saving…' : 'Add Business'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
