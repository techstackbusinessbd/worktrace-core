import { Link, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Users, CreditCard, Building2, ShieldCheck, Clock, Monitor } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Sidebar = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  const getLinkStyle = (path) => ({
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    padding: '10px 12px', 
    borderRadius: 'var(--radius-btn)', 
    textDecoration: 'none', 
    fontWeight: '500', 
    fontSize: '14px',
    transition: 'all 0.2s',
    background: location.pathname === path ? 'var(--md-sys-color-primary-container)' : 'transparent',
    color: location.pathname === path ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)'
  });

  return (
    <aside style={{ 
      width: '260px', 
      height: '100vh',
      borderRight: '1px solid var(--md-sys-color-outline-variant)', 
      background: 'var(--md-sys-color-surface)', 
      padding: '24px 20px', 
      display: 'flex', 
      flexDirection: 'column',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingLeft: '8px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px', boxShadow: 'var(--shadow-sm)' }}>
          W
        </div>
        <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.03em' }}>WorkTrace</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', marginTop: '8px', paddingLeft: '12px' }}>
          Menu
        </div>
        
        <Link to="/dashboard" style={getLinkStyle('/dashboard')}>
          <LayoutDashboard size={20} />
          Overview
        </Link>
        <Link to="/dashboard/timesheets" style={getLinkStyle('/dashboard/timesheets')}>
          <Clock size={20} />
          Timesheets
        </Link>
        <Link to="/dashboard/employees" style={getLinkStyle('/dashboard/employees')}>
          <Users size={20} />
          Employees
        </Link>
        <Link to="/dashboard/devices" style={getLinkStyle('/dashboard/devices')}>
          <Monitor size={20} />
          Devices
        </Link>
        <Link to="/dashboard/billing" style={getLinkStyle('/dashboard/billing')}>
          <CreditCard size={20} />
          Billing
        </Link>
        <Link to="/dashboard/settings" style={getLinkStyle('/dashboard/settings')}>
          <Settings size={20} />
          Settings
        </Link>

        {user?.is_superadmin && (
          <div style={{ marginTop: '32px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--md-sys-color-on-surface-variant)', padding: '0 12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Admin
            </div>
            <NavLink
              to="/dashboard/subscriptions"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
                background: isActive ? 'var(--md-sys-color-primary-container)' : 'transparent',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.2s ease',
                marginBottom: '4px'
              })}
            >
              <ShieldCheck size={20} />
              <span>Approvals</span>
            </NavLink>
            
            <NavLink
              to="/dashboard/tenants"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
                background: isActive ? 'var(--md-sys-color-primary-container)' : 'transparent',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.2s ease',
                marginBottom: '4px'
              })}
            >
              <Building2 size={20} />
              <span>Tenants</span>
            </NavLink>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
