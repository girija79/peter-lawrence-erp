import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';

function Navbar({ user }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar bg-white border-bottom px-4">

      {/* Page Title */}
      <div>
        <h5 className="mb-0">Dashboard</h5>
      </div>

      {/* User Section */}
      <div className="d-flex align-items-center gap-3">

        {/* Notification */}
        <button className="btn btn-light">
          <i className="bi bi-bell fs-5"></i>
        </button>

        {/* User Name & Role */}
        <div className="text-end">
          <div className="fw-semibold">
            {user?.name}
          </div>

          <small className="text-muted text-capitalize">
            {user?.role}
          </small>
        </div>

        {/* Profile Circle */}
        <div
          className="rounded-circle bg-primary text-white
                     d-flex align-items-center justify-content-center"
          style={{
            width: '40px',
            height: '40px'
          }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        {/* Logout Button */}
        <button
          className="btn btn-outline-danger"
          onClick={handleLogout}
          title="Logout"
        >
          <i className="bi bi-box-arrow-right me-1"></i>
          Logout
        </button>

      </div>

    </nav>
  );
}

export default Navbar;