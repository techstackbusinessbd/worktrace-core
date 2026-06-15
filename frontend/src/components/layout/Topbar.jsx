import { useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, User } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Overview';
    if (path.includes('/dashboard/employees')) return 'Employees';
    if (path.includes('/dashboard/billing')) return 'Billing & Plans';
    if (path.includes('/dashboard/settings')) return 'Settings';
    if (path.includes('/dashboard/subscriptions')) return 'Approvals';
    if (path.includes('/dashboard/tenants')) return 'Tenants Directory';
    return 'Dashboard';
  };

  return (
    <header style={{ 
      height: '64px', 
      background: 'var(--md-sys-color-surface)', 
      borderBottom: '1px solid var(--md-sys-color-outline-variant)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      flexShrink: 0,
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ fontSize: '18px', fontWeight: '600' }}>
        {getPageTitle()}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <button 
          onClick={toggleTheme} 
          className="btn" 
          style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', background: 'transparent', color: 'var(--md-sys-color-on-surface-variant)', border: '1px solid var(--md-sys-color-outline-variant)' }}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div style={{ width: '1px', height: '32px', background: 'var(--md-sys-color-outline-variant)' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', lineHeight: '1.2' }}>{user?.name}</span>
            <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>{user?.is_superadmin ? 'Superadmin' : 'Administrator'}</span>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-on-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '600' }}>
            {user?.name?.charAt(0) || <User size={20} />}
          </div>
          <button 
            onClick={handleLogout} 
            className="btn btn-outline" 
            style={{ padding: '8px 12px', marginLeft: '8px', color: 'var(--md-sys-color-error)', borderColor: 'var(--md-sys-color-error)' }}
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
