import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Dashboard() {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    totalLawyers: 0,
    totalEmployees: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get(
          'http://localhost:5000/api/dashboard/stats',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setStats(response.data);

      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Failed to load dashboard statistics'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div>

      {/* Welcome Section */}
      <div className="mb-4">
        <h2 className="fw-bold">
          Welcome back, {user?.name} 👋
        </h2>

        <p className="text-muted">
          Here's an overview of your legal management system.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="row g-4">

        {/* Total Clients */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <p className="text-muted mb-1">
                    Total Clients
                  </p>

                  <h3 className="fw-bold mb-0">
                    {loading ? '...' : stats.totalClients}
                  </h3>
                </div>

                <div className="fs-2 text-primary">
                  <i className="bi bi-people"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* Active Cases */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <p className="text-muted mb-1">
                    Active Cases
                  </p>

                  <h3 className="fw-bold mb-0">
                    0
                  </h3>
                </div>

                <div className="fs-2 text-success">
                  <i className="bi bi-folder2-open"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* Lawyers */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <p className="text-muted mb-1">
                    Lawyers
                  </p>

                  <h3 className="fw-bold mb-0">
                    {loading ? '...' : stats.totalLawyers}
                  </h3>
                </div>

                <div className="fs-2 text-warning">
                  <i className="bi bi-briefcase"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* Employees */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <p className="text-muted mb-1">
                    Employees
                  </p>

                  <h3 className="fw-bold mb-0">
                    {loading ? '...' : stats.totalEmployees}
                  </h3>
                </div>

                <div className="fs-2 text-danger">
                  <i className="bi bi-person-badge"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>

      {/* System Overview */}
      <div className="card border-0 shadow-sm mt-4">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            System Overview
          </h5>

          <p className="text-muted mb-0">
            The dashboard provides a quick overview of users,
            clients, lawyers and employees registered in the
            legal ERP and CRM system.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;