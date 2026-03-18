import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell, Search, Menu } from 'lucide-react';

const Topbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="glass-panel" style={{
      height: 'var(--topbar-h)',
      minHeight: 'var(--topbar-h)',
      maxHeight: 'var(--topbar-h)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1rem',
      borderTop: 'none',
      borderRight: 'none',
      borderLeft: 'none',
      borderRadius: '0',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        
        <button className="mobile-menu-btn btn-ghost" onClick={toggleSidebar} style={{ padding: '0.5rem' }}>
          <Menu size={24} />
        </button>


      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-6" style={{ paddingLeft: '1.5rem', borderLeft: '1px solid var(--border-light)' }}>
          <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{user?.username || 'Admin User'}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Administrator</p>
          </div>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: 'white'
          }}>
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </div>
          
          <button 
            onClick={logout} 
            className="flex items-center justify-center" 
            title="Sign Out"
            style={{ marginLeft: '0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent-danger)', padding: 0 }}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
