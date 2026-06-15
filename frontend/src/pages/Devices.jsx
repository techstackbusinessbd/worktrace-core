import { useState, useEffect } from 'react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { Monitor, Link as LinkIcon, User, CheckSquare, Zap, UserPlus } from 'lucide-react';

const Devices = () => {
  const { user } = useAuthStore();
  const [devices, setDevices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigningId, setAssigningId] = useState(null);
  
  // Bulk Selection State
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [devicesRes, empRes] = await Promise.all([
        api.get('/devices'),
        api.get('/employees')
      ]);
      setDevices(devicesRes.data.devices || []);
      setEmployees(empRes.data.employees || []);
      setSelectedDevices([]); // clear selection on reload
    } catch (err) {
      setError('Failed to load devices.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (deviceId, userId) => {
    if (!userId) return;
    setAssigningId(deviceId);
    try {
      const response = await api.put(`/devices/${deviceId}/assign`, { user_id: userId });
      setDevices(devices.map(d => d.id === deviceId ? response.data.device : d));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign device.');
    } finally {
      setAssigningId(null);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const unassignedIds = devices.filter(d => !d.user_id).map(d => d.id);
      setSelectedDevices(unassignedIds);
    } else {
      setSelectedDevices([]);
    }
  };

  const handleSelectDevice = (id) => {
    if (selectedDevices.includes(id)) {
      setSelectedDevices(selectedDevices.filter(dId => dId !== id));
    } else {
      setSelectedDevices([...selectedDevices, id]);
    }
  };

  const handleSmartAutoMatch = async () => {
    setIsBulkProcessing(true);
    
    // Attempt to match hostname with employee name
    const mappings = [];
    selectedDevices.forEach(deviceId => {
      const device = devices.find(d => d.id === deviceId);
      if (device) {
        const hostname = (device.hostname || '').toLowerCase();
        // Simple fuzzy match by name
        const match = employees.find(e => e.name.toLowerCase() === hostname || e.email.toLowerCase().includes(hostname));
        if (match) {
          mappings.push({ device_id: device.id, user_id: match.id });
        }
      }
    });

    if (mappings.length === 0) {
      alert("No smart matches found. Please try creating new employees.");
      setIsBulkProcessing(false);
      return;
    }

    try {
      const res = await api.post('/devices/bulk-assign', { mappings });
      alert(res.data.message);
      fetchData();
    } catch (err) {
      alert('Bulk assign failed.');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkCreateAssign = async () => {
    if (!window.confirm(`Are you sure you want to create new employees for ${selectedDevices.length} devices?`)) return;
    
    setIsBulkProcessing(true);
    try {
      const res = await api.post('/devices/bulk-create-assign', { device_ids: selectedDevices });
      alert(res.data.message);
      fetchData();
    } catch (err) {
      alert('Bulk create failed.');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  if (user?.is_superadmin) {
    return <div style={{ padding: '24px' }}>Access Denied</div>;
  }

  const unassignedDevicesCount = devices.filter(d => !d.user_id).length;

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Monitor size={32} color="var(--md-sys-color-primary)" />
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Endpoints / Devices</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '14px' }}>
            Map silent tracker installations to your employees.
          </p>
        </div>
      </div>

      {/* Floating Action Bar */}
      {selectedDevices.length > 0 && (
        <div style={{
          background: 'var(--md-sys-color-primary-container)',
          color: 'var(--md-sys-color-on-primary-container)',
          padding: '16px 24px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600' }}>
            <CheckSquare size={20} />
            {selectedDevices.length} Devices Selected
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handleSmartAutoMatch}
              disabled={isBulkProcessing}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                background: 'var(--md-sys-color-primary)',
                color: 'white', fontWeight: '600', cursor: 'pointer'
              }}
            >
              <Zap size={16} /> Smart Auto-Match
            </button>
            <button 
              onClick={handleBulkCreateAssign}
              disabled={isBulkProcessing}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                background: '#047857', // green
                color: 'white', fontWeight: '600', cursor: 'pointer'
              }}
            >
              <UserPlus size={16} /> Create Employees & Link
            </button>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '24px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : devices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            No devices enrolled yet. Install the agent using your Enrollment Token.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
                  <th style={{ padding: '12px 16px', width: '40px' }}>
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={selectedDevices.length === unassignedDevicesCount && unassignedDevicesCount > 0}
                      disabled={unassignedDevicesCount === 0}
                    />
                  </th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Hostname</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Domain User</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>MAC Address</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Assigned Employee</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.id} style={{ borderBottom: '1px solid var(--md-sys-color-outline-variant)', background: selectedDevices.includes(device.id) ? 'var(--md-sys-color-surface-variant)' : 'transparent' }}>
                    <td style={{ padding: '16px' }}>
                      {!device.user_id && (
                        <input 
                          type="checkbox" 
                          checked={selectedDevices.includes(device.id)}
                          onChange={() => handleSelectDevice(device.id)}
                        />
                      )}
                    </td>
                    <td style={{ padding: '16px', fontWeight: '600' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Monitor size={16} color="var(--md-sys-color-on-surface-variant)" />
                        {device.hostname || 'Unknown-PC'}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                      {device.domain_user || '-'}
                    </td>
                    <td style={{ padding: '16px', fontFamily: 'monospace', color: 'var(--md-sys-color-on-surface-variant)' }}>
                      {device.mac_address}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                        color: device.user_id ? '#166534' : '#9a3412', 
                        background: device.user_id ? '#dcfce7' : '#ffedd5' 
                      }}>
                        {device.user_id ? 'Mapped' : 'Unassigned'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {device.user_id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={16} color="var(--md-sys-color-primary)" />
                          <span style={{ fontWeight: '500' }}>{device.user?.name}</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <LinkIcon size={16} color="var(--md-sys-color-on-surface-variant)" />
                          <select 
                            onChange={(e) => handleAssign(device.id, e.target.value)}
                            disabled={assigningId === device.id}
                            style={{ 
                              padding: '6px 12px', borderRadius: '6px', 
                              border: '1px solid var(--md-sys-color-outline-variant)',
                              background: 'var(--md-sys-color-surface)',
                              color: 'var(--md-sys-color-on-surface)'
                            }}
                          >
                            <option value="">-- Assign Employee --</option>
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                            ))}
                          </select>
                          {assigningId === device.id && <span style={{ fontSize: '12px' }}>Saving...</span>}
                        </div>
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

export default Devices;
