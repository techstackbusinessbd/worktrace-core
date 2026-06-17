import { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, Copy, CheckCircle, Activity, Users, Clock, MousePointer2, Keyboard, Zap, Monitor, Building, ArrowRight } from 'lucide-react';
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
      transition: 'background-color 0.2s ease',
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

const KPICard = ({ title, value, subtitle, icon, colorClass }) => (
  <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
    <div style={{ 
      width: '56px', height: '56px', borderRadius: '16px', 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...colorClass
    }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
      <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: 'var(--md-sys-color-on-surface)' }}>{value}</h3>
      {subtitle && <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)' }}>{subtitle}</p>}
    </div>
  </div>
);

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

  // Calculate aggregates
  const aggregateStats = useMemo(() => {
    let totalTracked = 0;
    let totalActive = 0;
    let totalClicks = 0;
    let totalKeystrokes = 0;
    
    summaryData.forEach(s => {
      totalTracked += s.total_tracked_seconds;
      totalActive += s.active_seconds;
      totalClicks += s.total_mouse_clicks;
      totalKeystrokes += s.total_keystrokes;
    });

    const overallActivity = totalTracked > 0 ? Math.round((totalActive / totalTracked) * 100) : 0;

    return { totalTracked, totalActive, overallActivity, totalClicks, totalKeystrokes };
  }, [summaryData]);

  const columns = [
    {
      name: 'Employee',
      selector: row => row.name,
      sortable: true,
      cell: row => (
        <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--md-sys-color-primary) 0%, var(--md-sys-color-tertiary) 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            {row.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: '600', color: 'var(--md-sys-color-on-surface)' }}>{row.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>{row.email}</div>
          </div>
        </div>
      ),
      minWidth: '250px'
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
          <div style={{ flex: 1, background: 'var(--md-sys-color-outline-variant)', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${row.activity_percentage}%`, 
              background: row.activity_percentage > 70 ? '#16a34a' : row.activity_percentage > 40 ? '#ca8a04' : '#dc2626', 
              height: '100%',
              borderRadius: '4px',
              transition: 'width 1s ease-in-out'
            }}></div>
          </div>
          <span style={{ fontSize: '13px', fontWeight: '700', width: '40px', color: row.activity_percentage > 70 ? '#16a34a' : row.activity_percentage > 40 ? '#ca8a04' : '#dc2626' }}>{row.activity_percentage}%</span>
        </div>
      ),
      minWidth: '200px'
    },
    {
      name: 'Action',
      cell: row => (
        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', color: 'var(--md-sys-color-primary)', border: '1px solid var(--md-sys-color-primary)' }}>
          View Details <ArrowRight size={14} />
        </button>
      ),
      right: true
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
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Welcome Header */}
      <header style={{ 
        marginBottom: '40px', 
        padding: '40px', 
        background: 'linear-gradient(135deg, rgba(88, 86, 214, 0.1) 0%, rgba(255, 45, 85, 0.05) 100%)',
        borderRadius: '24px',
        border: '1px solid var(--md-sys-color-outline-variant)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Decoration */}
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'var(--md-sys-color-primary)', filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%' }}></div>
        
        <div style={{ zIndex: 1 }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 12px 0', color: 'var(--md-sys-color-on-surface)', letterSpacing: '-0.02em' }}>
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '16px', margin: 0, maxWidth: '600px', lineHeight: '1.5' }}>
            Welcome to your command center. Monitor team productivity, track active sessions, and oversee your entire workspace efficiently.
          </p>
        </div>

        {/* Enrollment Token Mini-Card */}
        {enrollmentToken && (
          <div style={{ background: 'var(--md-sys-color-surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--md-sys-color-outline-variant)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)', zIndex: 1, minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ background: 'var(--md-sys-color-primary-container)', padding: '8px', borderRadius: '8px', color: 'var(--md-sys-color-primary)' }}>
                <ShieldAlert size={20} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Enrollment Token</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--md-sys-color-background)', padding: '10px 14px', borderRadius: '8px', border: '1px dashed var(--md-sys-color-outline)' }}>
              <code style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '0.15em', color: 'var(--md-sys-color-on-surface)', flex: 1, textAlign: 'center' }}>
                {enrollmentToken}
              </code>
              <button onClick={copyToken} style={{ background: copied ? '#16a34a' : 'var(--md-sys-color-primary)', color: 'white', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} title="Copy Token">
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <KPICard 
          title="Team Members" 
          value={summaryData.length} 
          subtitle="Tracking today"
          icon={<Users size={28} />}
          colorClass={{ background: 'rgba(88, 86, 214, 0.15)', color: '#5856D6' }}
        />
        <KPICard 
          title="Total Tracked" 
          value={formatDuration(aggregateStats.totalTracked)} 
          subtitle={`${formatDuration(aggregateStats.totalActive)} active time`}
          icon={<Clock size={28} />}
          colorClass={{ background: 'rgba(52, 199, 89, 0.15)', color: '#34C759' }}
        />
        <KPICard 
          title="Overall Activity" 
          value={`${aggregateStats.overallActivity}%`} 
          subtitle="Team average"
          icon={<Zap size={28} />}
          colorClass={{ background: 'rgba(255, 149, 0, 0.15)', color: '#FF9500' }}
        />
        <KPICard 
          title="Interactions" 
          value={(aggregateStats.totalKeystrokes + aggregateStats.totalClicks).toLocaleString()} 
          subtitle="Keys & Clicks today"
          icon={<Keyboard size={28} />}
          colorClass={{ background: 'rgba(255, 45, 85, 0.15)', color: '#FF2D55' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Main Table Area */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--md-sys-color-outline-variant)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={24} color="var(--md-sys-color-primary)" />
            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Team Activity Overview</h3>
          </div>
          
          <DataTable
            columns={columns}
            data={summaryData}
            progressPending={isLoadingSummary}
            customStyles={customStyles}
            onRowClicked={handleRowClicked}
            highlightOnHover
            pointerOnHover
            responsive
            pagination
            noDataComponent={
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)' }}>
                <Monitor size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <h4 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>No activity data available</h4>
                <p style={{ margin: 0, fontSize: '14px' }}>Once your team starts tracking time, their activities will appear here.</p>
              </div>
            }
          />
        </div>

        {/* Side Panel: Tenant Info */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Building size={20} color="var(--md-sys-color-primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Workspace Details</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: '600', textTransform: 'uppercase' }}>Company Name</p>
              <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--md-sys-color-on-surface)' }}>
                {typeof tenant === 'object' ? tenant?.company_name : 'Platform Owner'}
              </div>
            </div>
            
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: '600', textTransform: 'uppercase' }}>Tenant ID</p>
              <div style={{ fontSize: '14px', fontFamily: 'monospace', background: 'var(--md-sys-color-surface-variant)', padding: '6px 10px', borderRadius: '6px', display: 'inline-block' }}>
                {typeof tenant === 'object' ? tenant?.id : tenant || 'System'}
              </div>
            </div>

            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: '600', textTransform: 'uppercase' }}>Your Role</p>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--md-sys-color-primary)', background: 'var(--md-sys-color-primary-container)', padding: '4px 10px', borderRadius: '12px', display: 'inline-block' }}>
                Administrator
              </div>
            </div>

            {tenant && typeof tenant === 'object' && (
              <>
                <div style={{ height: '1px', background: 'var(--md-sys-color-outline-variant)', margin: '8px 0' }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)' }}>Active Plan</p>
                  <span style={{ fontSize: '14px', fontWeight: '700', textTransform: 'capitalize' }}>{tenant?.plan || 'Free'}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)' }}>Device Limit</p>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{tenant?.max_devices || 5} Devices</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)' }}>Billing Expiry</p>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{tenant?.subscription_ends_at ? new Date(tenant.subscription_ends_at).toLocaleDateString() : 'Never'}</span>
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
