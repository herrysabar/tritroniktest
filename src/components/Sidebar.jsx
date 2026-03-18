import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { List, Activity, LayoutDashboard, Cpu, X } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const navItems = [
    { path: '/transactions', label: 'Transactions', icon: <List size={20} /> },
    { path: '/logs', label: 'Device Logs', icon: <Activity size={20} /> },
  ];

  return (
    <>
    <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}></div>
    <aside className={`glass-panel sidebar-container ${isOpen ? 'open' : ''}`} style={{ 
      width: 'var(--sidebar-w)', 
      minWidth: 'var(--sidebar-w)', 
      maxWidth: 'var(--sidebar-w)', 
      height: '100%', 
      borderLeft: 'none',
      borderTop: 'none',
      borderBottom: 'none',
      borderRadius: '0',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem'
    }}>
      <div className="flex items-center justify-between" style={{ padding: '0 1rem 2rem 1rem', borderBottom: '1px solid var(--border-light)' }}>
        <div className="flex items-center gap-4">

          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Iotera Monitor</h2>
        </div>
        <button className="mobile-menu-btn btn-ghost" onClick={() => setIsOpen(false)} style={{ padding: '0.25rem' }}>
          <X size={20} />
        </button>
      </div>

      <nav style={{ flex: 1, marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'white' : 'var(--text-muted)',
                background: isActive ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                border: isActive ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                if(!isActive) {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if(!isActive) {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ color: isActive ? 'var(--accent-primary)' : 'inherit' }}>
                {item.icon}
              </div>
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      

    </aside>
    </>
  );
};

export default Sidebar;
