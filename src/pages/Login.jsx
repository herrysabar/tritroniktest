import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('user');
  const [password, setPassword] = useState('password');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/transactions');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen" style={{
      backgroundColor: 'var(--bg-base)'
    }}>
      
      
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Iotera Monitor</h1>
          <p>Login to access the dashboard</p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center', display: 'block' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-col gap-6">
          <div className="flex-col gap-2">
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          <div className="flex-col gap-2">
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: '1rem', padding: '1rem' }}>
            {loading ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
