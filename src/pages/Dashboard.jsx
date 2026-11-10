import { useState, useEffect, useMemo } from 'react';
import { BarChart2, TrendingUp, MapPin, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useBusinesses } from '../hooks/useBusinesses';
import { useVisits } from '../hooks/useVisits';
import { STATUS_COLORS } from '../utils/constants';

export default function Dashboard({ user }) {
  const { businesses } = useBusinesses(user.id);
  const { fetchRecent } = useVisits(user.id);
  const [recentVisits, setRecentVisits] = useState([]);

  useEffect(() => {
    fetchRecent(7).then(setRecentVisits);
  }, []);

  const stats = useMemo(() => {
    const total = businesses.length;
    const interested = businesses.filter(b => b.status === 'Interested').length;
    const closed = businesses.filter(b => b.status === 'Closed').length;
    const followUp = businesses.filter(b => b.status === 'Follow Up').length;
    const totalValue = businesses.reduce((s, b) => s + (b.estimated_deal_value || 0), 0);
    const closedValue = businesses.filter(b => b.status === 'Closed').reduce((s, b) => s + (b.estimated_deal_value || 0), 0);
    const convRate = total > 0 ? Math.round((interested + closed) / total * 100) : 0;

    const statusData = Object.entries(
      businesses.reduce((acc, b) => ({ ...acc, [b.status]: (acc[b.status] || 0) + 1 }), {})
    ).map(([name, value]) => ({ name, value, fill: STATUS_COLORS[name] || '#94a3b8' }));

    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);

    return { total, interested, closed, followUp, totalValue, closedValue, convRate, statusData };
  }, [businesses]);

  const visitsByDay = useMemo(() => {
    const map = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      map[key] = { day: d.toLocaleDateString('en-US', { weekday: 'short' }), visits: 0 };
    }
    recentVisits.forEach(v => { if (map[v.visit_date]) map[v.visit_date].visits++; });
    return Object.values(map);
  }, [recentVisits]);

  return (
    <div style={{ height: '100%', overflow: 'auto', background: '#f1f5f9' }}>
      <div style={{ background: '#0a1628', padding: '16px 16px 20px' }}>
        <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: 0 }}>Dashboard</h1>
        <p style={{ color: '#475569', fontSize: 13, marginTop: 2 }}>Sales performance overview</p>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <StatCard icon={<MapPin size={18} />} label="Total Businesses" value={stats.total} color="#14b8c8" />
          <StatCard icon={<TrendingUp size={18} />} label="Conv. Rate" value={`${stats.convRate}%`} color="#22c55e" />
          <StatCard icon={<CheckCircle size={18} />} label="Closed" value={stats.closed} color="#8b5cf6" />
          <StatCard icon={<Clock size={18} />} label="Follow-Ups" value={stats.followUp} color="#f59e0b" />
        </div>

        {/* Value Cards */}
        <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10 }}>Pipeline Value</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: '#64748b' }}>Total Pipeline</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#0a1628' }}>${stats.totalValue.toLocaleString()}</p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: '#64748b' }}>Closed Won</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#22c55e' }}>${stats.closedValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Visits chart */}
        <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12 }}>Visits — Last 7 Days</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={visitsByDay} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="visits" fill="#14b8c8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status breakdown */}
        {stats.statusData.length > 0 && (
          <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12 }}>Status Breakdown</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <PieChart width={120} height={120}>
                <Pie data={stats.statusData} dataKey="value" cx={55} cy={55} innerRadius={30} outerRadius={55} paddingAngle={2}>
                  {stats.statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
              </PieChart>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {stats.statusData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: d.fill }} />
                      <span style={{ fontSize: 12, color: '#334155' }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0a1628' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent visits */}
        {recentVisits.length > 0 && (
          <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10 }}>Recent Activity</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentVisits.slice(0, 5).map(v => (
                <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0a1628', margin: 0 }}>{v.businesses?.name}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{v.outcome}</p>
                  </div>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{v.visit_date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
      </div>
      <p style={{ fontSize: 22, fontWeight: 800, color: '#0a1628', margin: 0 }}>{value}</p>
      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, marginTop: 2 }}>{label}</p>
    </div>
  );
}
