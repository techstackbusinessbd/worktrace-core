import { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { Users, Plus, X, Edit, Trash2 } from 'lucide-react';

const Employees = () => {
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    designation: '',
    phone: '',
    is_active: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.employees);
      setIsLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load employees.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEmployees();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      designation: '',
      phone: '',
      is_active: true
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      password: '', // Leave blank unless they want to change it
      designation: employee.designation || '',
      phone: employee.phone || '',
      is_active: employee.is_active
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      await api.delete(`/employees/${id}`);
      setEmployees(employees.filter(emp => emp.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    
    try {
      if (editingEmployee) {
        // Update
        const dataToSubmit = { ...formData };
        if (!dataToSubmit.password) delete dataToSubmit.password; // Don't send empty password
        
        await api.put(`/employees/${editingEmployee.id}`, dataToSubmit);
      } else {
        // Create
        if (!formData.password) {
          setFormError('Password is required for new employees.');
          setIsSubmitting(false);
          return;
        }
        await api.post('/employees', formData);
      }
      
      await fetchEmployees();
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.is_superadmin) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--md-sys-color-error)' }}>Access Denied</h2>
        <p>This page is for company admins to manage their employees.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={32} color="var(--md-sys-color-primary)" />
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Employees</h1>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : employees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            No employees found. Add your first team member!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Email</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Designation</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
                    <td style={{ padding: '16px', fontWeight: '500' }}>{emp.name}</td>
                    <td style={{ padding: '16px', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9rem' }}>{emp.email}</td>
                    <td style={{ padding: '16px', fontSize: '0.9rem' }}>{emp.designation || '-'}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600',
                        color: emp.is_active ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-error)', 
                        background: emp.is_active ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-error-container)' 
                      }}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button onClick={() => openEditModal(emp)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-primary)', marginRight: '16px' }} title="Edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(emp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-error)' }} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-on-surface-variant)' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '24px', marginTop: 0 }}>
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h2>
            
            {formError && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{formError}</div>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Password 
                  {editingEmployee && <span style={{ fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '8px', color: 'var(--md-sys-color-on-surface-variant)' }}>(Leave blank to keep current)</span>}
                </label>
                <input type="password" name="password" className="form-input" value={formData.password} onChange={handleInputChange} required={!editingEmployee} minLength="8" />
              </div>
              <div className="form-group">
                <label className="form-label">Designation / Role Title</label>
                <input type="text" name="designation" className="form-input" value={formData.designation} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="text" name="phone" className="form-input" value={formData.phone} onChange={handleInputChange} />
              </div>
              {editingEmployee && (
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" name="is_active" id="is_active" checked={formData.is_active} onChange={handleInputChange} style={{ width: '18px', height: '18px' }} />
                  <label htmlFor="is_active" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>Active Employee</label>
                </div>
              )}
              
              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (editingEmployee ? 'Update Employee' : 'Add Employee')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
