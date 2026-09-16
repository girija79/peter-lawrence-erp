import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const initialForm = {
  candidateId: '',
  fullName: '',
  email: '',
  phone: '',
  positionApplied: '',
  department: 'Operations',
  applicationDate: '',
  experience: '',
  qualification: '',
  resumeUrl: '',
  interviewDate: '',
  interviewStatus: 'Not Scheduled',
  status: 'Applied',
  notes: ''
};

function HR() {
  const [candidates, setCandidates] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/candidates');

      setCandidates(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load candidate records.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const shortlistedCandidates = useMemo(
    () =>
      candidates.filter(
        (candidate) => candidate.status === 'Shortlisted'
      ).length,
    [candidates]
  );

  const interviewCandidates = useMemo(
    () =>
      candidates.filter(
        (candidate) =>
          candidate.status === 'Interview'
      ).length,
    [candidates]
  );

  const hiredCandidates = useMemo(
    () =>
      candidates.filter(
        (candidate) => candidate.status === 'Hired'
      ).length,
    [candidates]
  );

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        candidate.fullName
          ?.toLowerCase()
          .includes(search) ||
        candidate.email
          ?.toLowerCase()
          .includes(search) ||
        candidate.candidateId
          ?.toLowerCase()
          .includes(search) ||
        candidate.positionApplied
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === 'All' ||
        candidate.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [candidates, searchTerm, statusFilter]);

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (!form.candidateId.trim()) {
        setError('Candidate ID is required.');
        return;
      }

      if (!form.fullName.trim()) {
        setError('Full name is required.');
        return;
      }

      if (!form.email.trim()) {
        setError('Email is required.');
        return;
      }

      if (!form.positionApplied.trim()) {
        setError('Position applied is required.');
        return;
      }

      if (!form.applicationDate) {
        setError('Application date is required.');
        return;
      }

      if (
        form.experience &&
        Number(form.experience) < 0
      ) {
        setError('Experience cannot be negative.');
        return;
      }

      const payload = {
        candidateId: form.candidateId.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        positionApplied:
          form.positionApplied.trim(),
        department: form.department,
        applicationDate: form.applicationDate,
        experience: Number(form.experience || 0),
        qualification:
          form.qualification.trim(),
        resumeUrl: form.resumeUrl.trim(),
        interviewDate:
          form.interviewDate || null,
        interviewStatus:
          form.interviewStatus,
        status: form.status,
        notes: form.notes.trim()
      };

      const wasEditing = Boolean(editingId);

      if (editingId) {
        await api.put(
          `/candidates/${editingId}`,
          payload
        );

        setSuccess(
          'Candidate updated successfully.'
        );
      } else {
        await api.post('/candidates', payload);

        setSuccess(
          'Candidate added successfully.'
        );
      }

      resetForm();
      setSuccess(
        wasEditing
          ? 'Candidate updated successfully.'
          : 'Candidate added successfully.'
      );

      await loadCandidates();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to save candidate.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (candidate) => {
    setEditingId(candidate._id);

    setForm({
      candidateId: candidate.candidateId || '',
      fullName: candidate.fullName || '',
      email: candidate.email || '',
      phone: candidate.phone || '',
      positionApplied:
        candidate.positionApplied || '',
      department:
        candidate.department || 'Operations',
      applicationDate: candidate.applicationDate
        ? new Date(candidate.applicationDate)
            .toISOString()
            .split('T')[0]
        : '',
      experience:
        candidate.experience ?? '',
      qualification:
        candidate.qualification || '',
      resumeUrl:
        candidate.resumeUrl || '',
      interviewDate:
        candidate.interviewDate
          ? new Date(candidate.interviewDate)
              .toISOString()
              .split('T')[0]
          : '',
      interviewStatus:
        candidate.interviewStatus ||
        'Not Scheduled',
      status:
        candidate.status || 'Applied',
      notes: candidate.notes || ''
    });

    setError('');
    setSuccess('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDelete = async (candidateId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this candidate record?'
    );

    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');

      await api.delete(
        `/candidates/${candidateId}`
      );

      if (editingId === candidateId) {
        resetForm();
      }

      setSuccess(
        'Candidate deleted successfully.'
      );

      await loadCandidates();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to delete candidate.'
      );
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Applied':
        return 'status-neutral';

      case 'Shortlisted':
        return 'status-info';

      case 'Interview':
        return 'status-warning';

      case 'Selected':
      case 'Hired':
        return 'status-active';

      case 'Rejected':
        return 'status-inactive';

      default:
        return 'status-neutral';
    }
  };

  const getInterviewStatusClass = (
    interviewStatus
  ) => {
    switch (interviewStatus) {
      case 'Scheduled':
        return 'status-info';

      case 'Completed':
        return 'status-active';

      case 'Cancelled':
        return 'status-inactive';

      default:
        return 'status-neutral';
    }
  };

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <p className="eyebrow">
            Administration / Human Resources
          </p>

          <h1>HR Management</h1>

          <p className="page-description">
            Manage candidate records, recruitment
            progress, interviews and hiring decisions.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4">
          <i className="bi bi-check-circle me-2"></i>
          {success}
        </div>
      )}

      <div className="summary-grid">

        <div className="summary-card">
          <div className="summary-label">
            Total Candidates
          </div>

          <div className="summary-value">
            {candidates.length}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Shortlisted
          </div>

          <div className="summary-value">
            {shortlistedCandidates}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Interviews
          </div>

          <div className="summary-value">
            {interviewCandidates}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Hired
          </div>

          <div className="summary-value">
            {hiredCandidates}
          </div>
        </div>

      </div>

      <div className="card lawyer-form-card">

        <div className="card-header">
          <div>
            <h2>
              {editingId
                ? 'Edit Candidate'
                : 'Add Candidate'}
            </h2>

            <p>
              {editingId
                ? 'Update recruitment and interview information.'
                : 'Create a new candidate recruitment record.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <div>
              <label className="form-label">
                Candidate ID
              </label>

              <input
                type="text"
                name="candidateId"
                className="form-control"
                placeholder="CAN-2026-001"
                value={form.candidateId}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                className="form-control"
                placeholder="Candidate full name"
                value={form.fullName}
                onChange={handleChange}
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
                placeholder="candidate@email.com"
                value={form.email}
                onChange={handleChange}
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
                placeholder="+381 60 000 0000"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">
                Position Applied
              </label>

              <input
                type="text"
                name="positionApplied"
                className="form-control"
                placeholder="Legal Assistant"
                value={form.positionApplied}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">
                Department
              </label>

              <select
                name="department"
                className="form-select"
                value={form.department}
                onChange={handleChange}
              >
                <option value="Administration">
                  Administration
                </option>

                <option value="Finance">
                  Finance
                </option>

                <option value="Human Resources">
                  Human Resources
                </option>

                <option value="Legal Support">
                  Legal Support
                </option>

                <option value="IT">
                  IT
                </option>

                <option value="Operations">
                  Operations
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label className="form-label">
                Application Date
              </label>

              <input
                type="date"
                name="applicationDate"
                className="form-control"
                value={form.applicationDate}
                onChange={handleChange}
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
                step="0.5"
                placeholder="2"
                value={form.experience}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">
                Qualification
              </label>

              <input
                type="text"
                name="qualification"
                className="form-control"
                placeholder="LLB / MBA / B.Com"
                value={form.qualification}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">
                Resume URL
              </label>

              <input
                type="url"
                name="resumeUrl"
                className="form-control"
                placeholder="https://..."
                value={form.resumeUrl}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">
                Interview Date
              </label>

              <input
                type="date"
                name="interviewDate"
                className="form-control"
                value={form.interviewDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">
                Interview Status
              </label>

              <select
                name="interviewStatus"
                className="form-select"
                value={form.interviewStatus}
                onChange={handleChange}
              >
                <option value="Not Scheduled">
                  Not Scheduled
                </option>

                <option value="Scheduled">
                  Scheduled
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>
              </select>
            </div>

            <div>
              <label className="form-label">
                Recruitment Status
              </label>

              <select
                name="status"
                className="form-select"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Applied">
                  Applied
                </option>

                <option value="Shortlisted">
                  Shortlisted
                </option>

                <option value="Interview">
                  Interview
                </option>

                <option value="Selected">
                  Selected
                </option>

                <option value="Rejected">
                  Rejected
                </option>

                <option value="Hired">
                  Hired
                </option>
              </select>
            </div>

            <div className="form-grid-full">

              <label className="form-label">
                Notes
              </label>

              <textarea
                name="notes"
                className="form-control"
                rows="3"
                placeholder="Recruitment notes, interview observations or hiring remarks"
                value={form.notes}
                onChange={handleChange}
              />

            </div>

          </div>

          <div className="form-actions">

            {editingId && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-2"></i>

                  {editingId
                    ? 'Update Candidate'
                    : 'Add Candidate'}
                </>
              )}
            </button>

          </div>

        </form>

      </div>

      <div className="card">

        <div className="card-header">

          <div>
            <h2>Candidate Register</h2>

            <p>
              {filteredCandidates.length} of{' '}
              {candidates.length} candidate
              {candidates.length !== 1
                ? 's'
                : ''}{' '}
              displayed
            </p>
          </div>

        </div>

        <div className="p-3 border-bottom">

          <div className="row g-3">

            <div className="col-md-8">

              <label className="form-label">
                Search Candidates
              </label>

              <div className="input-group">

                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, email, candidate ID or position"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />

              </div>

            </div>

            <div className="col-md-4">

              <label className="form-label">
                Recruitment Status
              </label>

              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="All">
                  All Statuses
                </option>

                <option value="Applied">
                  Applied
                </option>

                <option value="Shortlisted">
                  Shortlisted
                </option>

                <option value="Interview">
                  Interview
                </option>

                <option value="Selected">
                  Selected
                </option>

                <option value="Rejected">
                  Rejected
                </option>

                <option value="Hired">
                  Hired
                </option>
              </select>

            </div>

          </div>

        </div>

        {loading ? (
          <div className="empty-state">

            <div
              className="spinner-border"
              role="status"
            ></div>

            <p className="mt-3">
              Loading candidate records...
            </p>

          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="empty-state">

            <i className="bi bi-person-lines-fill"></i>

            <h3>
              {candidates.length === 0
                ? 'No candidate records'
                : 'No matching candidates'}
            </h3>

            <p>
              {candidates.length === 0
                ? 'Candidate records created from the form will appear here.'
                : 'Try changing your search or recruitment status filter.'}
            </p>

          </div>
        ) : (
          <div className="table-responsive">

            <table className="table">

              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Application</th>
                  <th>Interview</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredCandidates.map(
                  (candidate) => (
                    <tr key={candidate._id}>

                      <td>

                        <div className="table-primary-text">
                          {candidate.fullName}
                        </div>

                        <div className="table-secondary-text">
                          {candidate.candidateId}
                        </div>

                        <div className="table-secondary-text">
                          {candidate.email}
                        </div>

                        {candidate.phone && (
                          <div className="table-secondary-text">
                            {candidate.phone}
                          </div>
                        )}

                      </td>

                      <td>
                        {candidate.positionApplied}
                      </td>

                      <td>
                        {candidate.department}
                      </td>

                      <td>
                        {formatDate(
                          candidate.applicationDate
                        )}
                      </td>

                      <td>

                        <div>
                          {formatDate(
                            candidate.interviewDate
                          )}
                        </div>

                        <span
                          className={`status-badge ${getInterviewStatusClass(
                            candidate.interviewStatus
                          )}`}
                        >
                          {candidate.interviewStatus}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`status-badge ${getStatusClass(
                            candidate.status
                          )}`}
                        >
                          {candidate.status}
                        </span>

                      </td>

                      <td>

                        <div className="table-actions">

                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            title="Edit candidate"
                            onClick={() =>
                              handleEdit(candidate)
                            }
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            title="Delete candidate"
                            onClick={() =>
                              handleDelete(
                                candidate._id
                              )
                            }
                          >
                            <i className="bi bi-trash"></i>
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default HR;