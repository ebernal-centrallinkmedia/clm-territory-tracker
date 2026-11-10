import { useState, useMemo, useCallback, useRef } from 'react';
import { Plus, List, MapPin, Navigation, ChevronDown, ChevronUp, LogOut, Download } from 'lucide-react';
import { useBusinesses } from '../hooks/useBusinesses';
import { useAuth } from '../hooks/useAuth';
import MapComponent from '../components/MapComponent';
import BusinessCard from '../components/BusinessCard';
import AddBusinessModal from '../components/AddBusinessModal';
import FilterBar from '../components/FilterBar';
import { STATUS_COLORS, STATUS_OPTIONS } from '../utils/constants';

export default function MapView({ user }) {
  const { businesses, loading, add, update, remove } = useBusinesses(user.id);
  const { signOut } = useAuth();
  const [selectedId, setSelectedId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingLatLng, setPendingLatLng] = useState(null);
  const [showList, setShowList] = useState(false);
  const [filters, setFilters] = useState({ status: '', industry: '', search: '' });
  const mapRef = useRef(null);

  const selectedBusiness = businesses.find(b => b.id === selectedId);

  const filtered = useMemo(() => {
    return businesses.filter(b => {
      if (filters.status && b.status !== filters.status) return false;
      if (filters.industry && b.industry !== filters.industry) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!b.name?.toLowerCase().includes(q) && !b.address?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [businesses, filters]);

  const handleMapClick = useCallback((lat, lng) => {
    if (selectedId) { setSelectedId(null); return; }
    setPendingLatLng({ lat, lng });
    setShowAddModal(true);
  }, [selectedId]);

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      if (mapRef.current) {
        mapRef.current.flyTo([pos.coords.latitude, pos.coords.longitude], 15);
      }
    });
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Address', 'Phone', 'Website', 'Industry', 'Contact', 'Status', 'Pipeline', 'Est. Value', 'Follow-Up Date', 'Notes'];
    const rows = businesses.map(b => [
      b.name, b.address, b.phone, b.website, b.industry, b.contact_name,
      b.status, b.pipeline_stage, b.estimated_deal_value, b.follow_up_date, b.notes
    ].map(v => `"${(v || '').toString().replace(/"/g, '""')}"`));
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `clm-territories-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Status summary pills
  const statusCounts = useMemo(() => {
    const counts = {};
    businesses.forEach(b => { counts[b.status] = (counts[b.status] || 0) + 1; });
    return counts;
  }, [businesses]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Top Bar */}
      <div style={{ background: '#0a1628', padding: '10px 12px 8px', zIndex: 30, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#14b8c8', fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em' }}>CLM</span>
            <span style={{ color: '#475569', fontSize: 12 }}>|</span>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>{businesses.length} businesses</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleExportCSV} style={{ padding: '5px 8px', borderRadius: 6, background: '#1a2b45', color: '#94a3b8', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Download size={12} /> CSV
            </button>
            <button onClick={signOut} style={{ padding: '5px 8px', borderRadius: 6, background: '#1a2b45', color: '#94a3b8', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              <LogOut size={12} />
            </button>
          </div>
        </div>

        {/* Status pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {STATUS_OPTIONS.map(s => statusCounts[s] > 0 && (
            <button key={s} onClick={() => setFilters(f => ({ ...f, status: f.status === s ? '' : s }))} style={{
              padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
              background: filters.status === s ? STATUS_COLORS[s] : '#1a2b45',
              color: filters.status === s ? 'white' : STATUS_COLORS[s],
              border: `1px solid ${STATUS_COLORS[s]}40`, transition: 'all 0.15s'
            }}>{s} {statusCounts[s]}</button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <MapComponent
          businesses={filtered}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onMapClick={handleMapClick}
        />

        {/* Map tip */}
        {businesses.length === 0 && !loading && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'rgba(10,22,40,0.85)', color: 'white', padding: '12px 20px',
            borderRadius: 10, fontSize: 13, textAlign: 'center', pointerEvents: 'none', zIndex: 20,
            backdropFilter: 'blur(8px)'
          }}>
            Tap the map to drop your first pin
          </div>
        )}

        {/* FABs */}
        <div style={{ position: 'absolute', bottom: 16, right: 12, zIndex: 25, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={handleGPS} style={{
            width: 42, height: 42, borderRadius: 21, background: 'white', color: '#0a1628',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Navigation size={18} />
          </button>
          <button onClick={() => { setPendingLatLng(null); setShowAddModal(true); }} style={{
            width: 50, height: 50, borderRadius: 25, background: '#14b8c8', color: 'white',
            boxShadow: '0 4px 12px rgba(20,184,200,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Plus size={22} />
          </button>
        </div>

        {/* List Toggle */}
        <button onClick={() => setShowList(!showList)} style={{
          position: 'absolute', bottom: 16, left: 12, zIndex: 25,
          padding: '8px 12px', borderRadius: 20, background: 'white', color: '#0a1628',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600
        }}>
          <List size={16} /> List {showList ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {/* Business List Drawer */}
      {showList && !selectedBusiness && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40,
          background: 'white', borderRadius: '16px 16px 0 0',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          maxHeight: '55vh', display: 'flex', flexDirection: 'column'
        }} className="slide-up">
          <div style={{ padding: '12px 0 0', flexShrink: 0 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e2e8f0', margin: '0 auto 8px' }} />
            <FilterBar filters={filters} onChange={setFilters} />
          </div>
          <div style={{ overflow: 'auto', paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}>
            {filtered.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '20px' }}>No businesses match your filters.</p>
            ) : filtered.map(b => (
              <BusinessRow key={b.id} business={b} onSelect={() => { setSelectedId(b.id); setShowList(false); }} />
            ))}
          </div>
        </div>
      )}

      {/* Business Card */}
      {selectedBusiness && (
        <BusinessCard
          key={selectedBusiness.id}
          business={selectedBusiness}
          onClose={() => setSelectedId(null)}
          onUpdate={update}
          onDelete={remove}
          userId={user.id}
        />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddBusinessModal
          onClose={() => { setShowAddModal(false); setPendingLatLng(null); }}
          onAdd={add}
          defaultLat={pendingLatLng?.lat}
          defaultLng={pendingLatLng?.lng}
        />
      )}
    </div>
  );
}

function BusinessRow({ business, onSelect }) {
  const color = STATUS_COLORS[business.status] || '#94a3b8';
  return (
    <button onClick={onSelect} style={{
      width: '100%', padding: '10px 16px', background: 'none', display: 'flex',
      alignItems: 'center', gap: 10, borderBottom: '1px solid #f1f5f9', textAlign: 'left'
    }}>
      <div style={{ width: 10, height: 10, borderRadius: 5, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#0a1628', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{business.name}</p>
        {business.address && <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{business.address}</p>}
      </div>
      {business.follow_up_date && new Date(business.follow_up_date) <= new Date() && (
        <span style={{ fontSize: 10, background: '#fef2f2', color: '#ef4444', padding: '2px 6px', borderRadius: 10, fontWeight: 700, flexShrink: 0 }}>Due</span>
      )}
      <span style={{ fontSize: 11, color, fontWeight: 600, flexShrink: 0 }}>{business.status}</span>
    </button>
  );
}
