import { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { ShieldAlert, CheckCircle, Clock } from 'lucide-react';

const SuperadminSubscriptions = () => {
  const { user } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data.subscriptions);
      setIsLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load subscriptions.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSubscriptions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.post(`/subscriptions/${id}/approve`);
      fetchSubscriptions();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to approve subscription.');
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this subscription and revert the company to the free plan?')) {
      return;
    }
    try {
      await api.post(`/subscriptions/${id}/deactivate`);
      fetchSubscriptions();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to deactivate subscription.');
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <ShieldAlert size={32} color="var(--md-sys-color-primary)" />
        <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Subscription Approvals</h1>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : subscriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            No subscriptions found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Company Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Plan Request</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Requested At</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
                    <td style={{ padding: '16px' }}>{sub.tenant?.company_name || 'Unknown'}</td>
                    <td style={{ padding: '16px', textTransform: 'capitalize' }}>
                      <div style={{ fontWeight: '600' }}>{sub.plan?.name || 'Unknown Plan'}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                        {sub.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : sub.payment_method}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {sub.status === 'pending' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--md-sys-color-tertiary)', background: 'var(--md-sys-color-tertiary-container)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
                          <Clock size={14} /> Pending
                        </span>
                      ) : sub.status === 'active' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--md-sys-color-primary)', background: 'var(--md-sys-color-primary-container)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
                          <CheckCircle size={14} /> Active
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--md-sys-color-error)', background: 'var(--md-sys-color-error-container)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
                          Revoked
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {sub.status === 'pending' ? (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.9rem' }}
                          onClick={() => handleApprove(sub.id)}
                        >
                          Approve Upgrade
                        </button>
                      ) : sub.status === 'active' ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9rem' }}>Approved</span>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '4px 8px', fontSize: '0.8rem', borderColor: 'var(--md-sys-color-error)', color: 'var(--md-sys-color-error)' }}
                            onClick={() => handleDeactivate(sub.id)}
                          >
                            Revoke
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--md-sys-color-error)', fontSize: '0.9rem', fontWeight: '500' }}>Revoked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperadminSubscriptions;
