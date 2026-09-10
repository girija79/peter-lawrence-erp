import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';

function Navbar({ user }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Convert route into a readable page title
  const getPageTitle = () => {
    const path = location.pathname;

    const titles = {
      '/dashboard': 'Overview',
      '/users': 'User Management',
      '/clients': 'Clients',
      '/lawyers': 'Lawyers',
      '/cases': 'Cases',
      '/appointments': 'Appointments',
      '/documents': 'Documents',
      '/billing': 'Billing',
      '/employees': 'Employees',
      '/hr': 'HR Management',
      '/careers': 'Career Portal',
      '/vendors': 'Vendors',
      '/petty-cash': 'Petty Cash',
      '/payroll': 'Payroll',
      '/reports': 'Reports',
      '/profile': 'My Profile',
      '/attendance': 'Attendance',
      '/leave': 'Leave',
      '/payments': 'Payments'
    };

    return titles[path] || 'Peter Lawrence';
  };

  return (
    <header className="topbar">

      {/* Left Side */}
      <div className="topbar-left">

        <div className="topbar-page">
          <div className="topbar-eyebrow">
            PETER LAWRENCE · LEGAL OFFICE
          </div>

          <h1 className="topbar-title">
            {getPageTitle()}
          </h1>
        </div>

      </div>

      {/* Right Side */}
      <div className="topbar-right">

        {/* Date / Office Label */}
        <div className="topbar-office">
          <span className="topbar-office-label">
            BELGRADE
          </span>

          <span className="topbar-office-status">
            <span className="status-dot"></span>
            Office system
          </span>
        </div>

        {/* Divider */}
        <div className="topbar-divider"></div>

        {/* Notifications */}
        <button
          type="button"
          className="topbar-icon-button"
          title="Notifications"
        >
          <i className="bi bi-bell"></i>

          <span className="notification-dot"></span>
        </button>

        {/* User */}
        <div className="topbar-user">

          <div className="topbar-user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div className="topbar-user-details">

            <div className="topbar-user-name">
              {user?.name || 'User'}
            </div>

            <div className="topbar-user-role">
              {user?.role || 'User'}
            </div>

          </div>

        </div>

        {/* Logout */}
        <button
          type="button"
          className="topbar-logout"
          onClick={handleLogout}
          title="Logout"
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Sign out</span>
        </button>

      </div>

    </header>
  );
}

export default Navbar;