import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const initialForm = {
  jobId: '',
  jobTitle: '',
  department: 'Operations',
  employmentType: 'Full-Time',
  location: 'Belgrade, Serbia',
  description: '',
  requirements: '',
  salaryRange: '',
  openingDate: '',
  closingDate: '',
  status: 'Draft',
  vacancies: 1,
  notes: ''
};

function Career() {
  const [careers, setCareers] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCareers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/careers');

      setCareers(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load career records.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCareers();
  }, []);

  const openJobs = useMemo(
    () =>
      careers.filter(
        (career) => career.status === 'Open'
      ).length,
    [careers]
  );

  const closedJobs = useMemo(
    () =>
      careers.filter(
        (career) => career.status === 'Closed'
      ).length,
    [careers]
  );

  const totalVacancies = useMemo(
    () =>
      careers
        .filter(
          (career) => career.status === 'Open'
        )
        .reduce(
          (sum, career) =>
            sum + Number(career.vacancies || 0),
          0
        ),
    [careers]
  );

  const filteredCareers = useMemo(() => {
    return careers.filter((career) => {
      const search = searchTerm
        .toLowerCase()
        .trim();

      const matchesSearch =
        !search ||
        career.jobId
          ?.toLowerCase()
          .includes(search) ||
        career.jobTitle
          ?.toLowerCase()
          .includes(search) ||
        career.department
          ?.toLowerCase()
          .includes(search) ||
        career.location
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === 'All' ||
        career.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [careers, searchTerm, statusFilter]);

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
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

      if (!form.jobId.trim()) {
        setError('Job ID is required.');
        return;
      }

      if (!form.jobTitle.trim()) {
        setError('Job title is required.');
        return;
      }

      if (!form.openingDate) {
        setError('Opening date is required.');
        return;
      }

      if (
        !form.vacancies ||
        Number(form.vacancies) < 1
      ) {
        setError(
          'At least one vacancy is required.'
        );
        return;
      }

      if (
        form.closingDate &&
        form.closingDate < form.openingDate
      ) {
        setError(
          'Closing date cannot be before the opening date.'
        );
        return;
      }

      const payload = {
        jobId: form.jobId.trim(),
        jobTitle: form.jobTitle.trim(),
        department: form.department,
        employmentType: form.employmentType,
        location: form.location.trim(),
        description: form.description.trim(),
        requirements: form.requirements.trim(),
        salaryRange: form.salaryRange.trim(),
        openingDate: form.openingDate,
        closingDate:
          form.closingDate || null,
        status: form.status,
        vacancies: Number(form.vacancies),
        notes: form.notes.trim()
      };

      const wasEditing = Boolean(editingId);

      if (editingId) {
        await api.put(
          `/careers/${editingId}`,
          payload
        );

        setSuccess(
          'Job opening updated successfully.'
        );
      } else {
        await api.post(
          '/careers',
          payload
        );

        setSuccess(
          'Job opening created successfully.'
        );
      }

      resetForm();

      setSuccess(
        wasEditing
          ? 'Job opening updated successfully.'
          : 'Job opening created successfully.'
      );

      await loadCareers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to save job opening.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (career) => {
    setEditingId(career._id);

    setForm({
      jobId: career.jobId || '',
      jobTitle: career.jobTitle || '',
      department:
        career.department || 'Operations',
      employmentType:
        career.employmentType || 'Full-Time',
      location:
        career.location || 'Belgrade, Serbia',
      description:
        career.description || '',
      requirements:
        career.requirements || '',
      salaryRange:
        career.salaryRange || '',
      openingDate: career.openingDate
        ? new Date(career.openingDate)
            .toISOString()
            .split('T')[0]
        : '',
      closingDate: career.closingDate
        ? new Date(career.closingDate)
            .toISOString()
            .split('T')[0]
        : '',
      status:
        career.status || 'Draft',
      vacancies:
        career.vacancies || 1,
      notes: career.notes || ''
    });

    setError('');
    setSuccess('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDelete = async (careerId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this job opening?'
    );

    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');

      await api.delete(
        `/careers/${careerId}`
      );

      if (editingId === careerId) {
        resetForm();
      }

      setSuccess(
        'Job opening deleted successfully.'
      );

      await loadCareers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to delete job opening.'
      );
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Open':
        return 'status-active';

      case 'On Hold':
        return 'status-warning';

      case 'Closed':
        return 'status-inactive';

      case 'Draft':
      default:
        return 'status-neutral';
    }
  };

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <p className="eyebrow">
            Administration / Recruitment
          </p>

          <h1>Career Portal</h1>

          <p className="page-description">
            Manage job openings, vacancies,
            recruitment requirements and career
            opportunities at Peter Law Firm.
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
            Total Jobs
          </div>

          <div className="summary-value">
            {careers.length}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Open Positions
          </div>

          <div className="summary-value">
            {openJobs}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Total Vacancies
          </div>

          <div className="summary-value">
            {totalVacancies}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Closed Jobs
          </div>

          <div className="summary-value">
            {closedJobs}
          </div>
        </div>

      </div>

      <div className="card lawyer-form-card">

        <div className="card-header">
          <div>
            <h2>
              {editingId
                ? 'Edit Job Opening'
                : 'Create Job Opening'}
            </h2>

            <p>
              {editingId
                ? 'Update the selected career opportunity.'
                : 'Publish a new employment opportunity for the firm.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <div>
              <label className="form-label">
                Job ID
              </label>

              <input
                type="text"
                name="jobId"
                className="form-control"
                placeholder="JOB-2026-001"
                value={form.jobId}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">
                Job Title
              </label>

              <input
                type="text"
                name="jobTitle"
                className="form-control"
                placeholder="Legal Assistant"
                value={form.jobTitle}
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
                Employment Type
              </label>

              <select
                name="employmentType"
                className="form-select"
                value={form.employmentType}
                onChange={handleChange}
              >
                <option value="Full-Time">
                  Full-Time
                </option>

                <option value="Part-Time">
                  Part-Time
                </option>

                <option value="Contract">
                  Contract
                </option>

                <option value="Intern">
                  Intern
                </option>
              </select>
            </div>

            <div>
              <label className="form-label">
                Location
              </label>

              <input
                type="text"
                name="location"
                className="form-control"
                placeholder="Belgrade, Serbia"
                value={form.location}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">
                Salary Range
              </label>

              <input
                type="text"
                name="salaryRange"
                className="form-control"
                placeholder="€1,200 - €1,600"
                value={form.salaryRange}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">
                Opening Date
              </label>

              <input
                type="date"
                name="openingDate"
                className="form-control"
                value={form.openingDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">
                Closing Date
              </label>

              <input
                type="date"
                name="closingDate"
                className="form-control"
                value={form.closingDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">
                Vacancies
              </label>

              <input
                type="number"
                name="vacancies"
                className="form-control"
                min="1"
                step="1"
                value={form.vacancies}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">
                Job Status
              </label>

              <select
                name="status"
                className="form-select"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Draft">
                  Draft
                </option>

                <option value="Open">
                  Open
                </option>

                <option value="On Hold">
                  On Hold
                </option>

                <option value="Closed">
                  Closed
                </option>
              </select>
            </div>

            <div className="form-grid-full">

              <label className="form-label">
                Job Description
              </label>

              <textarea
                name="description"
                className="form-control"
                rows="3"
                placeholder="Describe the role, responsibilities and scope of work."
                value={form.description}
                onChange={handleChange}
              />

            </div>

            <div className="form-grid-full">

              <label className="form-label">
                Requirements
              </label>

              <textarea
                name="requirements"
                className="form-control"
                rows="3"
                placeholder="Education, experience, skills and other requirements."
                value={form.requirements}
                onChange={handleChange}
              />

            </div>

            <div className="form-grid-full">

              <label className="form-label">
                Internal Notes
              </label>

              <textarea
                name="notes"
                className="form-control"
                rows="3"
                placeholder="Internal recruitment notes."
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
                  <i className="bi bi-briefcase me-2"></i>

                  {editingId
                    ? 'Update Job'
                    : 'Create Job'}
                </>
              )}
            </button>

          </div>

        </form>

      </div>

      <div className="card">

        <div className="card-header">

          <div>
            <h2>Career Opportunities</h2>

            <p>
              {filteredCareers.length} of{' '}
              {careers.length} job
              {careers.length !== 1
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
                Search Jobs
              </label>

              <div className="input-group">

                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by job ID, title, department or location"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            <div className="col-md-4">

              <label className="form-label">
                Job Status
              </label>

              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >
                <option value="All">
                  All Statuses
                </option>

                <option value="Draft">
                  Draft
                </option>

                <option value="Open">
                  Open
                </option>

                <option value="On Hold">
                  On Hold
                </option>

                <option value="Closed">
                  Closed
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
              Loading career opportunities...
            </p>

          </div>
        ) : filteredCareers.length === 0 ? (
          <div className="empty-state">

            <i className="bi bi-briefcase"></i>

            <h3>
              {careers.length === 0
                ? 'No job openings'
                : 'No matching jobs'}
            </h3>

            <p>
              {careers.length === 0
                ? 'Job openings created from the form will appear here.'
                : 'Try changing your search or status filter.'}
            </p>

          </div>
        ) : (
          <div className="table-responsive">

            <table className="table">

              <thead>
                <tr>
                  <th>Job</th>
                  <th>Department</th>
                  <th>Employment</th>
                  <th>Location</th>
                  <th>Opening</th>
                  <th>Vacancies</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredCareers.map(
                  (career) => (
                    <tr key={career._id}>

                      <td>

                        <div className="table-primary-text">
                          {career.jobTitle}
                        </div>

                        <div className="table-secondary-text">
                          {career.jobId}
                        </div>

                        {career.salaryRange && (
                          <div className="table-secondary-text">
                            {career.salaryRange}
                          </div>
                        )}

                      </td>

                      <td>
                        {career.department}
                      </td>

                      <td>
                        {career.employmentType}
                      </td>

                      <td>
                        {career.location}
                      </td>

                      <td>
                        {formatDate(
                          career.openingDate
                        )}
                      </td>

                      <td>
                        <strong>
                          {career.vacancies}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            career.status
                          )}`}
                        >
                          {career.status}
                        </span>
                      </td>

                      <td>

                        <div className="table-actions">

                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            title="Edit job"
                            onClick={() =>
                              handleEdit(
                                career
                              )
                            }
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            title="Delete job"
                            onClick={() =>
                              handleDelete(
                                career._id
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

export default Career;