import { useMemo } from 'react';
import { Calendar, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { format, parseISO, isToday, isPast, isFuture, addDays } from 'date-fns';
import { useBusinesses } from '../hooks/useBusinesses';
import { STATUS_COLORS } from '../utils/constants';

export default function FollowUps({ user }) {
  const { businesses, update } = useBusinesses(user.id);

  const { overdue, dueToday, upcoming } = useMemo(() => {
    const withDates = businesses.filter(b => b.follow_up_date);
    const today = new Date().toISOString().split('T')[0];
    const in7 = addDays(new Date(), 7).toISOString().split('T')[0];

    return {
      overdue: withDates.filter(b => b.follow_up_date < today).sort((a, b) => a.follow_up_date.localeCompare(b.follow_up_date)),
      dueToday: withDates.filter(b => b.follow_up_date === today),
      upcoming: withDates.filter(b => b.follow_up_date > today && b.follow_up_date <= in7).sort((a, b) => a.follow_up_date.localeCompare(b.follow_up_date)),
    };
  }, [businesses]);

  const markDone = (id) => update(id, { follow_up_date: null, follow_up_notes: null, status: 'Visited' });

  return (
    <div style={{ height: '100%', overflow: 'auto', background: '#f1f5f9' }}>
      <div style={{ background: '#0a1628', padding: '16px 16px 20px' }}>
        <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: 0 }}>Follow-Ups</h1>
        <p style={{ color: '#475569', fontSize: 13, marginTop: 2 }}>
          {overdue.length + dueToday.length} requiring attention
        </p>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Overdue */}
        {overdue.length > 0 && (
          <Section icon={<AlertCircle size={16} />} title="Overdue" color="#ef4444" count={overdue.length}>
            {overdue.map(b => <FollowUpCard key={b.id} business={b} onDone={markDone} accent="#ef4444" />)}
          </Section>
        )}

        {/* Due Today */}
        {dueToday.length > 0 && (
          <Section icon={<Clock size={16} />} title="Due Today" color="#f59e0b" count={dueToday.length}>
            {dueToday.map(b => <FollowUpCard key={b.id} business={b} onDone={markDone} accent="#f59e0b" />)}
          </Section>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <Section icon={<Calendar size={16} />} title="This Week" color="#14b8c8" count={upcoming.length}>
            {upcoming.map(b => <FollowUpCard key={b.id} business={b} onDone={markDone} accent="#14b8c8" />)}
          </Section>
        )}

        {overdue.length === 0 && dueToday.length === 0 && upcoming.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#0a1628' }}>All caught up!</p>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>No follow-ups due in the next 7 days.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ icon, title, color, count, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ color }}>{icon}</span>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0a1628', margin: 0 }}>{title}</h2>
        <span style={{ padding: '1px 7px', borderRadius: 10, background: color, color: 'white', fontSize: 11, fontWeight: 700 }}>{count}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

function FollowUpCard({ business, onDone, accent }) {
  const statusColor = STATUS_COLORS[business.status] || '#94a3b8';
  return (
    <div style={{
      background: 'white', borderRadius: 12, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      borderLeft: `3px solid ${accent}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0a1628', margin: 0 }}>{business.name}</p>
            <span style={{ padding: '1px 6px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: `${statusColor}15`, color: statusColor }}>{business.status}</span>
          </div>
          {business.address && <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{business.address}</p>}
          {business.follow_up_notes && (
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 6, padding: '6px 8px', background: '#f8fafc', borderRadius: 6 }}>
              {business.follow_up_notes}
            </p>
          )}
          <p style={{ fontSize: 11, color: accent, fontWeight: 600, marginTop: 6 }}>
            Due: {business.follow_up_date}
          </p>
        </div>
        <button
          onClick={() => onDone(business.id)}
          style={{
            padding: '6px 10px', borderRadius: 8, background: '#f0fdf4', color: '#22c55e',
            fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 10
          }}>
          <CheckCircle size={13} /> Done
        </button>
      </div>
    </div>
  );
}
