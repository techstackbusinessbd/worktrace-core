import { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { CreditCard, Zap, CheckCircle, Clock } from 'lucide-react';

const Billing = () => {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState([]);
  const [tenantDetails, setTenantDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null); // 'pending', 'success', 'error'
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const plansPromise = api.get('/plans');
        const tenantPromise = !user?.is_superadmin ? api.get('/tenant/settings') : Promise.resolve(null);
        
        const [plansRes, tenantRes] = await Promise.all([plansPromise, tenantPromise]);
        
        setPlans(plansRes.data.plans);
        if (tenantRes) {
          setTenantDetails(tenantRes.data.tenant);
        }
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load billing data.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleUpgradeRequest = async (planId) => {
    setRequestStatus('pending');
    try {
      const response = await api.post('/subscriptions/request-upgrade', {
        plan_id: planId,
        payment_method: 'cash_on_delivery'
      });
      setRequestStatus('success');
      setStatusMessage(response.data.message || 'Upgrade request submitted successfully!');
    } catch (err) {
      setRequestStatus('error');
      setStatusMessage(err.response?.data?.message || err.message || JSON.stringify(err.response?.data) || 'Failed to submit request.');
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <CreditCard size={32} color="var(--md-sys-color-primary)" />
        <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Billing & Subscriptions</h1>
      </div>

      {/* Current Plan Card */}
      <div className="glass-panel" style={{ marginBottom: '32px', padding: '24px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.2rem' }}>Current Plan</h2>
        {!user?.is_superadmin ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--md-sys-color-surface-container)', borderRadius: '12px' }}>
              <div style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9rem', marginBottom: '4px' }}>Active Plan</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
                {tenantDetails?.plan || 'Free'}
              </div>
            </div>
            <div style={{ padding: '16px', background: 'var(--md-sys-color-surface-container)', borderRadius: '12px' }}>
              <div style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9rem', marginBottom: '4px' }}>Device Limit</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {tenantDetails?.max_devices || 5} Devices
              </div>
            </div>
            <div style={{ padding: '16px', background: 'var(--md-sys-color-surface-container)', borderRadius: '12px' }}>
              <div style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9rem', marginBottom: '4px' }}>Expires At</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {tenantDetails?.subscription_ends_at ? new Date(tenantDetails.subscription_ends_at).toLocaleDateString() : 'Never (Trial/Free)'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px', background: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-on-primary-container)', borderRadius: '12px' }}>
            <p style={{ margin: 0, fontWeight: '500' }}>You are logged in as the System Owner. Subscription limits do not apply to your account.</p>
          </div>
        )}
      </div>

      {statusMessage && (
        <div className={`alert ${requestStatus === 'error' ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {requestStatus === 'success' ? <CheckCircle size={20} /> : <Clock size={20} />}
          {statusMessage}
        </div>
      )}

      {/* Available Plans */}
      <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.2rem' }}>Available Upgrades</h2>
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading plans...</div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : plans.length === 0 ? (
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>No plans available at the moment.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {plans.map((plan) => (
            <div key={plan.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Zap size={24} color="var(--md-sys-color-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{plan.name}</h3>
              </div>
              
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>
                ৳{plan.price_monthly} <span style={{ fontSize: '1rem', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 'normal' }}>/ mo</span>
              </div>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <CheckCircle size={18} color="var(--md-sys-color-primary)" />
                  <span>Up to <strong>{plan.max_devices}</strong> Devices</span>
                </li>
                {plan.features && plan.features.map((feature, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <CheckCircle size={18} color="var(--md-sys-color-primary)" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={() => handleUpgradeRequest(plan.id)}
                disabled={requestStatus === 'pending'}
              >
                Request Upgrade (COD)
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Billing;
