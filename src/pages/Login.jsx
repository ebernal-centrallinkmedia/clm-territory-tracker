import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const fn = mode === 'login' ? signIn : signUp;
    const { error } = await fn(email, password);
    if (error) setMessage(error.message);
    else if (mode === 'signup') setMessage('Check your email to confirm your account.');
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a1628 0%, #1a2b45 100%)', padding: 24
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, background: '#14b8c8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 28
          }}>📍</div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>CLM Territory Tracker</h1>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Central Link Media — Field Sales</p>
        </div>

        <div style={{
          background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#0a1628' }}>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>

          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@centrallinkmedia.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {message && (
              <p style={{ fontSize: 13, color: message.includes('Check') ? '#22c55e' : '#ef4444', textAlign: 'center' }}>
                {message}
              </p>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, marginTop: 16, color: '#64748b' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              style={{ color: '#14b8c8', fontWeight: 600, background: 'none', fontSize: 13 }}>
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 20 }}>
          © 2025 Central Link Media, LLC
        </p>
      </div>
    </div>
  );
}
