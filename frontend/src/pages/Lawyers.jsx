
import { useEffect, useState } from 'react';
import api from '../api/axios';

function Lawyers() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    userId: '',
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
    barRegistrationNo: '',
    experience: '',
    status: 'Active',
    joiningDate: ''
  });

  // Fetch lawyers
  const fetchLawyers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/lawyers');

      setLawyers(response.data);
    } catch (err) {
      console.error('Fetch lawyers error:', err);

      setError(
        err.response?.data?.message ||
        'Unable to load lawyers.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyers();
  }, []);

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      userId: '',
      fullName: '',
      email: '',
      phone: '',
      specialization: '',
      barRegistrationNo: '',
      experience: '',
      status: 'Active',
      joiningDate: ''
    });

    setEditingId(null);
  };

  // Open add form
  const handleAdd = () => {
    resetForm();
    setShowForm(true);
    setError('');
  };

  // Open edit form
  const handleEdit = (lawyer) => {
    setEditingId(lawyer._id);
    setShowForm(true);
    setError('');

    setFormData({
      userId: lawyer.userId?._id || '',
      fullName: lawyer.fullName || '',
      email: lawyer.email || '',
      phone: lawyer.phone || '',
      specialization: lawyer.specialization || '',
      barRegistrationNo: lawyer.barRegistrationNo || '',
      experience: lawyer.experience ?? '',
      status: lawyer.status || 'Active',
      joiningDate: lawyer.joiningDate
        ? lawyer.joiningDate.substring(0, 10)
        : ''
    });
  };

  // Submit form
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      if (editingId) {
        await api.put(`/lawyers/${editingId}`, {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          specialization: formData.specialization,
          barRegistrationNo: formData.barRegistrationNo,
          experience: Number(formData.experience) || 0,
          status: formData.status,
          joiningDate: formData.joiningDate || undefined
        });
      } else {
        if (!formData.userId) {
          setError('Please enter the Lawyer User ID.');
          setSaving(false);
          return;
        }

        await api.post('/lawyers', {
          userId: formData.userId,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          specialization: formData.specialization,
          barRegistrationNo: formData.barRegistrationNo,
          experience: Number(formData.experience) || 0,
          status: formData.status,
          joiningDate: formData.joiningDate || undefined
        });
      }

      await fetchLawyers();

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error('Save lawyer error:', err);

      setError(
        err.response?.data?.message ||
        'Unable to save lawyer.'
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete lawyer
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this lawyer profile?'
    );

    if (!confirmed) return;

    try {
      setError('');

      await api.delete(`/lawyers/${id}`);

      setLawyers((previous) =>
        previous.filter((lawyer) => lawyer._id !== id)
      );
    } catch (err) {
      console.error('Delete lawyer error:', err);

      setError(
        err.response?.data?.message ||
        'Unable to delete lawyer.'
      );
    }
  };

  const totalLawyers = lawyers.length;

  const activeLawyers = lawyers.filter(
    (lawyer) => lawyer.status === 'Active'
  ).length;

  const onLeaveLawyers = lawyers.filter(
    (lawyer) => lawyer.status === 'On Leave'
  ).length;

  const inactiveLawyers = lawyers.filter(
    (lawyer) => lawyer.status === 'Inactive'
  ).length;

  return (
    <div className="page-container">

      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="eyebrow">LEGAL WORKFORCE</p>

          <h1>Lawyer Management</h1>

          <p className="page-description">
            Manage lawyer profiles, professional details and
            availability within Peter Law Firm.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAdd}
        >
          <i className="bi bi-person-plus me-2"></i>
          Add Lawyer
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="summary-grid">

        <div className="summary-card">
          <div className="summary-label">Total Lawyers</div>
          <div className="summary-value">{totalLawyers}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Active</div>
          <div className="summary-value">{activeLawyers}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">On Leave</div>
          <div className="summary-value">{onLeaveLawyers}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Inactive</div>
          <div className="summary-value">{inactiveLawyers}</div>
        </div>

      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="content-card lawyer-form-card">

          <div className="card-header">
            <div>
              <p className="eyebrow">
                {editingId ? 'UPDATE RECORD' : 'NEW RECORD'}
              </p>

              <h2>
                {editingId
                  ? 'Edit Lawyer Profile'
                  : 'Add Lawyer Profile'}
              </h2>
            </div>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            {!editingId && (
              <div className="mb-3">
                <label className="form-label">
                  Lawyer User ID
                </label>

                <input
                  type="text"
                  name="userId"
                  className="form-control"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="Enter existing lawyer user ID"
                  required
                />

                <div className="form-text">
                  Use the ID of an existing User whose role is
                  <strong> lawyer</strong>.
                </div>
              </div>
            )}

            <div className="form-grid">

              <div>
                <label className="form-label">
                  Full Name
                </label>

                <input
                  type="text"
                  name="fullName"
                  className="form-control"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="lawyer@example.com"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+381..."
                />
              </div>

              <div>
                <label className="form-label">
                  Specialization
                </label>

                <input
                  type="text"
                  name="specialization"
                  className="form-control"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="Corporate Law"
                />
              </div>

              <div>
                <label className="form-label">
                  Bar Registration No.
                </label>

                <input
                  type="text"
                  name="barRegistrationNo"
                  className="form-control"
                  value={formData.barRegistrationNo}
                  onChange={handleChange}
                  placeholder="PLF-001"
                />
              </div>

              <div>
                <label className="form-label">
                  Experience (Years)
                </label>

                <input
                  type="number"
                  name="experience"
                  className="form-control"
                  min="0"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="5"
                />
              </div>

              <div>
                <label className="form-label">
                  Status
                </label>

                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  Joining Date
                </label>

                <input
                  type="date"
                  name="joiningDate"
                  className="form-control"
                  value={formData.joiningDate}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="form-actions">

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Lawyer'
                    : 'Create Lawyer'}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* Lawyer Table */}
      <div className="content-card">

        <div className="card-header">
          <div>
            <p className="eyebrow">DIRECTORY</p>
            <h2>Lawyers</h2>
          </div>

          <span className="record-count">
            {totalLawyers} records
          </span>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner-border" role="status"></div>
            <p>Loading lawyers...</p>
          </div>
        ) : lawyers.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-people"></i>
            <h3>No lawyers found</h3>
            <p>
              Add a lawyer profile to begin building the
              firm's legal workforce.
            </p>
          </div>
        ) : (
          <div className="table-responsive">

            <table className="table align-middle">

              <thead>
                <tr>
                  <th>Lawyer</th>
                  <th>Contact</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Joining Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>

                {lawyers.map((lawyer) => (

                  <tr key={lawyer._id}>

                    <td>
                      <div className="table-primary-text">
                        {lawyer.fullName}
                      </div>

                      <div className="table-secondary-text">
                        {lawyer.barRegistrationNo || 'No registration number'}
                      </div>
                    </td>

                    <td>
                      <div className="table-primary-text">
                        {lawyer.email}
                      </div>

                      <div className="table-secondary-text">
                        {lawyer.phone || 'No phone'}
                      </div>
                    </td>

                    <td>
                      {lawyer.specialization || '—'}
                    </td>

                    <td>
                      {lawyer.experience} years
                    </td>

                    <td>

                      <span
                        className={`status-badge ${
                          lawyer.status === 'Active'
                            ? 'status-active'
                            : lawyer.status === 'On Leave'
                              ? 'status-warning'
                              : 'status-inactive'
                        }`}
                      >
                        {lawyer.status}
                      </span>

                    </td>

                    <td>
                      {lawyer.joiningDate
                        ? new Date(
                            lawyer.joiningDate
                          ).toLocaleDateString()
                        : '—'}
                    </td>

                    <td className="text-end">

                      <div className="table-actions">

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleEdit(lawyer)}
                          title="Edit lawyer"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            handleDelete(lawyer._id)
                          }
                          title="Delete lawyer"
                        >
                          <i className="bi bi-trash"></i>
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default Lawyers;
