import { useEffect, useState } from 'react';
import axios from 'axios';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(
        'http://localhost:5000/api/users',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUsers(response.data);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load users'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');

      if (editingUserId) {
        await axios.put(
          `http://localhost:5000/api/users/${editingUserId}`,
          {
            name,
            email,
            password,
            role
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/users',
          {
            name,
            email,
            password,
            role
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }

      setName('');
      setEmail('');
      setPassword('');
      setRole('client');
      setEditingUserId(null);
      setShowForm(false);

      fetchUsers();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to save user'
      );
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setError('');

      const token = localStorage.getItem('token');

      await axios.delete(
        `http://localhost:5000/api/users/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUsers((currentUsers) =>
        currentUsers.filter(
          (currentUser) => currentUser._id !== user._id
        )
      );

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to delete user'
      );
    }
  };

  const handleAddUser = () => {
    setEditingUserId(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('client');
    setError('');
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setEditingUserId(user._id);
    setName(user.name);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setError('');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUserId(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('client');
    setError('');
  };

  const getInitial = (name) => {
    return name?.charAt(0)?.toUpperCase() || 'U';
  };

  const getRoleClass = (role) => {
    return `user-role-badge user-role-${role}`;
  };

  return (
    <div className="users-page">

      {/* Page Header */}
      <div className="page-header users-header">

        <div>
          <div className="page-kicker">
            ADMINISTRATION · ACCESS CONTROL
          </div>

          <h1 className="page-title">
            User Management
          </h1>

          <p className="page-description">
            Manage accounts and access across the Peter Lawrence
            legal office.
          </p>
        </div>

        <button
          className="pl-button pl-button-primary"
          onClick={handleAddUser}
        >
          <i className="bi bi-person-plus"></i>
          Add user
        </button>

      </div>


      {/* Summary */}
      <div className="users-summary">

        <div className="users-summary-item">
          <span>Total users</span>
          <strong>{users.length}</strong>
        </div>

        <div className="users-summary-divider"></div>

        <div className="users-summary-item">
          <span>Administrators</span>
          <strong>
            {users.filter((user) => user.role === 'admin').length}
          </strong>
        </div>

        <div className="users-summary-divider"></div>

        <div className="users-summary-item">
          <span>Lawyers</span>
          <strong>
            {users.filter((user) => user.role === 'lawyer').length}
          </strong>
        </div>

        <div className="users-summary-divider"></div>

        <div className="users-summary-item">
          <span>Clients</span>
          <strong>
            {users.filter((user) => user.role === 'client').length}
          </strong>
        </div>

      </div>


      {/* Error */}
      {error && (
        <div className="pl-alert pl-alert-danger">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}


      {/* Add / Edit Form */}
      {showForm && (
        <div className="pl-form-panel">

          <div className="pl-form-header">

            <div>
              <div className="page-kicker">
                ACCOUNT CONFIGURATION
              </div>

              <h2>
                {editingUserId
                  ? 'Edit user'
                  : 'Create user'}
              </h2>
            </div>

            <button
              type="button"
              className="pl-close-button"
              onClick={handleCloseForm}
              aria-label="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>

          </div>


          <form onSubmit={handleCreateUser}>

            <div className="pl-form-grid">

              {/* Name */}
              <div className="pl-form-field">

                <label htmlFor="user-name">
                  Full name
                </label>

                <input
                  id="user-name"
                  type="text"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

              </div>


              {/* Email */}
              <div className="pl-form-field">

                <label htmlFor="user-email">
                  Email address
                </label>

                <input
                  id="user-email"
                  type="email"
                  placeholder="name@firm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

              </div>


              {/* Password */}
              <div className="pl-form-field">

                <label htmlFor="user-password">
                  Password
                </label>

                <input
                  id="user-password"
                  type="password"
                  placeholder={
                    editingUserId
                      ? 'Leave blank to keep current password'
                      : 'Enter password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!editingUserId}
                />

                {editingUserId && (
                  <small>
                    Leave blank to keep the existing password.
                  </small>
                )}

              </div>


              {/* Role */}
              <div className="pl-form-field">

                <label htmlFor="user-role">
                  Access role
                </label>

                <select
                  id="user-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="client">Client</option>
                  <option value="lawyer">Lawyer</option>
                  <option value="employee">Employee</option>
                  <option value="admin">Administrator</option>
                </select>

              </div>

            </div>


            <div className="pl-form-actions">

              <button
                type="submit"
                className="pl-button pl-button-primary"
              >
                <i
                  className={`bi ${
                    editingUserId
                      ? 'bi-check2'
                      : 'bi-person-plus'
                  }`}
                ></i>

                {editingUserId
                  ? 'Save changes'
                  : 'Create user'}
              </button>

              <button
                type="button"
                className="pl-button pl-button-secondary"
                onClick={handleCloseForm}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}


      {/* Loading */}
      {loading && (
        <div className="pl-loading">

          <div className="pl-loading-line"></div>

          <p>Loading user records...</p>

        </div>
      )}


      {/* User Table */}
      {!loading && (
        <div className="pl-table-panel">

          <div className="pl-table-header">

            <div>
              <div className="page-kicker">
                DIRECTORY
              </div>

              <h2>
                Firm accounts
              </h2>
            </div>

            <span className="pl-record-count">
              {users.length} {users.length === 1 ? 'record' : 'records'}
            </span>

          </div>


          <div className="table-responsive">

            <table className="pl-table">

              <thead>
                <tr>
                  <th>USER</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>CREATED</th>
                  <th className="text-end">ACTIONS</th>
                </tr>
              </thead>

              <tbody>

                {users.length === 0 ? (

                  <tr>
                    <td
                      colSpan="5"
                      className="pl-empty-state"
                    >
                      <i className="bi bi-people"></i>

                      <strong>No user records</strong>

                      <span>
                        Create the first firm account using
                        the button above.
                      </span>
                    </td>
                  </tr>

                ) : (

                  users.map((user) => (

                    <tr key={user._id}>

                      {/* User */}
                      <td>

                        <div className="user-cell">

                          <div className="user-avatar">
                            {getInitial(user.name)}
                          </div>

                          <div>
                            <strong>
                              {user.name}
                            </strong>

                            <span>
                              Peter Lawrence
                            </span>
                          </div>

                        </div>

                      </td>


                      {/* Email */}
                      <td>
                        <span className="user-email">
                          {user.email}
                        </span>
                      </td>


                      {/* Role */}
                      <td>

                        <span className={getRoleClass(user.role)}>
                          {user.role === 'admin'
                            ? 'Administrator'
                            : user.role}
                        </span>

                      </td>


                      {/* Created */}
                      <td>

                        <span className="user-created">
                          {new Date(
                            user.createdAt
                          ).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>

                      </td>


                      {/* Actions */}
                      <td>

                        <div className="user-actions">

                          <button
                            className="user-action-button"
                            title="Edit user"
                            onClick={() =>
                              handleEditUser(user)
                            }
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          <button
                            className="user-action-button user-action-delete"
                            title="Delete user"
                            onClick={() =>
                              handleDeleteUser(user)
                            }
                          >
                            <i className="bi bi-trash3"></i>
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>
      )}

    </div>
  );
}

export default Users;