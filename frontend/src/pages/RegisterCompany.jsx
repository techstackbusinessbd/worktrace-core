import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building, Sun, Moon } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';

const RegisterCompany = () => {
  const navigate = useNavigate();
  const { registerCompany, isLoading, error, clearError } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  
  const [formData, setFormData] = useState({
    company_name: '',
    domain: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    admin_password_confirmation: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    if (formData.admin_password !== formData.admin_password_confirmation) {
      // Basic client validation
      alert("Passwords do not match!");
      return;
    }

    const success = await registerCompany(formData);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-layout" style={{ position: 'relative' }}>
      <button 
        onClick={toggleTheme} 
        className="btn" 
        style={{ position: 'absolute', top: '24px', right: '24px', background: 'var(--md-sys-color-surface-variant)', border: '1px solid var(--md-sys-color-outline)', color: 'var(--md-sys-color-on-surface)', padding: '10px' }}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <div className="glass-panel auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <Building size={40} color="var(--md-sys-color-primary)" style={{ margin: '0 auto 16px' }} />
          <h1>Register Company</h1>
          <p>Create your WorkTrace workspace</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input 
              type="text" 
              name="company_name"
              className="form-input" 
              placeholder="e.g. Acme Corp"
              value={formData.company_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Workspace Domain</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="text" 
                name="domain"
                className="form-input" 
                placeholder="acme"
                value={formData.domain}
                onChange={handleChange}
                style={{ flex: 1 }}
                required
              />
              <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>.worktrace.test</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Admin Name</label>
            <input 
              type="text" 
              name="admin_name"
              className="form-input" 
              placeholder="John Doe"
              value={formData.admin_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input 
              type="email" 
              name="admin_email"
              className="form-input" 
              placeholder="admin@acmecorp.com"
              value={formData.admin_email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Password</label>
              <input 
                type="password" 
                name="admin_password"
                className="form-input" 
                placeholder="••••••••"
                value={formData.admin_password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Confirm Password</label>
              <input 
                type="password" 
                name="admin_password_confirmation"
                className="form-input" 
                placeholder="••••••••"
                value={formData.admin_password_confirmation}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '16px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Workspace...' : 'Create Workspace'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--md-sys-color-on-surface-variant)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--md-sys-color-primary)', textDecoration: 'none' }}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterCompany;
