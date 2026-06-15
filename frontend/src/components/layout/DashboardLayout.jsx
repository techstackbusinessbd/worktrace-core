import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DashboardLayout = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--md-sys-color-background)' }}>
      {/* 1. Fixed Left Sidebar */}
      <Sidebar />

      {/* 2. Right Wrapper (flex-column) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* 3. Fixed Topbar */}
        <Topbar />

        {/* 4. Scrollable Content Area */}
        <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
