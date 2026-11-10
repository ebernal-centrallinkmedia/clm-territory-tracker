import { useState, useEffect } from 'react';
import { X, Phone, Globe, MapPin, User, Calendar, Tag, DollarSign, ChevronDown, ChevronUp, Plus, Edit2, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { STATUS_COLORS, STATUS_BG, VISIT_OUTCOMES, STATUS_OPTIONS, PIPELINE_STAGES, SERVICE_INTERESTS } from '../utils/constants';
import { useVisits } from '../hooks/useVisits';

export default function BusinessCard({ business, onClose, onUpdate, onDelete, userId }) {
  const { visits, fetchForBusiness, addVisit } = useVisits(userId);
  const [tab, setTab] = useState('info');
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [quickOutcome, setQuickOutcome] = useState('');
  const [quickNotes, setQuickNotes] = useState('');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ ...business });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchForBusiness(business.id);
  }, [business.id]);

  const handleQuickLog = async () => {
    if (!quickOutcome) return;
    const today = new Date();
    const { error } = await addVisit({
      business_id: business.id,
      visit_date: today.toISOString().split('T')[0],
      visit_time: today.toTimeString().slice(0, 5),
      outcome: quickOutcome,
      notes: quickNotes,
    });
    if (!error) {
      setShowQuickLog(false);
      setQuickOutcome('');
      setQuickNotes('');
      if (quickOutcome === 'Interested') onUpdate(business.id, { status: 'Interested' });
      if (quickOutcome === 'Not Interested') onUpdate(business.id, { status: 'Not Interested' });
      if (quickOutcome === 'Closed') onUpdate(business.id, { status: 'Closed' });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(business.id, editData);
    setSaving(false);
    setEditing(false);
  };

  const color = STATUS_COLORS[business.status] || '#94a3b8';
  const bg = STATUS_BG[business.status] || '#f8fafc';

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
      maxHeight: '70vh', background: 'white', borderRadius: '16px 16px 0 0',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column',
    }} className="slide-up">
      {/* Header */}
      <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e2e8f0', margin: '0 auto 12px' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0a1628', margin: 0 }}>{business.name}</h2>
              <span style={{
                padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: bg, color: color, border: `1px solid ${color}40`
              }}>{business.status}</span>
            </div>
            {business.industry && <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{business.industry}</p>}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setEditing(!editing)} style={{ padding: 6, borderRadius: 8, background: '#f1f5f9', color: '#64748b' }}>
              <Edit2 size={15} />
            </button>
            <button onClick={onClose} style={{ padding: 6, borderRadius: 8, background: '#f1f5f9', color: '#64748b' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginTop: 12, borderBottom: '1px solid #e2e8f0' }}>
          {['info', 'visits', 'follow-up'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 14px', fontSize: 13, fontWeight: 600, background: 'none',
              color: tab === t ? '#0a1628' : '#94a3b8', borderBottom: tab === t ? '2px solid #14b8c8' : '2px solid transparent',
              marginBottom: -1, textTransform: 'capitalize'
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px 20px' }}>
        {/* Quick Log Button */}
        {!editing && (
          <button onClick={() => setShowQuickLog(!showQuickLog)} style={{
            width: '100%', padding: '10px 14px', borderRadius: 8, background: '#0a1628',
            color: 'white', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 6, marginBottom: 12
          }}>
            <Plus size={15} /> Quick Log Visit
            {showQuickLog ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}

        {showQuickLog && (
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label className="form-label">Outcome</label>
              <select className="form-select" value={quickOutcome} onChange={e => setQuickOutcome(e.target.value)}>
                <option value="">Select outcome…</option>
                {VISIT_OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-input" value={quickNotes} onChange={e => setQuickNotes(e.target.value)}
                rows={2} style={{ resize: 'none' }} placeholder="Quick notes…" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleQuickLog}>Log It</button>
              <button className="btn btn-secondary" onClick={() => setShowQuickLog(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Info Tab */}
        {tab === 'info' && !editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {business.address && <InfoRow icon={<MapPin size={14} />} label="Address" value={business.address} />}
            {business.phone && <InfoRow icon={<Phone size={14} />} label="Phone" value={business.phone} link={`tel:${business.phone}`} />}
            {business.website && <InfoRow icon={<Globe size={14} />} label="Website" value={business.website} link={business.website} />}
            {business.contact_name && <InfoRow icon={<User size={14} />} label="Contact" value={business.contact_name} />}
            {business.pipeline_stage && <InfoRow icon={<Tag size={14} />} label="Pipeline" value={business.pipeline_stage} />}
            {business.estimated_deal_value && <InfoRow icon={<DollarSign size={14} />} label="Est. Value" value={`$${Number(business.estimated_deal_value).toLocaleString()}`} />}
            {business.service_interests?.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>Services of Interest</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {business.service_interests.map(s => (
                    <span key={s} style={{ padding: '2px 8px', background: '#eff6ff', color: '#3b82f6', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            {business.notes && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>Notes</p>
                <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{business.notes}</p>
              </div>
            )}
            <button className="btn btn-danger" style={{ marginTop: 8, justifyContent: 'center' }} onClick={() => { if (confirm('Delete this business?')) { onDelete(business.id); onClose(); } }}>
              <Trash2 size={14} /> Delete Business
            </button>
          </div>
        )}

        {/* Edit mode */}
        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Business Name', key: 'name', type: 'text' },
              { label: 'Address', key: 'address', type: 'text' },
              { label: 'Phone', key: 'phone', type: 'tel' },
              { label: 'Website', key: 'website', type: 'url' },
              { label: 'Contact Name', key: 'contact_name', type: 'text' },
              { label: 'Est. Deal Value', key: 'estimated_deal_value', type: 'number' },
            ].map(({ label, key, type }) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                <input className="form-input" type={type} value={editData[key] || ''} onChange={e => setEditData(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={editData.status || 'New'} onChange={e => setEditData(p => ({ ...p, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Pipeline Stage</label>
              <select className="form-select" value={editData.pipeline_stage || ''} onChange={e => setEditData(p => ({ ...p, pipeline_stage: e.target.value }))}>
                <option value="">Select…</option>
                {PIPELINE_STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-input" value={editData.notes || ''} onChange={e => setEditData(p => ({ ...p, notes: e.target.value }))} rows={3} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button className="btn btn-secondary" onClick={() => { setEditing(false); setEditData({ ...business }); }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Visits Tab */}
        {tab === 'visits' && (
          <div>
            {visits.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No visits logged yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {visits.map(v => (
                  <div key={v.id} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0a1628' }}>{v.outcome}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>
                        {v.visit_date} {v.visit_time && `· ${v.visit_time}`}
                      </span>
                    </div>
                    {v.notes && <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{v.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Follow-Up Tab */}
        {tab === 'follow-up' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Follow-Up Date</label>
              <input className="form-input" type="date" value={editData.follow_up_date || ''} onChange={e => setEditData(p => ({ ...p, follow_up_date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Follow-Up Notes</label>
              <textarea className="form-input" value={editData.follow_up_notes || ''} onChange={e => setEditData(p => ({ ...p, follow_up_notes: e.target.value }))} rows={3} style={{ resize: 'vertical' }} placeholder="What to cover on the follow-up…" />
            </div>
            <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={async () => {
              await onUpdate(business.id, { follow_up_date: editData.follow_up_date, follow_up_notes: editData.follow_up_notes, status: 'Follow Up' });
            }}>
              <Calendar size={14} /> Save Follow-Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, link }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ color: '#14b8c8', marginTop: 1, flexShrink: 0 }}>{icon}</span>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>{label}</p>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none' }}>{value}</a>
        ) : (
          <p style={{ fontSize: 13, color: '#334155' }}>{value}</p>
        )}
      </div>
    </div>
  );
}
