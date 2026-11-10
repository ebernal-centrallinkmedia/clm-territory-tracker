import { NavLink } from 'react-router-dom';
import { Map, BarChart2, Bell } from 'lucide-react';

const tabs = [
  { to: '/', icon: Map, label: 'Map' },
  { to: '/dashboard', icon: BarChart2, label: 'Dashboard' },
  { to: '/follow-ups', icon: Bell, label: 'Follow-Ups' },
];

export default function Nav() {
  return (
    <nav style={{
      display: 'flex', background: '#0a1628', borderTop: '1px solid #1a2b45',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '10px 0', gap: 3, textDecoration: 'none',
          color: isActive ? '#14b8c8' : '#475569', transition: 'color 0.15s',
        })}>
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
