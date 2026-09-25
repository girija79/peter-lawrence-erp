import { useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Performance = () => {
  const { user } = useContext(AuthContext);

  const isAdmin = user?.role === 'admin';
  const isHR = user?.role === 'hr';
  const isEmployee = user?.role === 'employee';

  const canManagePerformance = isAdmin || isHR;

  const [performances, setPerformances] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [formData, setFormData] = useState({
    employeeId: '',
    reviewType: 'Annual Review',
    reviewPeriod: '',
    reviewDate: '',
    dueDate: '',
    goals: '',
    achievements: '',
    strengths: '',
    areasForImprovement: '',
    developmentPlan: '',
    rating: 5,
    managerComments: '',
    employeeComments: '',
    status: 'Draft'
  });

  // ==========================================
  // FETCH PERFORMANCE REVIEWS
  // ==========================================

  const fetchPerformances = async () => {
    try {
      setLoading(true);

      const endpoint = isEmployee
        ? '/performances/me'
        : '/performances';

      const res = await api.get(endpoint);

      setPerformances(res.data || []);

    } catch (error) {
      console.error(
        'Failed to fetch performance reviews:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH EMPLOYEES
  // ==========================================

  const fetchEmployees = async () => {
    if (!canManagePerformance) return;

    try {
      const res = await api.get('/employees');

      setEmployees(res.data || []);

    } catch (error) {
      console.error(
        'Failed to fetch employees:',
        error
      );
    }
  };

  useEffect(() => {
    if (user) {
      fetchPerformances();
      fetchEmployees();
    }
  }, [user]);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'rating'
          ? Number(value)
          : value
    }));
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setFormData({
      employeeId: '',
      reviewType: 'Annual Review',
      reviewPeriod: '',
      reviewDate: '',
      dueDate: '',
      goals: '',
      achievements: '',
      strengths: '',
      areasForImprovement: '',
      developmentPlan: '',
      rating: 5,
      managerComments: '',
      employeeComments: '',
      status: 'Draft'
    });

    setEditingId(null);
    setShowForm(false);
  };

  // ==========================================
  // SUBMIT FORM
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.employeeId) {
        alert('Please select an employee.');
        return;
      }

      if (editingId) {
        await api.put(
          `/performances/${editingId}`,
          formData
        );
      } else {
        await api.post(
          '/performances',
          formData
        );
      }

      alert(
        editingId
          ? 'Performance review updated successfully.'
          : 'Performance review created successfully.'
      );

      resetForm();

      await fetchPerformances();

    } catch (error) {
      console.error(
        'Performance save error:',
        error
      );

      alert(
        error.response?.data?.message ||
        'Failed to save performance review.'
      );
    }
  };

  // ==========================================
  // EDIT PERFORMANCE
  // ==========================================

  const handleEdit = (performance) => {
    setFormData({
      employeeId:
        performance.employeeId?._id ||
        performance.employeeId ||
        '',

      reviewType:
        performance.reviewType ||
        'Annual Review',

      reviewPeriod:
        performance.reviewPeriod ||
        '',

      reviewDate:
        performance.reviewDate
          ? performance.reviewDate.substring(0, 10)
          : '',

      dueDate:
        performance.dueDate
          ? performance.dueDate.substring(0, 10)
          : '',

      goals:
        performance.goals ||
        '',

      achievements:
        performance.achievements ||
        '',

      strengths:
        performance.strengths ||
        '',

      areasForImprovement:
        performance.areasForImprovement ||
        '',

      developmentPlan:
        performance.developmentPlan ||
        '',

      rating:
        performance.rating ||
        5,

      managerComments:
        performance.managerComments ||
        '',

      employeeComments:
        performance.employeeComments ||
        '',

      status:
        performance.status ||
        'Draft'
    });

    setEditingId(performance._id);
    setShowForm(true);
  };

  // ==========================================
  // DELETE PERFORMANCE
  // ==========================================

  const handleDelete = async (id) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this performance review?'
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/performances/${id}`
      );

      alert(
        'Performance review deleted successfully.'
      );

      await fetchPerformances();

    } catch (error) {
      console.error(
        'Delete performance error:',
        error
      );

      alert(
        error.response?.data?.message ||
        'Failed to delete performance review.'
      );
    }
  };

  // ==========================================
  // FILTER PERFORMANCE REVIEWS
  // ==========================================

  const filteredPerformances =
    performances.filter((performance) => {

      const employeeName =
        performance.employeeId?.fullName ||
        '';

      const employeeId =
        performance.employeeId?.employeeId ||
        '';

      const period =
        performance.reviewPeriod ||
        '';

      const reviewType =
        performance.reviewType ||
        '';

      const matchesSearch =
        employeeName
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        employeeId
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        period
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        reviewType
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' ||
        performance.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalReviews =
    performances.length;

  const finalizedReviews =
    performances.filter(
      (item) =>
        item.status === 'Finalized'
    ).length;

  const pendingReviews =
    performances.filter(
      (item) =>
        item.status === 'Submitted'
    ).length;

  const averageRating =
    performances.length > 0
      ? (
          performances.reduce(
            (sum, item) =>
              sum +
              Number(item.rating || 0),
            0
          ) /
          performances.length
        ).toFixed(1)
      : '0.0';

  // ==========================================
  // STATUS BADGE
  // ==========================================

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Finalized':
        return 'bg-success';

      case 'Reviewed':
        return 'bg-primary';

      case 'Submitted':
        return 'bg-warning text-dark';

      case 'Draft':
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="container-fluid py-4">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            {isEmployee
              ? 'My Performance'
              : 'Performance Management'}
          </h2>

          <p className="text-muted mb-0">
            {isEmployee
              ? 'View your performance reviews, ratings and feedback.'
              : 'Manage employee performance reviews, goals, ratings and development plans.'}
          </p>
        </div>

        {canManagePerformance && (
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Performance Review
          </button>
        )}

      </div>

      {/* ======================================
          SUMMARY CARDS
      ====================================== */}

      <div className="row g-3 mb-4">

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between">

                <div>
                  <div className="text-muted small">
                    Total Reviews
                  </div>

                  <h3 className="fw-bold mt-2 mb-0">
                    {totalReviews}
                  </h3>
                </div>

                <i className="bi bi-clipboard-data fs-2 text-primary"></i>

              </div>

            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between">

                <div>
                  <div className="text-muted small">
                    Average Rating
                  </div>

                  <h3 className="fw-bold mt-2 mb-0">
                    {averageRating} / 5
                  </h3>
                </div>

                <i className="bi bi-star-fill fs-2 text-warning"></i>

              </div>

            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between">

                <div>
                  <div className="text-muted small">
                    Pending Reviews
                  </div>

                  <h3 className="fw-bold mt-2 mb-0">
                    {pendingReviews}
                  </h3>
                </div>

                <i className="bi bi-hourglass-split fs-2 text-warning"></i>

              </div>

            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between">

                <div>
                  <div className="text-muted small">
                    Finalized Reviews
                  </div>

                  <h3 className="fw-bold mt-2 mb-0">
                    {finalizedReviews}
                  </h3>
                </div>

                <i className="bi bi-check-circle-fill fs-2 text-success"></i>

              </div>

            </div>
          </div>
        </div>

      </div>

      {/* ======================================
          CREATE / EDIT FORM
      ====================================== */}

      {canManagePerformance && showForm && (

        <div className="card border-0 shadow-sm mb-4">

          <div className="card-header bg-white py-3">

            <div className="d-flex justify-content-between align-items-center">

              <h5 className="mb-0 fw-bold">
                {editingId
                  ? 'Edit Performance Review'
                  : 'Create Performance Review'}
              </h5>

              <button
                type="button"
                className="btn-close"
                onClick={resetForm}
              ></button>

            </div>

          </div>

          <div className="card-body">

            <form onSubmit={handleSubmit}>

              <div className="row g-3">

                {/* Employee */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Employee *
                  </label>

                  <select
                    className="form-select"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select Employee
                    </option>

                    {employees.map(
                      (employee) => (
                        <option
                          key={employee._id}
                          value={employee._id}
                        >
                          {employee.fullName}
                          {' '}
                          (
                          {employee.employeeId}
                          )
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* Review Type */}

                <div className="col-md-3">

                  <label className="form-label fw-semibold">
                    Review Type *
                  </label>

                  <select
                    className="form-select"
                    name="reviewType"
                    value={formData.reviewType}
                    onChange={handleChange}
                    required
                  >

                    <option value="Annual Review">
                      Annual Review
                    </option>

                    <option value="Quarterly Review">
                      Quarterly Review
                    </option>

                    <option value="Mid-Year Review">
                      Mid-Year Review
                    </option>

                    <option value="Probation Review">
                      Probation Review
                    </option>

                    <option value="Promotion Review">
                      Promotion Review
                    </option>

                    <option value="Performance Improvement">
                      Performance Improvement
                    </option>

                  </select>

                </div>

                {/* Review Period */}

                <div className="col-md-3">

                  <label className="form-label fw-semibold">
                    Review Period *
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="reviewPeriod"
                    placeholder="e.g. Q3 2026"
                    value={formData.reviewPeriod}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* Review Date */}

                <div className="col-md-3">

                  <label className="form-label fw-semibold">
                    Review Date *
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    name="reviewDate"
                    value={formData.reviewDate}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* Due Date */}

                <div className="col-md-3">

                  <label className="form-label fw-semibold">
                    Review Due Date
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                  />

                </div>

                {/* Rating */}

                <div className="col-md-3">

                  <label className="form-label fw-semibold">
                    Overall Rating *
                  </label>

                  <select
                    className="form-select"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    required
                  >

                    <option value={5}>
                      5 - Outstanding
                    </option>

                    <option value={4}>
                      4 - Exceeds Expectations
                    </option>

                    <option value={3}>
                      3 - Meets Expectations
                    </option>

                    <option value={2}>
                      2 - Needs Improvement
                    </option>

                    <option value={1}>
                      1 - Unsatisfactory
                    </option>

                  </select>

                </div>

                {/* Status */}

                <div className="col-md-3">

                  <label className="form-label fw-semibold">
                    Status
                  </label>

                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >

                    <option value="Draft">
                      Draft
                    </option>

                    <option value="Submitted">
                      Submitted
                    </option>

                    <option value="Reviewed">
                      Reviewed
                    </option>

                    <option value="Finalized">
                      Finalized
                    </option>

                  </select>

                </div>

                {/* Goals */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Goals / KPIs
                  </label>

                  <textarea
                    className="form-control"
                    name="goals"
                    rows="4"
                    value={formData.goals}
                    onChange={handleChange}
                    placeholder="Define measurable goals and KPIs for the review period."
                  />

                </div>

                {/* Achievements */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Achievements
                  </label>

                  <textarea
                    className="form-control"
                    name="achievements"
                    rows="4"
                    value={formData.achievements}
                    onChange={handleChange}
                    placeholder="Record important achievements and completed objectives."
                  />

                </div>

                {/* Strengths */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Strengths
                  </label>

                  <textarea
                    className="form-control"
                    name="strengths"
                    rows="4"
                    value={formData.strengths}
                    onChange={handleChange}
                    placeholder="Describe employee strengths and positive contributions."
                  />

                </div>

                {/* Areas for Improvement */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Areas for Improvement
                  </label>

                  <textarea
                    className="form-control"
                    name="areasForImprovement"
                    rows="4"
                    value={formData.areasForImprovement}
                    onChange={handleChange}
                    placeholder="Identify skills, behaviours or results requiring improvement."
                  />

                </div>

                {/* Development Plan */}

                <div className="col-md-12">

                  <label className="form-label fw-semibold">
                    Development & Training Plan
                  </label>

                  <textarea
                    className="form-control"
                    name="developmentPlan"
                    rows="4"
                    value={formData.developmentPlan}
                    onChange={handleChange}
                    placeholder="Recommended training, mentoring, certifications, development goals or career actions."
                  />

                </div>

                {/* Manager Comments */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Manager / HR Comments
                  </label>

                  <textarea
                    className="form-control"
                    name="managerComments"
                    rows="4"
                    value={formData.managerComments}
                    onChange={handleChange}
                    placeholder="Manager or HR feedback."
                  />

                </div>

                {/* Employee Comments */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Employee Comments
                  </label>

                  <textarea
                    className="form-control"
                    name="employeeComments"
                    rows="4"
                    value={formData.employeeComments}
                    onChange={handleChange}
                    placeholder="Employee response or acknowledgement."
                  />

                </div>

              </div>

              <div className="d-flex gap-2 mt-4">

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <i className="bi bi-check-lg me-2"></i>

                  {editingId
                    ? 'Update Review'
                    : 'Create Review'}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ======================================
          FILTERS
      ====================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <div className="row g-3">

            <div className="col-md-8">

              <div className="input-group">

                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder={
                    isEmployee
                      ? 'Search your reviews...'
                      : 'Search employee, ID, period or review type...'
                  }
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>

            </div>

            <div className="col-md-4">

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

                <option value="Draft">
                  Draft
                </option>

                <option value="Submitted">
                  Submitted
                </option>

                <option value="Reviewed">
                  Reviewed
                </option>

                <option value="Finalized">
                  Finalized
                </option>

              </select>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================
          PERFORMANCE TABLE
      ====================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-header bg-white py-3">

          <div className="d-flex justify-content-between align-items-center">

            <div>

              <h5 className="mb-1 fw-bold">
                Performance Reviews
              </h5>

              <small className="text-muted">
                {filteredPerformances.length}
                {' '}
                review
                {filteredPerformances.length !== 1
                  ? 's'
                  : ''}
                {' '}
                displayed
              </small>

            </div>

          </div>

        </div>

        <div className="card-body p-0">

          {loading ? (

            <div className="text-center py-5">

              <div
                className="spinner-border text-primary"
                role="status"
              ></div>

              <p className="text-muted mt-3 mb-0">
                Loading performance reviews...
              </p>

            </div>

          ) : filteredPerformances.length === 0 ? (

            <div className="text-center py-5">

              <i className="bi bi-clipboard-data fs-1 text-muted"></i>

              <h5 className="mt-3">
                No performance reviews found
              </h5>

              <p className="text-muted mb-0">
                {isEmployee
                  ? 'You do not have any performance reviews yet.'
                  : 'Create a performance review to get started.'}
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    {!isEmployee && (
                      <th>Employee</th>
                    )}

                    <th>Review Type</th>
                    <th>Period</th>
                    <th>Review Date</th>
                    <th>Rating</th>
                    <th>Status</th>

                    {canManagePerformance && (
                      <th className="text-center">
                        Actions
                      </th>
                    )}

                  </tr>

                </thead>

                <tbody>

                  {filteredPerformances.map(
                    (performance) => (

                      <tr key={performance._id}>

                        {!isEmployee && (

                          <td>

                            <div className="fw-semibold">
                              {performance.employeeId?.fullName ||
                                '—'}
                            </div>

                            <small className="text-muted">
                              {performance.employeeId?.employeeId ||
                                ''}
                            </small>

                          </td>

                        )}

                        <td>
                          {performance.reviewType ||
                            'Annual Review'}
                        </td>

                        <td>
                          {performance.reviewPeriod}
                        </td>

                        <td>

                          {performance.reviewDate
                            ? new Date(
                                performance.reviewDate
                              ).toLocaleDateString()
                            : '—'}

                        </td>

                        <td>

                          <span className="fw-semibold">
                            {performance.rating}
                            {' '}
                            / 5
                          </span>

                          <div>

                            {[1, 2, 3, 4, 5].map(
                              (star) => (

                                <i
                                  key={star}
                                  className={`bi ${
                                    star <=
                                    performance.rating
                                      ? 'bi-star-fill text-warning'
                                      : 'bi-star text-muted'
                                  } me-1`}
                                ></i>

                              )
                            )}

                          </div>

                        </td>

                        <td>

                          <span
                            className={`badge ${getStatusBadge(
                              performance.status
                            )}`}
                          >
                            {performance.status}
                          </span>

                        </td>

                        {canManagePerformance && (

                          <td className="text-center">

                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              title="Edit Review"
                              onClick={() =>
                                handleEdit(
                                  performance
                                )
                              }
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                            {isAdmin && (

                              <button
                                className="btn btn-sm btn-outline-danger"
                                title="Delete Review"
                                onClick={() =>
                                  handleDelete(
                                    performance._id
                                  )
                                }
                              >
                                <i className="bi bi-trash"></i>
                              </button>

                            )}

                          </td>

                        )}

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default Performance;