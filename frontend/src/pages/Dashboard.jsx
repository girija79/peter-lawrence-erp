import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="container mt-5">
      <h2>Dashboard</h2>
      {user && (
        <div className="mt-3">
          <p>Welcome, <strong>{user.name}</strong></p>
          <p>Role: {user.role}</p>
          <button className="btn btn-outline-danger" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;