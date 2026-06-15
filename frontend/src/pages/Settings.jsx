import { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { Settings as SettingsIcon, Building2, User, Key, CheckCircle, ShieldCheck } from 'lucide-react';

const Settings = () => {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Tenant state
  const [tenant, setTenant] = useState(null);
  const [tenantLoading, setTenantLoading] = useState(false);
  const [tenantSubmitting, setTenantSubmitting] = useState(false);
  const [tenantMsg, setTenantMsg] = useState({ type: '', text: '' });
  const [tenantData, setTenantData] = useState({ company_name: '' });

  // Profile state
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    password_confirmation: ''
  });

  useEffect(() => {
    if (!user?.is_superadmin) {
      fetchTenantSettings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTenantSettings = async () => {
    setTenantLoading(true);
    try {
      const response = await api.get('/tenant/settings');
      setTenant(response.data.tenant);
      setTenantData({ company_name: response.data.tenant.company_name });
    } catch (err) {
      console.error('Failed to fetch tenant settings', err);
    } finally {
      setTenantLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleTenantChange = (e) => {
    setTenantData({ ...tenantData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });

    if (profileData.password && profileData.password !== profileData.password_confirmation) {
      setProfileMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setProfileSubmitting(true);
    try {
      const dataToSubmit = { 
        name: profileData.name, 
        email: profileData.email, 
        phone: profileData.phone 
      };
      if (profileData.password) {
        dataToSubmit.password = profileData.password;
      }

      const response = await api.put('/user/profile', dataToSubmit);
      setUser(response.data.user);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
      setProfileData({ ...profileData, password: '', password_confirmation: '' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleTenantSubmit = async (e) => {
    e.preventDefault();
    setTenantMsg({ type: '', text: '' });
    setTenantSubmitting(true);
    try {
      const response = await api.put('/tenant/settings', tenantData);
      setTenant(response.data.tenant);
      setTenantMsg({ type: 'success', text: 'Company profile updated successfully.' });
    } catch (err) {
      setTenantMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update company profile.' });
    } finally {
      setTenantSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Enrollment Token copied to clipboard!');
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <SettingsIcon size={32} color="var(--md-sys-color-primary)" />
        <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Settings</h1>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexDirection: 'column' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--md-sys-color-outline-variant)', paddingBottom: '12px' }}>
          <button 
            onClick={() => setActiveTab('profile')}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600', 
              color: activeTab === 'profile' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
              padding: '8px 16px', borderRadius: '8px', transition: 'all 0.2s',
              backgroundColor: activeTab === 'profile' ? 'var(--md-sys-color-primary-container)' : 'transparent',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <User size={18} />
            My Profile
          </button>
          
          {!user?.is_superadmin && (
            <button 
              onClick={() => setActiveTab('company')}
              style={{ 
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600', 
                color: activeTab === 'company' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
                padding: '8px 16px', borderRadius: '8px', transition: 'all 0.2s',
                backgroundColor: activeTab === 'company' ? 'var(--md-sys-color-primary-container)' : 'transparent',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <Building2 size={18} />
              Company Profile
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '600px' }}>
              <h2 style={{ fontSize: '20px', marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="var(--md-sys-color-primary)" />
                Personal Information
              </h2>
              
              {profileMsg.text && (
                <div className={`alert alert-${profileMsg.type}`} style={{ marginBottom: '24px' }}>
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" name="name" className="form-input" value={profileData.name} onChange={handleProfileChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" name="email" className="form-input" value={profileData.email} onChange={handleProfileChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="text" name="phone" className="form-input" value={profileData.phone} onChange={handleProfileChange} />
                </div>
                
                <h3 style={{ fontSize: '16px', marginTop: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  <Key size={16} />
                  Change Password
                </h3>
                <div className="form-group">
                  <label className="form-label">New Password (leave blank to keep current)</label>
                  <input type="password" name="password" className="form-input" value={profileData.password} onChange={handleProfileChange} minLength="8" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" name="password_confirmation" className="form-input" value={profileData.password_confirmation} onChange={handleProfileChange} minLength="8" />
                </div>

                <div style={{ marginTop: '16px' }}>
                  <button type="submit" className="btn btn-primary" disabled={profileSubmitting}>
                    {profileSubmitting ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'company' && !user?.is_superadmin && (
            <div style={{ maxWidth: '600px' }}>
              <h2 style={{ fontSize: '20px', marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="var(--md-sys-color-primary)" />
                Company Details
              </h2>

              {tenantLoading ? (
                <p>Loading company data...</p>
              ) : (
                <>
                  {tenantMsg.text && (
                    <div className={`alert alert-${tenantMsg.type}`} style={{ marginBottom: '24px' }}>
                      {tenantMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleTenantSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                    <div className="form-group">
                      <label className="form-label">Company Name</label>
                      <input type="text" name="company_name" className="form-input" value={tenantData.company_name} onChange={handleTenantChange} required />
                    </div>
                    <div>
                      <button type="submit" className="btn btn-primary" disabled={tenantSubmitting}>
                        {tenantSubmitting ? 'Saving...' : 'Update Company Name'}
                      </button>
                    </div>
                  </form>

                  <h3 style={{ fontSize: '18px', marginTop: '0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--md-sys-color-outline-variant)', paddingTop: '32px' }}>
                    <ShieldCheck size={18} color="var(--md-sys-color-primary)" />
                    Enrollment Token
                  </h3>
                  <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '14px', marginBottom: '16px' }}>
                    Your employees will need this token to connect their desktop tracker app to your company workspace. Keep it secure.
                  </p>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <code style={{ 
                      padding: '12px 16px', background: 'var(--md-sys-color-surface-variant)', 
                      borderRadius: '8px', fontSize: '16px', fontWeight: '600', letterSpacing: '1px',
                      color: 'var(--md-sys-color-on-surface-variant)', border: '1px solid var(--md-sys-color-outline)',
                      userSelect: 'all', flex: 1
                    }}>
                      {tenant?.enrollment_token}
                    </code>
                    <button 
                      type="button" 
                      className="btn" 
                      style={{ background: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-primary)' }}
                      onClick={() => copyToClipboard(tenant?.enrollment_token)}
                    >
                      Copy Token
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
