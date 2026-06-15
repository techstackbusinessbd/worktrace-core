import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { Calendar, Clock, Activity, Search } from 'lucide-react';

const formatDuration = (totalSeconds) => {
  if (!totalSeconds) return '0h 0m';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${h}h ${m}m`;
};

const Timesheets = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [summary, setSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Date format: YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchSummary = async (date) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/timesheets/summary?date=${date}`);
      setSummary(response.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load timesheets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(selectedDate);
  }, [selectedDate]);

  if (user?.is_superadmin) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--md-sys-color-error)' }}>Access Denied</h2>
        <p>This page is for company admins to view their employees' timesheets.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header & Date Picker */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Clock size={32} color="var(--md-sys-color-primary)" />
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Timesheets Overview</h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '14px' }}>
              View daily tracked time and activity for your team
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--md-sys-color-surface-variant)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--md-sys-color-outline-variant)' }}>
          <Calendar size={18} color="var(--md-sys-color-on-surface-variant)" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ 
              border: 'none', background: 'transparent', outline: 'none', 
              fontSize: '15px', color: 'var(--md-sys-color-on-surface)',
              fontFamily: 'inherit', cursor: 'pointer'
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : summary.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            No employees found. Add employees to start tracking time.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Employee</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Tracked Time</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Active Time</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Activity %</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((emp) => (
                  <tr key={emp.user_id} style={{ borderBottom: '1px solid var(--md-sys-color-outline-variant)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '600' }}>{emp.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--md-sys-color-on-surface-variant)' }}>{emp.email}</div>
                    </td>
                    <td style={{ padding: '16px', fontWeight: '500', color: 'var(--md-sys-color-primary)' }}>
                      {formatDuration(emp.total_tracked_seconds)}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                      {formatDuration(emp.active_seconds)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '100px', height: '6px', background: 'var(--md-sys-color-surface-variant)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ 
                            height: '100%', 
                            width: `${emp.activity_percentage}%`, 
                            background: emp.activity_percentage > 70 ? 'var(--md-sys-color-primary)' : emp.activity_percentage > 40 ? '#f59e0b' : 'var(--md-sys-color-error)',
                            borderRadius: '3px'
                          }}></div>
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{emp.activity_percentage}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button 
                        onClick={() => navigate(`/dashboard/timesheets/${emp.user_id}?date=${selectedDate}`)}
                        className="btn"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '13px', background: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-primary)' }}
                      >
                        <Search size={14} />
                        View Details
                      </button>
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

export default Timesheets;
