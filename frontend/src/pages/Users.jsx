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

  // Fetch users
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

  // Create / Update user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');

      // UPDATE USER
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
      }

      // CREATE USER
      else {
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

      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setRole('client');

      // Exit edit mode
      setEditingUserId(null);

      // Close form
      setShowForm(false);

      // Refresh users
      fetchUsers();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to save user'
      );
    }
  };

  // Delete user
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

      // Remove deleted user from table
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

  // Open form for adding a new user
  const handleAddUser = () => {
    setEditingUserId(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('client');
    setError('');
    setShowForm(true);
  };

  // Open form for editing existing user
  const handleEditUser = (user) => {
    setEditingUserId(user._id);
    setName(user.name);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setError('');
    setShowForm(true);
  };

  // Close form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUserId(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('client');
    setError('');
  };

  return (
    <div>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            User Management
          </h2>

          <p className="text-muted mb-0">
            Manage users registered in the legal ERP system.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleAddUser}
        >
          <i className="bi bi-person-plus me-2"></i>
          Add User
        </button>

      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Add / Edit User Form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body">

            <div className="d-flex justify-content-between align-items-center mb-3">

              <h5 className="fw-bold mb-0">
                {editingUserId
                  ? 'Edit User'
                  : 'Add New User'}
              </h5>

              <button
                type="button"
                className="btn-close"
                onClick={handleCloseForm}
              ></button>

            </div>

            <form onSubmit={handleCreateUser}>

              <div className="row">

                {/* Name */}
                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />

                </div>

                {/* Email */}
                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Email
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                </div>

                {/* Password */}
                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Password
                  </label>

                  <input
                    type="password"
                    className="form-control"
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
                    <small className="text-muted">
                      Leave blank if you don't want to change the password.
                    </small>
                  )}

                </div>

                {/* Role */}
                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Role
                  </label>

                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  >
                    <option value="client">
                      Client
                    </option>

                    <option value="lawyer">
                      Lawyer
                    </option>

                    <option value="employee">
                      Employee
                    </option>

                    <option value="admin">
                      Admin
                    </option>
                  </select>

                </div>

              </div>

              <div className="d-flex gap-2">

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <i
                    className={`bi ${
                      editingUserId
                        ? 'bi-pencil'
                        : 'bi-person-plus'
                    } me-2`}
                  ></i>

                  {editingUserId
                    ? 'Update User'
                    : 'Create User'}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseForm}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">

          <div
            className="spinner-border text-primary"
            role="status"
          ></div>

          <p className="text-muted mt-2">
            Loading users...
          </p>

        </div>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <div className="card border-0 shadow-sm">

          <div className="card-body">

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-4 text-muted"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (

                    users.map((user) => (
                      <tr key={user._id}>

                        <td>
                          <div className="fw-semibold">
                            {user.name}
                          </div>
                        </td>

                        <td>
                          {user.email}
                        </td>

                        <td>
                          <span className="badge bg-secondary text-capitalize">
                            {user.role}
                          </span>
                        </td>

                        <td>
                          {new Date(
                            user.createdAt
                          ).toLocaleDateString()}
                        </td>

                        <td>

                          {/* Edit */}
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            title="Edit User"
                            onClick={() =>
                              handleEditUser(user)
                            }
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          {/* Delete */}
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete User"
                            onClick={() =>
                              handleDeleteUser(user)
                            }
                          >
                            <i className="bi bi-trash"></i>
                          </button>

                        </td>

                      </tr>
                    ))

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Users;