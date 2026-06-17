import { useState, useEffect } from 'react';
import { ShieldAlert, Copy, CheckCircle, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DataTable from 'react-data-table-component';
import useAuthStore from '../store/useAuthStore';

const formatDuration = (totalSeconds) => {
  if (!totalSeconds) return '0h 0m';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${h}h ${m}m`;
};

const customStyles = {
  header: {
    style: {
      backgroundColor: 'transparent',
    },
  },
  headRow: {
    style: {
      backgroundColor: 'var(--md-sys-color-surface-variant)',
      borderBottomColor: 'var(--md-sys-color-outline-variant)',
    },
  },
  headCells: {
    style: {
      fontWeight: '600',
      fontSize: '14px',
      color: 'var(--md-sys-color-on-surface)',
    },
  },
  rows: {
    style: {
      backgroundColor: 'transparent',
      borderBottomColor: 'var(--md-sys-color-outline-variant)',
      fontSize: '14px',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'var(--md-sys-color-surface-variant)',
      },
    },
  },
  pagination: {
    style: {
      backgroundColor: 'transparent',
      borderTopColor: 'var(--md-sys-color-outline-variant)',
      color: 'var(--md-sys-color-on-surface)',
    },
  },
};
import useAuthStore from '../store/useAuthStore';

const DashboardOverview = () => {
  const { user, tenant } = useAuthStore();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [summaryData, setSummaryData] = useState([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/timesheets/summary');
        setSummaryData(res.data.summary || []);
      } catch (err) {
        console.error('Failed to fetch summary', err);
      } finally {
        setIsLoadingSummary(false);
      }
    };
    fetchSummary();
  }, []);

  const columns = [
    {
      name: 'Employee',
      selector: row => row.name,
      sortable: true,
      cell: row => (
        <div>
          <div style={{ fontWeight: '600' }}>{row.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>{row.email}</div>
        </div>
      )
    },
    {
      name: 'Tracked Time',
      selector: row => row.total_tracked_seconds,
      sortable: true,
      format: row => formatDuration(row.total_tracked_seconds),
    },
    {
      name: 'Active Time',
      selector: row => row.active_seconds,
      sortable: true,
      format: row => formatDuration(row.active_seconds),
    },
    {
      name: 'Activity %',
      selector: row => row.activity_percentage,
      sortable: true,
      cell: row => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
          <div style={{ flex: 1, background: 'var(--md-sys-color-outline-variant)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${row.activity_percentage}%`, 
              background: row.activity_percentage > 70 ? '#16a34a' : row.activity_percentage > 40 ? '#ca8a04' : '#dc2626', 
              height: '100%' 
            }}></div>
          </div>
          <span style={{ fontSize: '12px', fontWeight: '600', width: '40px' }}>{row.activity_percentage}%</span>
        </div>
      )
    }
  ];

  const handleRowClicked = (row) => {
    navigate(`/dashboard/timesheets/${row.user_id}`);
  };

  const copyToken = () => {
    const token = typeof tenant === 'object' ? tenant?.enrollment_token : null;
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const enrollmentToken = typeof tenant === 'object' ? tenant?.enrollment_token : null;

  const currentHour = new Date().getHours();
  let greeting = 'Good evening';
  if (currentHour < 12) greeting = 'Good morning';
  else if (currentHour < 18) greeting = 'Good afternoon';

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <header style={{ 
        marginBottom: '32px', 
        padding: '32px', 
        background: 'linear-gradient(135deg, var(--md-sys-color-primary-container) 0%, transparent 100%)',
        borderRadius: '16px',
        border: '1px solid var(--md-sys-color-outline-variant)'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--md-sys-color-on-surface)' }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '15px', margin: 0 }}>
          Here is an overview of your workspace and tenant activities for today.
        </p>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--md-sys-color-primary)" />
            Today's Activity Summary
          </h3>
          <div style={{ overflow: 'hidden' }}>
            <DataTable
              columns={columns}
              data={summaryData}
              progressPending={isLoadingSummary}
              customStyles={customStyles}
              onRowClicked={handleRowClicked}
              highlightOnHover
              pointerOnHover
              responsive
              noDataComponent={<div style={{ padding: '24px', color: 'var(--md-sys-color-on-surface-variant)' }}>No activities tracked today.</div>}
            />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '32px' }}>
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
    </div>
  );
};

export default DashboardOverview;
