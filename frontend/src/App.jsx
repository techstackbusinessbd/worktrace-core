import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import useThemeStore from './store/useThemeStore';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Login from './pages/Login';
import RegisterCompany from './pages/RegisterCompany';
import DashboardOverview from './pages/DashboardOverview';
import SuperadminSubscriptions from './pages/SuperadminSubscriptions';
import SuperadminTenants from './pages/SuperadminTenants';
import Billing from './pages/Billing';
import Employees from './pages/Employees';
import Settings from './pages/Settings';
import Timesheets from './pages/Timesheets';
import UserTimesheetDetails from './pages/UserTimesheetDetails';
import Devices from './pages/Devices';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route Wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const App = () => {
  const theme = useThemeStore((state) => state.theme);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register-company" 
          element={
            <PublicRoute>
              <RegisterCompany />
            </PublicRoute>
          } 
        />
        
        {/* Protected Dashboard Routes with Layout */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Nested Routes inside DashboardLayout */}
          <Route index element={<DashboardOverview />} />
          <Route path="billing" element={<Billing />} />
          <Route path="employees" element={<Employees />} />
          <Route path="settings" element={<Settings />} />
          <Route path="subscriptions" element={<SuperadminSubscriptions />} />
          <Route path="tenants" element={<SuperadminTenants />} />
          <Route path="timesheets" element={<Timesheets />} />
          <Route path="timesheets/:id" element={<UserTimesheetDetails />} />
          <Route path="devices" element={<Devices />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
