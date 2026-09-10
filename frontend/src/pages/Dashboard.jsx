
import { useContext, useEffect, useState } from 'react';

import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

function Dashboard() {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminStats();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load dashboard statistics.'
      );
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  const roleLabel = {
    admin: 'Administrator',
    lawyer: 'Lawyer',
    employee: 'Employee',
    client: 'Client'
  };

  const renderAdminDashboard = () => (
    <>
      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <div className="dashboard-kicker">
              FIRM OVERVIEW
            </div>

            <h2 className="dashboard-section-title">
              Key Figures
            </h2>
          </div>

          <span className="dashboard-section-note">
            Current system records
          </span>
        </div>

        <div className="dashboard-stat-grid">

          <div className="dashboard-stat">
            <div className="dashboard-stat-label">
              CLIENTS
            </div>

            <div className="dashboard-stat-value">
              {stats?.totalClients ?? '—'}
            </div>

            <div className="dashboard-stat-description">
              Registered client records
            </div>
          </div>


          <div className="dashboard-stat">
            <div className="dashboard-stat-label">
              LAWYERS
            </div>

            <div className="dashboard-stat-value">
              {stats?.totalLawyers ?? '—'}
            </div>

            <div className="dashboard-stat-description">
              Legal professionals
            </div>
          </div>


          <div className="dashboard-stat">
            <div className="dashboard-stat-label">
              EMPLOYEES
            </div>

            <div className="dashboard-stat-value">
              {stats?.totalEmployees ?? '—'}
            </div>

            <div className="dashboard-stat-description">
              Internal staff records
            </div>
          </div>


          <div className="dashboard-stat">
            <div className="dashboard-stat-label">
              SYSTEM USERS
            </div>

            <div className="dashboard-stat-value">
              {stats?.totalUsers ?? '—'}
            </div>

            <div className="dashboard-stat-description">
              Registered platform accounts
            </div>
          </div>

        </div>
      </section>


      <section className="dashboard-lower-grid">

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <div className="dashboard-kicker">
                LEGAL OPERATIONS
              </div>

              <h2 className="dashboard-panel-title">
                Workspace
              </h2>
            </div>
          </div>

          <div className="workspace-list">

            <div className="workspace-row">
              <div className="workspace-icon">
                <i className="bi bi-person-vcard"></i>
              </div>

              <div>
                <strong>Client Management</strong>
                <span>Manage firm client records</span>
              </div>
            </div>

            <div className="workspace-row">
              <div className="workspace-icon">
                <i className="bi bi-folder2-open"></i>
              </div>

              <div>
                <strong>Case Management</strong>
                <span>Track legal matters and proceedings</span>
              </div>
            </div>

            <div className="workspace-row">
              <div className="workspace-icon">
                <i className="bi bi-receipt"></i>
              </div>

              <div>
                <strong>Financial Operations</strong>
                <span>Monitor billing and payments</span>
              </div>
            </div>

          </div>
        </div>


        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <div className="dashboard-kicker">
                SYSTEM
              </div>

              <h2 className="dashboard-panel-title">
                Office Information
              </h2>
            </div>
          </div>

          <div className="dashboard-info-list">

            <div className="dashboard-info-row">
              <span>Office</span>
              <strong>Peter Law Firm</strong>
            </div>

            <div className="dashboard-info-row">
              <span>Location</span>
              <strong>Belgrade, Serbia</strong>
            </div>

            <div className="dashboard-info-row">
              <span>Account</span>
              <strong>{roleLabel[user?.role] || 'User'}</strong>
            </div>

            <div className="dashboard-info-row">
              <span>Access level</span>
              <strong>Administrative</strong>
            </div>

          </div>
        </div>

      </section>
    </>
  );


  const renderLawyerDashboard = () => (
    <>
      <section className="dashboard-section">

        <div className="dashboard-section-heading">
          <div>
            <div className="dashboard-kicker">
              LAWYER WORKSPACE
            </div>

            <h2 className="dashboard-section-title">
              Your Legal Practice
            </h2>
          </div>
        </div>

        <div className="dashboard-stat-grid dashboard-stat-grid-four">

          <div className="dashboard-stat">
            <div className="dashboard-stat-label">
              MY CLIENTS
            </div>

            <div className="dashboard-stat-value">
              —
            </div>

            <div className="dashboard-stat-description">
              Assigned client records
            </div>
          </div>


          <div className="dashboard-stat">
            <div className="dashboard-stat-label">
              MY CASES
            </div>

            <div className="dashboard-stat-value">
              —
            </div>

            <div className="dashboard-stat-description">
              Active legal matters
            </div>
          </div>


          <div className="dashboard-stat">
            <div className="dashboard-stat-label">
              APPOINTMENTS
            </div>

            <div className="dashboard-stat-value">
              —
            </div>

            <div className="dashboard-stat-description">
              Upcoming appointments
            </div>
          </div>


          <div className="dashboard-stat">
            <div className="dashboard-stat-label">
              DOCUMENTS
            </div>

            <div className="dashboard-stat-value">
              —
            </div>

            <div className="dashboard-stat-description">
              Assigned case documents
            </div>
          </div>

        </div>

      </section>


      <section className="dashboard-lower-grid">

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <div className="dashboard-kicker">
                PRACTICE
              </div>

              <h2 className="dashboard-panel-title">
                Legal Workspace
              </h2>
            </div>
          </div>

          <div className="workspace-list">

            <div className="workspace-row">
              <div className="workspace-icon">
                <i className="bi bi-person-vcard"></i>
              </div>

              <div>
                <strong>My Clients</strong>
                <span>View assigned client records</span>
              </div>
            </div>

            <div className="workspace-row">
              <div className="workspace-icon">
                <i className="bi bi-folder2-open"></i>
              </div>

              <div>
                <strong>My Cases</strong>
                <span>Review your assigned legal matters</span>
              </div>
            </div>

            <div className="workspace-row">
              <div className="workspace-icon">
                <i className="bi bi-calendar3"></i>
              </div>

              <div>
                <strong>Appointments</strong>
                <span>Manage upcoming meetings and hearings</span>
              </div>
            </div>

          </div>
        </div>


        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <div className="dashboard-kicker">
                ACCOUNT
              </div>

              <h2 className="dashboard-panel-title">
                Professional Information
              </h2>
            </div>
          </div>

          <div className="dashboard-info-list">

            <div className="dashboard-info-row">
              <span>Account</span>
              <strong>{user?.name}</strong>
            </div>

            <div className="dashboard-info-row">
              <span>Role</span>
              <strong>Lawyer</strong>
            </div>

            <div className="dashboard-info-row">
              <span>Office</span>
              <strong>Peter Law Firm</strong>
            </div>

            <div className="dashboard-info-row">
              <span>Location</span>
              <strong>Belgrade, Serbia</strong>
            </div>

          </div>
        </div>

      </section>
    </>
  );


  const renderEmployeeDashboard = () => (
    <>
      <section className="dashboard-section">

        <div className="dashboard-section-heading">
          <div>
            <div className="dashboard-kicker">
              EMPLOYEE WORKSPACE
            </div>

            <h2 className="dashboard-section-title">
              Your Work Profile
            </h2>
          </div>
        </div>

        <div className="dashboard-stat-grid dashboard-stat-grid-four">

          <div className="dashboard-stat">
            <div className="dashboard-stat-label">
              ATTENDANCE
            </div>

            <div className="dashboard-stat-value">
              —
            </div>

            <div className="dashboard-stat-description">
              Current attendance record
            </div>
          </div>


          <div className="dashboard-stat">
            <div className="dashboard-stat-label">
              LEAVE
            </div>

            <div className="dashboard-stat-value">
              —
            </div>

            <div className="dashboard-stat-description">
              Leave requests
            </div>
          </div>


          <div className="dashboard-stat">
            <div className="dashboard-stat-label">
              PROFILE
            </div>

            <div className="dashboard-stat-value">
              ✓
            </div>

            <div className="dashboard-stat-description">
              Employee account
            </div>
          </div>


          <div className="dashboard-stat">
            <div className="dashboard-stat-label">
              STATUS
            </div>

            <div className="dashboard-stat-value">
              Active
            </div>

            <div className="dashboard-stat-description">
              Current account status
            </div>
          </div>

        </div>

      </section>


      <section className="dashboard-lower-grid">

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <div className="dashboard-kicker">
                MY WORKSPACE
              </div>

              <h2 className="dashboard-panel-title">
                Employee Services
              </h2>
            </div>
          </div>

          <div className="workspace-list">

            <div className="workspace-row">
              <div className="workspace-icon">
                <i className="bi bi-person"></i>
              </div>

              <div>
                <strong>My Profile</strong>
                <span>View your employee information</span>
              </div>
            </div>

            <div className="workspace-row">
              <div className="workspace-icon">
                <i className="bi bi-calendar-check"></i>
              </div>

              <div>
                <strong>Attendance</strong>
                <span>Review your attendance records</span>
              </div>
            </div>

            <div className="workspace-row">
              <div className="workspace-icon">
                <i className="bi bi-calendar-minus"></i>
              </div>

              <div>
                <strong>Leave</strong>
                <span>Submit and monitor leave requests</span>
              </div>
            </div>

          </div>
        </div>


        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <div className="dashboard-kicker">
                ACCOUNT
              </div>

              <h2 className="dashboard-panel-title">
                Employment Information
              </h2>
            </div>
          </div>

          <div className="dashboard-info-list">

            <div className="dashboard-info-row">
              <span>Name</span>
              <strong>{user?.name}</strong>
            </div>

            <div className="dashboard-info-row">
              <span>Role</span>
              <strong>Employee</strong>
            </div>

            <div className="dashboard-info-row">
              <span>Office</span>
              <strong>Peter Law Firm</strong>
            </div>

            <div className="dashboard-info-row">
              <span>Location</span>
              <strong>Belgrade, Serbia</strong>
            </div>

          </div>
        </div>

      </section>
    </>
  );


  const renderClientDashboard = () => (
    <>
      <section className="dashboard-section">

        <div className="dashboard-section-heading">
          <div>
            <div className="dashboard-kicker">
              CLIENT PORTAL
            </div>

            <h2 className="dashboard-section-title">
              Your Legal Matters
            </h2>
          </div>
        </div>

        <div className="dashboard-stat-grid dashboard-stat-grid-four">

          <div className="dashboard-stat">
            <div className="dashboard-stat-label">
              MY CASES
            </div>

            <div className="dashboard-stat-value">
              —
            </div>

            <div className="dashboard-stat-description">
              Your legal matters
            </div>
          </div>


          <div className="dashboard-stat">
            <div className="dashboard-stat-label">
              APPOINTMENTS
            </div>

            <div className="dashboard-stat-value">
              —
            </div>

            <div className="dashboard-stat-description">
              Upcoming appointments
            </div>
          </div>


          <div className="dashboard-stat">
            <div className="dashboard-stat-label">
              DOCUMENTS
            </div>

            <div className="dashboard-stat-value">
              —
            </div>

            <div className="dashboard-stat-description">
              Shared legal documents
            </div>
          </div>


          <div className="dashboard-stat">
            <div className="dashboard-stat-label">
              PAYMENTS
            </div>

            <div className="dashboard-stat-value">
              —
            </div>

            <div className="dashboard-stat-description">
              Billing and payment status
            </div>
          </div>

        </div>

      </section>


      <section className="dashboard-lower-grid">

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <div className="dashboard-kicker">
                CLIENT SERVICES
              </div>

              <h2 className="dashboard-panel-title">
                My Legal Workspace
              </h2>
            </div>
          </div>

          <div className="workspace-list">

            <div className="workspace-row">
              <div className="workspace-icon">
                <i className="bi bi-folder2-open"></i>
              </div>

              <div>
                <strong>My Cases</strong>
                <span>View your legal case information</span>
              </div>
            </div>

            <div className="workspace-row">
              <div className="workspace-icon">
                <i className="bi bi-calendar3"></i>
              </div>

              <div>
                <strong>Appointments</strong>
                <span>View scheduled appointments</span>
              </div>
            </div>

            <div className="workspace-row">
              <div className="workspace-icon">
                <i className="bi bi-file-earmark-text"></i>
              </div>

              <div>
                <strong>Documents</strong>
                <span>Access documents shared with you</span>
              </div>
            </div>

          </div>
        </div>


        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <div className="dashboard-kicker">
                ACCOUNT
              </div>

              <h2 className="dashboard-panel-title">
                Client Information
              </h2>
            </div>
          </div>

          <div className="dashboard-info-list">

            <div className="dashboard-info-row">
              <span>Name</span>
              <strong>{user?.name}</strong>
            </div>

            <div className="dashboard-info-row">
              <span>Role</span>
              <strong>Client</strong>
            </div>

            <div className="dashboard-info-row">
              <span>Office</span>
              <strong>Peter Law Firm</strong>
            </div>

            <div className="dashboard-info-row">
              <span>Location</span>
              <strong>Belgrade, Serbia</strong>
            </div>

          </div>
        </div>

      </section>
    </>
  );


  return (
    <div className="dashboard-page">

      {/* =====================================================
          INTRO
          ===================================================== */}

      <section className="dashboard-intro">

        <div>
          <div className="dashboard-kicker">
            PETER LAW FIRM · BELGRADE
          </div>

          <h1 className="dashboard-heading">
            Good day, {firstName}.
          </h1>

          <p className="dashboard-description">
            {user?.role === 'admin'
              ? 'A central view of firm operations, people and legal administration.'
              : user?.role === 'lawyer'
                ? 'A focused workspace for your clients, cases and legal practice.'
                : user?.role === 'employee'
                  ? 'A personal workspace for your employee services and records.'
                  : 'A secure portal for your legal matters and communication with the firm.'
            }
          </p>
        </div>

        <div className="dashboard-date">
          <span>ACCOUNT</span>
          <strong>
            {roleLabel[user?.role] || 'User'}
          </strong>
        </div>

      </section>


      {/* Error only matters for admin statistics */}
      {error && user?.role === 'admin' && (
        <div className="dashboard-alert">
          <i className="bi bi-exclamation-circle"></i>
          {error}
        </div>
      )}


      {/* =====================================================
          ROLE-SPECIFIC CONTENT
          ===================================================== */}

      {user?.role === 'admin' && renderAdminDashboard()}

      {user?.role === 'lawyer' && renderLawyerDashboard()}

      {user?.role === 'employee' && renderEmployeeDashboard()}

      {user?.role === 'client' && renderClientDashboard()}

    </div>
  );
}

export default Dashboard;

