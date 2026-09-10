import { useEffect, useState } from 'react';
import api from '../api/axios';

function Cases() {
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [lawyers, setLawyers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingCase, setEditingCase] = useState(null);

  const [formData, setFormData] = useState({
    caseNumber: '',
    title: '',
    clientId: '',
    lawyerId: '',
    category: 'Other',
    description: '',
    court: '',
    status: 'New',
    filingDate: '',
    nextHearingDate: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [casesResponse, clientsResponse, lawyersResponse] =
        await Promise.all([
          api.get('/cases'),
          api.get('/clients'),
          api.get('/lawyers')
        ]);

      setCases(casesResponse.data);
      setClients(clientsResponse.data);
      setLawyers(lawyersResponse.data);
    } catch (err) {
      console.error('Fetch Cases Error:', err);

      setError(
        err.response?.data?.message ||
        'Failed to load case management data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdd = () => {
    setEditingCase(null);

    setFormData({
      caseNumber: '',
      title: '',
      clientId: '',
      lawyerId: '',
      category: 'Other',
      description: '',
      court: '',
      status: 'New',
      filingDate: '',
      nextHearingDate: '',
      notes: ''
    });

    setShowForm(true);
    setError('');
  };

  const handleEdit = (legalCase) => {
    setEditingCase(legalCase);

    setFormData({
      caseNumber: legalCase.caseNumber || '',
      title: legalCase.title || '',
      clientId: legalCase.clientId?._id || '',
      lawyerId: legalCase.lawyerId?._id || '',
      category: legalCase.category || 'Other',
      description: legalCase.description || '',
      court: legalCase.court || '',
      status: legalCase.status || 'New',
      filingDate: legalCase.filingDate
        ? legalCase.filingDate.split('T')[0]
        : '',
      nextHearingDate: legalCase.nextHearingDate
        ? legalCase.nextHearingDate.split('T')[0]
        : '',
      notes: legalCase.notes || ''
    });

    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');

      if (editingCase) {
        await api.put(`/cases/${editingCase._id}`, formData);
      } else {
        await api.post('/cases', formData);
      }

      setShowForm(false);
      setEditingCase(null);

      await fetchData();
    } catch (err) {
      console.error('Save Case Error:', err);

      setError(
        err.response?.data?.message ||
        'Failed to save case.'
      );
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this case?'
    );

    if (!confirmed) return;

    try {
      setError('');

      await api.delete(`/cases/${id}`);

      await fetchData();
    } catch (err) {
      console.error('Delete Case Error:', err);

      setError(
        err.response?.data?.message ||
        'Failed to delete case.'
      );
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Active':
        return 'status-active';

      case 'Pending':
        return 'status-warning';

      case 'Closed':
      case 'Lost':
        return 'status-inactive';

      case 'Won':
        return 'status-active';

      default:
        return 'status-neutral';
    }
  };

  const totalCases = cases.length;

  const activeCases = cases.filter(
    (item) => item.status === 'Active'
  ).length;

  const pendingCases = cases.filter(
    (item) => item.status === 'Pending'
  ).length;

  const upcomingHearings = cases.filter(
    (item) => item.nextHearingDate
  ).length;

  if (loading) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <i className="bi bi-hourglass-split"></i>
          <h3>Loading case register</h3>
          <p>Please wait while case records are being loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <p className="eyebrow">LEGAL MATTERS</p>

          <h1>Case Management</h1>

          <p className="page-description">
            Manage legal matters, client representation,
            assigned lawyers and upcoming court proceedings.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAdd}
        >
          <i className="bi bi-folder-plus me-2"></i>
          New Case
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="summary-grid">

        <div className="summary-card">
          <div className="summary-label">
            Total Cases
          </div>

          <div className="summary-value">
            {totalCases}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Active
          </div>

          <div className="summary-value">
            {activeCases}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Pending
          </div>

          <div className="summary-value">
            {pendingCases}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Hearings Scheduled
          </div>

          <div className="summary-value">
            {upcomingHearings}
          </div>
        </div>

      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="content-card lawyer-form-card">

          <div className="card-header">
            <div>
              <p className="eyebrow">
                {editingCase ? 'CASE UPDATE' : 'CASE REGISTRATION'}
              </p>

              <h2>
                {editingCase ? 'Edit Case' : 'Create New Case'}
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div>
                <label className="form-label">
                  Case Number
                </label>

                <input
                  type="text"
                  name="caseNumber"
                  className="form-control"
                  value={formData.caseNumber}
                  onChange={handleChange}
                  placeholder="PLF-2026-002"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  Case Title
                </label>

                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter case title"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  Client
                </label>

                <select
                  name="clientId"
                  className="form-select"
                  value={formData.clientId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select client
                  </option>

                  {clients.map((client) => (
                    <option
                      key={client._id}
                      value={client._id}
                    >
                      {client.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">
                  Assigned Lawyer
                </label>

                <select
                  name="lawyerId"
                  className="form-select"
                  value={formData.lawyerId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select lawyer
                  </option>

                  {lawyers.map((lawyer) => (
                    <option
                      key={lawyer._id}
                      value={lawyer._id}
                    >
                      {lawyer.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">
                  Category
                </label>

                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Corporate">Corporate</option>
                  <option value="Criminal">Criminal</option>
                  <option value="Civil">Civil</option>
                  <option value="Family">Family</option>
                  <option value="Property">Property</option>
                  <option value="Employment">Employment</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Other">Other</option>
                </select>
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
                  <option value="New">New</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Closed">Closed</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  Filing Date
                </label>

                <input
                  type="date"
                  name="filingDate"
                  className="form-control"
                  value={formData.filingDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="form-label">
                  Next Hearing
                </label>

                <input
                  type="date"
                  name="nextHearingDate"
                  className="form-control"
                  value={formData.nextHearingDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-grid-full">
                <label className="form-label">
                  Court
                </label>

                <input
                  type="text"
                  name="court"
                  className="form-control"
                  value={formData.court}
                  onChange={handleChange}
                  placeholder="Enter court name"
                />
              </div>

              <div className="form-grid-full">
                <label className="form-label">
                  Description
                </label>

                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the legal matter"
                ></textarea>
              </div>

              <div className="form-grid-full">
                <label className="form-label">
                  Legal Notes
                </label>

                <textarea
                  name="notes"
                  className="form-control"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Internal case notes"
                ></textarea>
              </div>

            </div>

            <div className="form-actions">

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingCase(null);
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
              >
                <i className="bi bi-check2 me-2"></i>

                {editingCase
                  ? 'Update Case'
                  : 'Create Case'}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* CASE REGISTER */}
      <div className="content-card">

        <div className="card-header">

          <div>
            <p className="eyebrow">CASE REGISTER</p>

            <h2>Legal Cases</h2>
          </div>

          <span className="record-count">
            {totalCases} records
          </span>

        </div>

        {cases.length === 0 ? (

          <div className="empty-state">
            <i className="bi bi-folder2-open"></i>

            <h3>No cases recorded</h3>

            <p>
              Create the first legal case to begin the
              case register.
            </p>
          </div>

        ) : (

          <div className="table-responsive">

            <table className="table">

              <thead>
                <tr>
                  <th>Case</th>
                  <th>Client</th>
                  <th>Lawyer</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Next Hearing</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>

                {cases.map((legalCase) => (

                  <tr key={legalCase._id}>

                    <td>
                      <div className="table-primary-text">
                        {legalCase.caseNumber}
                      </div>

                      <div className="table-secondary-text">
                        {legalCase.title}
                      </div>
                    </td>

                    <td>
                      <div className="table-primary-text">
                        {legalCase.clientId?.fullName || '—'}
                      </div>

                      <div className="table-secondary-text">
                        {legalCase.clientId?.email || ''}
                      </div>
                    </td>

                    <td>
                      <div className="table-primary-text">
                        {legalCase.lawyerId?.fullName || '—'}
                      </div>

                      <div className="table-secondary-text">
                        {legalCase.lawyerId?.specialization || ''}
                      </div>
                    </td>

                    <td>
                      {legalCase.category}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          legalCase.status
                        )}`}
                      >
                        {legalCase.status}
                      </span>
                    </td>

                    <td>
                      {legalCase.nextHearingDate
                        ? new Date(
                            legalCase.nextHearingDate
                          ).toLocaleDateString()
                        : '—'}
                    </td>

                    <td>

                      <div className="table-actions">

                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          title="Edit case"
                          onClick={() =>
                            handleEdit(legalCase)
                          }
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          title="Delete case"
                          onClick={() =>
                            handleDelete(legalCase._id)
                          }
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

export default Cases;