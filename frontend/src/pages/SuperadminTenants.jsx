import { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { Building2, Calendar, MonitorSmartphone, Plus, X } from 'lucide-react';

const SuperadminTenants = () => {
  const { user } = useAuthStore();
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    domain: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    admin_password_confirmation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchTenants = async () => {
    try {
      const response = await api.get('/tenants');
      setTenants(response.data.tenants);
      setIsLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load tenants.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTenants();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (formData.admin_password !== formData.admin_password_confirmation) {
      setFormError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/tenants', formData);
      await fetchTenants();
      setIsModalOpen(false);
      setFormData({
        company_name: '',
        domain: '',
        admin_name: '',
        admin_email: '',
        admin_password: '',
        admin_password_confirmation: ''
      });
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create company.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user?.is_superadmin) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--md-sys-color-error)' }}>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Building2 size={32} color="var(--md-sys-color-primary)" />
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Company Directory (Tenants)</h1>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          Create Company
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : tenants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            No companies registered yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Company Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Tenant ID</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Current Plan</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Max Devices</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Subscription Expiry</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id} style={{ borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
                    <td style={{ padding: '16px', fontWeight: '500' }}>{tenant.company_name || 'Unknown'}</td>
                    <td style={{ padding: '16px', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.85rem' }}>{tenant.id}</td>
                    <td style={{ padding: '16px', textTransform: 'capitalize' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--md-sys-color-primary)', background: 'var(--md-sys-color-primary-container)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
                        {tenant.plan || 'Free'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MonitorSmartphone size={16} color="var(--md-sys-color-on-surface-variant)" />
                        {tenant.max_devices || 5}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {tenant.subscription_ends_at ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={16} color="var(--md-sys-color-on-surface-variant)" />
                          {new Date(tenant.subscription_ends_at).toLocaleDateString()}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.85rem' }}>Lifetime / Free</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Company Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-on-surface-variant)' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '24px', marginTop: 0 }}>Create New Company</h2>
            
            {formError && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{formError}</div>}
            
            <form onSubmit={handleCreateCompany} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input type="text" name="company_name" className="form-input" value={formData.company_name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Domain Name (Subdomain)</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="text" name="domain" className="form-input" value={formData.domain} onChange={handleInputChange} style={{ borderRight: 'none', borderTopRightRadius: 0, borderBottomRightRadius: 0 }} required />
                  <div style={{ padding: '10px 16px', background: 'var(--md-sys-color-surface-variant)', border: '1px solid var(--md-sys-color-outline)', borderLeft: 'none', borderRadius: '0 8px 8px 0', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: '500' }}>
                    .worktrace.com
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Admin Name</label>
                <input type="text" name="admin_name" className="form-input" value={formData.admin_name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Admin Email</label>
                <input type="email" name="admin_email" className="form-input" value={formData.admin_email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" name="admin_password" className="form-input" value={formData.admin_password} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" name="admin_password_confirmation" className="form-input" value={formData.admin_password_confirmation} onChange={handleInputChange} required />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Company'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperadminTenants;
