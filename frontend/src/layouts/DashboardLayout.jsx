import { Outlet } from 'react-router-dom';
import { useContext } from 'react';

import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

function DashboardLayout() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Section */}
      <div className="main-section">

        {/* Navbar */}
        <Navbar user={user} />

        {/* Page Content */}
        <main className="main-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;