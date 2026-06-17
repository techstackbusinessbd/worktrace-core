import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Clock, Activity, Monitor, Calendar, X } from 'lucide-react';
import DataTable from 'react-data-table-component';

const formatDuration = (totalSeconds) => {
  if (!totalSeconds) return '0h 0m';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${h}h ${m}m`;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

const columns = [
  {
    id: 'time-col',
    name: 'Time',
    selector: row => `${formatTime(row.start_time)} - ${formatTime(row.end_time)}`,
    sortable: true,
    sortFunction: (rowA, rowB) => new Date(rowA.start_time).getTime() - new Date(rowB.start_time).getTime(),
  },
  {
    name: 'Application',
    selector: row => row.application_name,
    sortable: true,
  },
  {
    name: 'Window Title',
    selector: row => row.window_title,
    sortable: true,
    cell: row => (
      <div title={row.window_title} style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {row.window_title}
      </div>
    )
  },
  {
    name: 'Keystrokes',
    selector: row => row.keyboard_strokes,
    sortable: true,
  },
  {
    name: 'Mouse Clicks',
    selector: row => row.mouse_clicks,
    sortable: true,
  },
  {
    name: 'Status',
    selector: row => row.is_idle ? 'Idle' : 'Active',
    sortable: true,
    cell: row => (
      <span style={{ 
        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
        color: row.is_idle ? '#9a3412' : '#166534', 
        background: row.is_idle ? '#ffedd5' : '#dcfce7' 
      }}>
        {row.is_idle ? 'Idle' : 'Active'}
      </span>
    )
  },
];

const UserTimesheetDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dateFromUrl = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/timesheets/user/${id}?date=${dateFromUrl}`);
        setDetails(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id, dateFromUrl]);

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading details...</div>;
  }

  if (error || !details) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="alert alert-error" style={{ display: 'inline-block' }}>{error || 'Data not found.'}</div>
        <br/><br/>
        <button className="btn" onClick={() => navigate('/dashboard/timesheets')}>Go Back</button>
      </div>
    );
  }

  const activeSeconds = details.stats.total_seconds - details.stats.idle_seconds;
  const activityPercentage = details.stats.total_seconds > 0 
    ? Math.round((activeSeconds / details.stats.total_seconds) * 100) 
    : 0;

  return (
    <>
      {/* Full Screen Image Modal */}
      {selectedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              style={{
                position: 'absolute',
                top: '-40px', right: 0,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              <X size={24} />
            </button>
            <img 
              src={selectedImage} 
              alt="Screenshot Full Screen" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '90vh', 
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
              }} 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate('/dashboard/timesheets')}
          style={{ background: 'var(--md-sys-color-surface-variant)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--md-sys-color-on-surface-variant)', transition: 'all 0.2s' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>{details.user.name}'s Activity</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '4px 0 0 0', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '14px' }}>
            <span>{details.user.email}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} />
              {dateFromUrl}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-primary)', borderRadius: '12px' }}>
            <Clock size={24} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: '600' }}>Total Tracked Time</p>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '800' }}>{formatDuration(details.stats.total_seconds)}</h2>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ padding: '12px', background: '#dcfce7', color: '#166534', borderRadius: '12px' }}>
            <Activity size={24} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: '600' }}>Active Time</p>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '800' }}>{formatDuration(activeSeconds)}</h2>
            <div style={{ fontSize: '12px', color: '#166534', fontWeight: '600', marginTop: '4px' }}>{activityPercentage}% Activity</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        
        {/* Screenshots Gallery */}
        <div>
          <h2 style={{ fontSize: '20px', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Monitor size={20} color="var(--md-sys-color-primary)" />
            Screenshots
          </h2>
          
          {details.screenshots.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)' }}>
              No screenshots captured on this day.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {details.screenshots.map((shot) => (
                <div key={shot.id} className="glass-panel" style={{ overflow: 'hidden', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Since S3 upload might be mocked or not fully configured, handle broken images gracefully */}
                  <div style={{ width: '100%', height: '180px', background: '#000', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={shot.s3_path} 
                      alt="Screenshot" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8, cursor: 'pointer', transition: 'opacity 0.2s' }}
                      onClick={() => setSelectedImage(shot.s3_path)}
                      onMouseOver={(e) => e.target.style.opacity = 1}
                      onMouseOut={(e) => e.target.style.opacity = 0.8}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div style={{ display: 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', color: '#666', background: '#111', fontSize: '13px' }}>
                      Image unavailable
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{formatTime(shot.captured_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--md-sys-color-primary)" />
            Application Activity
          </h2>
          
          {details.activities.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)' }}>
              No application activity tracked on this day.
            </div>
          ) : (
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <DataTable
                columns={columns}
                data={details.activities}
                pagination
                customStyles={customStyles}
                highlightOnHover
                responsive
                defaultSortFieldId="time-col"
                defaultSortAsc={false}
              />
            </div>
          )}
        </div>
        
      </div>
    </div>
    </>
  );
};

export default UserTimesheetDetails;
