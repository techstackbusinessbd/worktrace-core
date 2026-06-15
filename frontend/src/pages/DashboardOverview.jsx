import { useState } from 'react';
import { ShieldAlert, Copy, CheckCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const DashboardOverview = () => {
  const { user, tenant } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const copyToken = () => {
    const token = typeof tenant === 'object' ? tenant?.enrollment_token : null;
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const enrollmentToken = typeof tenant === 'object' ? tenant?.enrollment_token : null;

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0' }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '14px' }}>Welcome back, {user?.name?.split(' ')[0]}. Here's what's happening today.</p>
      </header>

      {enrollmentToken && (
        <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', borderLeft: '4px solid var(--md-sys-color-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <ShieldAlert size={28} color="var(--md-sys-color-primary)" />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Agent Enrollment Token</h3>
              <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '14px', marginBottom: '16px' }}>
                Use this secure token during the installation of the WorkTrace Desktop Agent on employee PCs. 
                Do not share this token publicly.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--md-sys-color-background)', padding: '12px 16px', borderRadius: 'var(--radius-btn)', border: '1px solid var(--md-sys-color-outline)' }}>
                <code style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '0.1em', color: 'var(--md-sys-color-on-surface)', flex: 1 }}>
                  {enrollmentToken}
                </code>
                <button onClick={copyToken} className="btn btn-primary" style={{ padding: '6px 12px' }}>
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Tenant Information</h3>
        <div className="data-grid">
          <div className="data-item">
            <span className="data-label">Tenant ID</span>
            <span className="data-value">{typeof tenant === 'object' ? tenant?.id : tenant || 'System'}</span>
          </div>
          <div className="data-item">
            <span className="data-label">Company Name</span>
            <span className="data-value">{typeof tenant === 'object' ? tenant?.company_name : 'Platform Owner'}</span>
          </div>
          <div className="data-item">
            <span className="data-label">Your Role</span>
            <span className="data-value">Administrator</span>
          </div>
          {tenant && typeof tenant === 'object' && (
            <>
              <div className="data-item">
                <span className="data-label">Active Plan</span>
                <span className="data-value" style={{ textTransform: 'capitalize' }}>{tenant?.plan || 'Free'}</span>
              </div>
              <div className="data-item">
                <span className="data-label">Device Limit</span>
                <span className="data-value">{tenant?.max_devices || 5} Devices</span>
              </div>
              <div className="data-item">
                <span className="data-label">Billing Expiry</span>
                <span className="data-value">{tenant?.subscription_ends_at ? new Date(tenant.subscription_ends_at).toLocaleDateString() : 'Never'}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
