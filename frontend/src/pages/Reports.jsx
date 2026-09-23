import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const REPORT_TYPES = [
  "Case Report",
  "Client Report",
  "Revenue Report",
  "Payroll Report",
  "Employee Report",
  "Vendor Report",
  "Petty Cash Report",
  "Recruitment Report",
  "Performance Report",
  "Comprehensive Report",
];

const INITIAL_FORM = {
  reportNumber: "",
  reportType: "Comprehensive Report",
  reportTitle: "",
  periodFrom: "",
  periodTo: "",
  summary: "",
  status: "Generated",
};

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/reports");
      setReports(response.data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);

      setError(
        err.response?.data?.message || "Failed to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);

      const response = await api.get(
        "/reports/analytics/summary"
      );

      setAnalytics(response.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchAnalytics();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        report.reportNumber
          ?.toLowerCase()
          .includes(searchText) ||
        report.reportTitle
          ?.toLowerCase()
          .includes(searchText) ||
        report.reportType
          ?.toLowerCase()
          .includes(searchText);

      const matchesType =
        typeFilter === "All" ||
        report.reportType === typeFilter;

      const matchesStatus =
        statusFilter === "All" ||
        report.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [reports, search, typeFilter, statusFilter]);

  const totalReports = reports.length;

  const generatedReports = reports.filter(
    (report) => report.status === "Generated"
  ).length;

  const archivedReports = reports.filter(
    (report) => report.status === "Archived"
  ).length;

  const reportTypesUsed = new Set(
    reports.map((report) => report.reportType)
  ).size;

  const formatCurrency = (value) => {
    if (value == null) return "—";

    return `₹${Number(value).toLocaleString("en-IN")}`;
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.reportNumber.trim()) {
      setError("Report number is required.");
      return;
    }

    if (!form.reportTitle.trim()) {
      setError("Report title is required.");
      return;
    }

    if (form.periodFrom && form.periodTo) {
      if (
        new Date(form.periodFrom) >
        new Date(form.periodTo)
      ) {
        setError(
          "Period From cannot be later than Period To."
        );
        return;
      }
    }

    try {
      setSaving(true);

      const payload = {
        reportNumber: form.reportNumber.trim(),
        reportType: form.reportType,
        reportTitle: form.reportTitle.trim(),
        periodFrom: form.periodFrom || null,
        periodTo: form.periodTo || null,
        summary: form.summary.trim(),
        status: form.status,
        reportData: {},
      };

      if (editingId) {
        await api.put(`/reports/${editingId}`, payload);

        setSuccess("Report updated successfully.");
      } else {
        await api.post("/reports", payload);

        setSuccess("Report created successfully.");
      }

      resetForm();

      await fetchReports();
      await fetchAnalytics();
    } catch (err) {
      console.error("Failed to save report:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save report."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (report) => {
    setEditingId(report._id);

    setForm({
      reportNumber: report.reportNumber || "",
      reportType:
        report.reportType || "Comprehensive Report",
      reportTitle: report.reportTitle || "",
      periodFrom: report.periodFrom
        ? report.periodFrom.substring(0, 10)
        : "",
      periodTo: report.periodTo
        ? report.periodTo.substring(0, 10)
        : "",
      summary: report.summary || "",
      status: report.status || "Generated",
    });

    setShowForm(true);
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/reports/${id}`);

      setSuccess("Report deleted successfully.");

      await fetchReports();
      await fetchAnalytics();
    } catch (err) {
      console.error("Failed to delete report:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete report."
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    if (status === "Generated") return "status-success";

    if (status === "Archived") return "status-neutral";

    return "status-neutral";
  };

  return (
    <div className="page-container reports-page">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="page-header">
        <div>
          <div className="eyebrow">ADMINISTRATION</div>

          <h1>Reports &amp; Analytics</h1>

          <p>
            Central reporting workspace for legal, financial,
            operational and administrative intelligence.
          </p>
        </div>

        <button
          className="btn btn-dark"
          onClick={() => {
            setEditingId(null);
            setForm(INITIAL_FORM);
            setShowForm((previous) => !previous);
            setError("");
            setSuccess("");
          }}
        >
          <i className="bi bi-file-earmark-plus me-2"></i>

          {showForm ? "Close Form" : "Generate Report"}
        </button>
      </div>

      {/* =====================================================
          ALERTS
          ===================================================== */}

      {error && (
        <div className="alert alert-danger reports-alert">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success reports-alert">
          <i className="bi bi-check-circle me-2"></i>
          {success}
        </div>
      )}

      {/* =====================================================
          REPORT REGISTER SUMMARY
          ===================================================== */}

      <div className="summary-grid reports-summary">

        <div className="summary-card">
          <span className="summary-label">
            Total Reports
          </span>

          <strong>{totalReports}</strong>

          <small>All generated records</small>
        </div>

        <div className="summary-card">
          <span className="summary-label">
            Generated
          </span>

          <strong>{generatedReports}</strong>

          <small>Active report records</small>
        </div>

        <div className="summary-card">
          <span className="summary-label">
            Archived
          </span>

          <strong>{archivedReports}</strong>

          <small>Historical reports</small>
        </div>

        <div className="summary-card">
          <span className="summary-label">
            Report Categories
          </span>

          <strong>{reportTypesUsed}</strong>

          <small>
            Categories currently in use
          </small>
        </div>

      </div>

      {/* =====================================================
          ANALYTICS OVERVIEW
          ===================================================== */}

      <section className="editorial-section reports-analytics-section">

        <div className="section-heading">
          <div>
            <div className="eyebrow">
              FIRM INTELLIGENCE
            </div>

            <h2>Analytics Overview</h2>
          </div>

          <span className="record-count">
            Live system data
          </span>
        </div>

        {analyticsLoading ? (
          <div className="empty-state reports-analytics-loading">
            <div className="spinner-border"></div>

            <p>Loading analytics...</p>
          </div>
        ) : analytics ? (
          <>
            {/* CASES */}

            <div className="analytics-group">

              <div className="analytics-group-heading">
                <div>
                  <span className="analytics-group-label">
                    LEGAL OPERATIONS
                  </span>

                  <h3>Cases</h3>
                </div>
              </div>

              <div className="analytics-grid">

                <div className="analytics-card">
                  <span>Total Cases</span>

                  <strong>
                    {analytics.cases?.total ?? "—"}
                  </strong>

                  <small>
                    All registered legal matters
                  </small>
                </div>

                <div className="analytics-card">
                  <span>Active Cases</span>

                  <strong>
                    {analytics.cases?.active ?? "—"}
                  </strong>

                  <small>
                    Currently active matters
                  </small>
                </div>

                <div className="analytics-card">
                  <span>Closed Cases</span>

                  <strong>
                    {analytics.cases?.closed ?? "—"}
                  </strong>

                  <small>
                    Closed, won or lost matters
                  </small>
                </div>

              </div>
            </div>

            {/* PEOPLE & OPERATIONS */}

            <div className="analytics-group">

              <div className="analytics-group-heading">
                <div>
                  <span className="analytics-group-label">
                    PEOPLE &amp; OPERATIONS
                  </span>

                  <h3>Firm Resources</h3>
                </div>
              </div>

              <div className="analytics-grid">

                <div className="analytics-card">
                  <span>Clients</span>

                  <strong>
                    {analytics.clients?.total ?? "—"}
                  </strong>

                  <small>
                    Registered client records
                  </small>
                </div>

                <div className="analytics-card">
                  <span>Employees</span>

                  <strong>
                    {analytics.employees?.total ?? "—"}
                  </strong>

                  <small>
                    Internal staff records
                  </small>
                </div>

                <div className="analytics-card">
                  <span>Vendors</span>

                  <strong>
                    {analytics.vendors?.total ?? "—"}
                  </strong>

                  <small>
                    Registered service providers
                  </small>
                </div>

                <div className="analytics-card">
                  <span>Candidates</span>

                  <strong>
                    {analytics.recruitment?.totalCandidates ??
                      "—"}
                  </strong>

                  <small>
                    Recruitment records
                  </small>
                </div>

              </div>
            </div>

            {/* FINANCIAL OPERATIONS */}

            <div className="analytics-group">

              <div className="analytics-group-heading">
                <div>
                  <span className="analytics-group-label">
                    FINANCIAL OPERATIONS
                  </span>

                  <h3>Financial Position</h3>
                </div>
              </div>

              <div className="analytics-grid">

                <div className="analytics-card">
                  <span>Total Invoices</span>

                  <strong>
                    {analytics.billing?.totalInvoices ??
                      "—"}
                  </strong>

                  <small>
                    Registered billing records
                  </small>
                </div>

                <div className="analytics-card analytics-card-emphasis">
                  <span>Revenue Collected</span>

                  <strong>
                    {formatCurrency(
                      analytics.revenue?.total
                    )}
                  </strong>

                  <small>
                    Completed client payments
                  </small>
                </div>

                <div className="analytics-card">
                  <span>Completed Payments</span>

                  <strong>
                    {analytics.payments?.completed ??
                      "—"}
                  </strong>

                  <small>
                    Successfully recorded payments
                  </small>
                </div>

                <div className="analytics-card">
                  <span>Total Payroll</span>

                  <strong>
                    {formatCurrency(
                      analytics.payroll?.total
                    )}
                  </strong>

                  <small>
                    Registered payroll records
                  </small>
                </div>

              </div>
            </div>

            {/* PETTY CASH */}

            <div className="analytics-group">

              <div className="analytics-group-heading">
                <div>
                  <span className="analytics-group-label">
                    CASH MANAGEMENT
                  </span>

                  <h3>Petty Cash</h3>
                </div>
              </div>

              <div className="analytics-grid">

                <div className="analytics-card">
                  <span>Cash In</span>

                  <strong>
                    {formatCurrency(
                      analytics.pettyCash?.totalIn
                    )}
                  </strong>

                  <small>
                    Approved cash inflows
                  </small>
                </div>

                <div className="analytics-card">
                  <span>Cash Out</span>

                  <strong>
                    {formatCurrency(
                      analytics.pettyCash?.totalOut
                    )}
                  </strong>

                  <small>
                    Approved cash outflows
                  </small>
                </div>

                <div className="analytics-card analytics-card-emphasis">
                  <span>Cash Balance</span>

                  <strong>
                    {formatCurrency(
                      analytics.pettyCash?.balance
                    )}
                  </strong>

                  <small>
                    Current approved balance
                  </small>
                </div>

              </div>
            </div>

          </>
        ) : (
          <div className="empty-state">
            <i className="bi bi-bar-chart"></i>

            <h3>Analytics unavailable</h3>

            <p>
              The reporting service could not load the
              current analytics data.
            </p>
          </div>
        )}

      </section>

      {/* =====================================================
          REPORT GENERATION FORM
          ===================================================== */}

      {showForm && (
        <section className="editorial-section report-form-section">

          <div className="section-heading">
            <div>
              <div className="eyebrow">
                {editingId ? "EDIT REPORT" : "NEW REPORT"}
              </div>

              <h2>
                {editingId
                  ? "Update Report Record"
                  : "Generate Report Record"}
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="form-group">
                <label>Report Number *</label>

                <input
                  type="text"
                  name="reportNumber"
                  value={form.reportNumber}
                  onChange={handleChange}
                  placeholder="REP-2026-002"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Report Type *</label>

                <select
                  name="reportType"
                  value={form.reportType}
                  onChange={handleChange}
                  className="form-select"
                >
                  {REPORT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group form-group-wide">
                <label>Report Title *</label>

                <input
                  type="text"
                  name="reportTitle"
                  value={form.reportTitle}
                  onChange={handleChange}
                  placeholder="September 2026 Case Report"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Period From</label>

                <input
                  type="date"
                  name="periodFrom"
                  value={form.periodFrom}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Period To</label>

                <input
                  type="date"
                  name="periodTo"
                  value={form.periodTo}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Status</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Generated">
                    Generated
                  </option>

                  <option value="Archived">
                    Archived
                  </option>
                </select>
              </div>

              <div className="form-group form-group-wide">
                <label>Summary</label>

                <textarea
                  name="summary"
                  value={form.summary}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Enter a concise description of this report..."
                  className="form-control"
                ></textarea>
              </div>

            </div>

            <div className="form-actions">

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-dark"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>

                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2 me-2"></i>

                    {editingId
                      ? "Update Report"
                      : "Generate Report"}
                  </>
                )}
              </button>

            </div>

          </form>
        </section>
      )}

      {/* =====================================================
          REPORT REGISTER
          ===================================================== */}

      <section className="editorial-section">

        <div className="section-heading">

          <div>
            <div className="eyebrow">
              REPORT REGISTER
            </div>

            <h2>Generated Reports</h2>
          </div>

          <span className="record-count">
            {filteredReports.length} records
          </span>

        </div>

        <div className="table-toolbar">

          <div className="toolbar-search">

            <i className="bi bi-search"></i>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search report number, title or type..."
            />

          </div>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
            className="form-select toolbar-select"
          >
            <option value="All">
              All Report Types
            </option>

            {REPORT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="form-select toolbar-select"
          >
            <option value="All">
              All Statuses
            </option>

            <option value="Generated">
              Generated
            </option>

            <option value="Archived">
              Archived
            </option>
          </select>

        </div>

        {loading ? (
          <div className="empty-state">

            <div className="spinner-border"></div>

            <p>Loading reports...</p>

          </div>
        ) : filteredReports.length === 0 ? (
          <div className="empty-state">

            <i className="bi bi-file-earmark-bar-graph"></i>

            <h3>No reports found</h3>

            <p>
              Generate a report to begin building the
              firm's reporting register.
            </p>

          </div>
        ) : (
          <div className="table-responsive">

            <table className="table align-middle reports-table">

              <thead>

                <tr>
                  <th>REPORT</th>
                  <th>TYPE</th>
                  <th>PERIOD</th>
                  <th>GENERATED BY</th>
                  <th>STATUS</th>
                  <th className="text-end">
                    ACTIONS
                  </th>
                </tr>

              </thead>

              <tbody>

                {filteredReports.map((report) => (

                  <tr key={report._id}>

                    <td>

                      <div className="primary-cell">

                        <strong>
                          {report.reportNumber}
                        </strong>

                        <span>
                          {report.reportTitle}
                        </span>

                      </div>

                    </td>

                    <td>

                      <span className="type-label">
                        {report.reportType}
                      </span>

                    </td>

                    <td>

                      <div className="date-range">

                        <span>
                          {formatDate(report.periodFrom)}
                        </span>

                        <span>
                          {formatDate(report.periodTo)}
                        </span>

                      </div>

                    </td>

                    <td>

                      <div className="primary-cell">

                        <strong>
                          {report.generatedBy?.name || "—"}
                        </strong>

                        <span>
                          {report.generatedBy?.role || "—"}
                        </span>

                      </div>

                    </td>

                    <td>

                      <span
                        className={`status-badge ${getStatusClass(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>

                    </td>

                    <td>

                      <div className="table-actions justify-content-end">

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() =>
                            handleEdit(report)
                          }
                          title="Edit report"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            handleDelete(report._id)
                          }
                          title="Delete report"
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

      </section>

    </div>
  );
};

export default Reports;