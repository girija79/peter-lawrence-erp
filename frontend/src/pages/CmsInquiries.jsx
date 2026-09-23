import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const initialForm = {
  inquiryNumber: "",
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  inquiryType: "General Inquiry",
  status: "New",
  assignedTo: "",
  adminNotes: "",
};

const inquiryTypes = [
  "General Inquiry",
  "Legal Consultation",
  "Corporate Services",
  "Case Inquiry",
  "Career",
  "Other",
];

const statuses = [
  "New",
  "In Progress",
  "Resolved",
  "Closed",
];

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClass(status) {
  if (status === "New") {
    return "cms-inquiry-status new";
  }

  if (status === "In Progress") {
    return "cms-inquiry-status progress";
  }

  if (status === "Resolved") {
    return "cms-inquiry-status resolved";
  }

  return "cms-inquiry-status closed";
}

function getInquiryIcon(type) {
  switch (type) {
    case "Legal Consultation":
      return "bi-briefcase";

    case "Corporate Services":
      return "bi-building";

    case "Case Inquiry":
      return "bi-folder2-open";

    case "Career":
      return "bi-person-badge";

    default:
      return "bi-chat-left-text";
  }
}

export default function CmsInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cms-inquiries");

      setInquiries(response.data || []);
    } catch (err) {
      console.error("Failed to fetch inquiries:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load contact inquiries."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");

      setUsers(response.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchInquiries();
    fetchUsers();
  }, []);

  const filteredInquiries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return inquiries.filter((inquiry) => {
      const matchesSearch =
        !query ||
        inquiry.inquiryNumber
          ?.toLowerCase()
          .includes(query) ||
        inquiry.fullName
          ?.toLowerCase()
          .includes(query) ||
        inquiry.email
          ?.toLowerCase()
          .includes(query) ||
        inquiry.subject
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        inquiry.status === statusFilter;

      const matchesType =
        typeFilter === "All" ||
        inquiry.inquiryType === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    inquiries,
    search,
    statusFilter,
    typeFilter,
  ]);

  const totalInquiries = inquiries.length;

  const newInquiries = inquiries.filter(
    (inquiry) => inquiry.status === "New"
  ).length;

  const progressInquiries = inquiries.filter(
    (inquiry) => inquiry.status === "In Progress"
  ).length;

  const resolvedInquiries = inquiries.filter(
    (inquiry) => inquiry.status === "Resolved"
  ).length;

  const closedInquiries = inquiries.filter(
    (inquiry) => inquiry.status === "Closed"
  ).length;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.inquiryNumber.trim()) {
      setError("Inquiry number is required.");
      return;
    }

    if (!form.fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!form.subject.trim()) {
      setError("Subject is required.");
      return;
    }

    if (!form.message.trim()) {
      setError("Message is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        inquiryNumber: form.inquiryNumber.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        inquiryType: form.inquiryType,
        status: form.status,
        assignedTo: form.assignedTo || null,
        adminNotes: form.adminNotes.trim(),
      };

      if (editingId) {
        await api.put(
          `/cms-inquiries/${editingId}`,
          payload
        );

        setSuccess(
          "Inquiry updated successfully."
        );
      } else {
        await api.post(
          "/cms-inquiries",
          payload
        );

        setSuccess(
          "Inquiry created successfully."
        );
      }

      resetForm();
      setSelectedInquiry(null);

      await fetchInquiries();
    } catch (err) {
      console.error(
        "Failed to save inquiry:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to save inquiry."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (inquiry) => {
    setError("");
    setSuccess("");

    setEditingId(inquiry._id);

    setForm({
      inquiryNumber:
        inquiry.inquiryNumber || "",
      fullName: inquiry.fullName || "",
      email: inquiry.email || "",
      phone: inquiry.phone || "",
      subject: inquiry.subject || "",
      message: inquiry.message || "",
      inquiryType:
        inquiry.inquiryType ||
        "General Inquiry",
      status: inquiry.status || "New",
      assignedTo:
        inquiry.assignedTo?._id ||
        inquiry.assignedTo ||
        "",
      adminNotes:
        inquiry.adminNotes || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this inquiry?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/cms-inquiries/${id}`
      );

      setSuccess(
        "Inquiry deleted successfully."
      );

      if (editingId === id) {
        resetForm();
      }

      if (selectedInquiry?._id === id) {
        setSelectedInquiry(null);
      }

      await fetchInquiries();
    } catch (err) {
      console.error(
        "Failed to delete inquiry:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete inquiry."
      );
    }
  };

  const openInquiry = (inquiry) => {
    setSelectedInquiry(inquiry);
  };

  const closeInquiry = () => {
    setSelectedInquiry(null);
  };

  return (
    <div className="cms-inquiries-page">
      <div className="cms-inquiries-container">

        {/* PAGE HEADER */}
        <div className="cms-inquiries-page-header">
          <div>
            <div className="cms-inquiries-eyebrow">
              WEBSITE CMS
            </div>

            <h1>Contact &amp; Inquiry Management</h1>

            <p>
              Review and manage inquiries submitted
              through the firm's website contact
              channels.
            </p>
          </div>

          <button
            type="button"
            className="cms-inquiries-secondary-button"
            onClick={resetForm}
          >
            <i className="bi bi-plus-lg"></i>
            New Inquiry
          </button>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="cms-inquiries-alert cms-inquiries-alert-error">
            <i className="bi bi-exclamation-circle"></i>

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {success && (
          <div className="cms-inquiries-alert cms-inquiries-alert-success">
            <i className="bi bi-check-circle"></i>

            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {/* SUMMARY */}
        <div className="cms-inquiries-summary">

          <div className="cms-inquiry-summary-card">
            <div className="cms-inquiry-summary-icon">
              <i className="bi bi-inbox"></i>
            </div>

            <div>
              <span>Total Inquiries</span>
              <strong>{totalInquiries}</strong>
            </div>
          </div>

          <div className="cms-inquiry-summary-card">
            <div className="cms-inquiry-summary-icon new">
              <i className="bi bi-envelope"></i>
            </div>

            <div>
              <span>New</span>
              <strong>{newInquiries}</strong>
            </div>
          </div>

          <div className="cms-inquiry-summary-card">
            <div className="cms-inquiry-summary-icon progress">
              <i className="bi bi-arrow-repeat"></i>
            </div>

            <div>
              <span>In Progress</span>
              <strong>{progressInquiries}</strong>
            </div>
          </div>

          <div className="cms-inquiry-summary-card">
            <div className="cms-inquiry-summary-icon resolved">
              <i className="bi bi-check2-circle"></i>
            </div>

            <div>
              <span>Resolved</span>
              <strong>{resolvedInquiries}</strong>
            </div>
          </div>

          <div className="cms-inquiry-summary-card">
            <div className="cms-inquiry-summary-icon closed">
              <i className="bi bi-lock"></i>
            </div>

            <div>
              <span>Closed</span>
              <strong>{closedInquiries}</strong>
            </div>
          </div>

        </div>

        {/* CREATE / EDIT */}
        <section className="cms-inquiries-section">

          <div className="cms-inquiries-section-header">
            <div>
              <span className="cms-inquiries-section-eyebrow">
                {editingId
                  ? "EDIT INQUIRY"
                  : "MANUAL INQUIRY"}
              </span>

              <h2>
                {editingId
                  ? "Edit Inquiry"
                  : "Record Inquiry"}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                className="cms-inquiries-cancel-button"
                onClick={resetForm}
              >
                Cancel Editing
              </button>
            )}
          </div>

          <form
            className="cms-inquiries-form"
            onSubmit={handleSubmit}
          >
            <div className="cms-inquiries-form-grid">

              <div className="cms-inquiries-field">
                <label>
                  Inquiry Number <span>*</span>
                </label>

                <input
                  type="text"
                  name="inquiryNumber"
                  value={form.inquiryNumber}
                  onChange={handleChange}
                  placeholder="INQ-2026-001"
                />
              </div>

              <div className="cms-inquiries-field">
                <label>
                  Full Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Contact person's name"
                />
              </div>

              <div className="cms-inquiries-field">
                <label>
                  Email <span>*</span>
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="contact@example.com"
                />
              </div>

              <div className="cms-inquiries-field">
                <label>Phone</label>

                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+381 ..."
                />
              </div>

              <div className="cms-inquiries-field cms-inquiries-field-wide">
                <label>
                  Subject <span>*</span>
                </label>

                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Inquiry subject"
                />
              </div>

              <div className="cms-inquiries-field">
                <label>Inquiry Type</label>

                <select
                  name="inquiryType"
                  value={form.inquiryType}
                  onChange={handleChange}
                >
                  {inquiryTypes.map((type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cms-inquiries-field">
                <label>Status</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  {statuses.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cms-inquiries-field">
                <label>Assign To</label>

                <select
                  name="assignedTo"
                  value={form.assignedTo}
                  onChange={handleChange}
                >
                  <option value="">
                    Unassigned
                  </option>

                  {users.map((user) => (
                    <option
                      key={user._id}
                      value={user._id}
                    >
                      {user.name} — {user.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cms-inquiries-field cms-inquiries-field-wide">
                <label>
                  Message <span>*</span>
                </label>

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Inquiry message..."
                ></textarea>
              </div>

              <div className="cms-inquiries-field cms-inquiries-field-wide">
                <label>Admin Notes</label>

                <textarea
                  name="adminNotes"
                  value={form.adminNotes}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Internal notes about this inquiry..."
                ></textarea>
              </div>

            </div>

            <div className="cms-inquiries-form-actions">

              <button
                type="button"
                className="cms-inquiries-cancel-button"
                onClick={resetForm}
              >
                Clear
              </button>

              <button
                type="submit"
                className="cms-inquiries-primary-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="cms-inquiries-spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2"></i>

                    {editingId
                      ? "Update Inquiry"
                      : "Save Inquiry"}
                  </>
                )}
              </button>

            </div>
          </form>
        </section>

        {/* INQUIRY REGISTER */}
        <section className="cms-inquiries-section">

          <div className="cms-inquiries-section-header">
            <div>
              <span className="cms-inquiries-section-eyebrow">
                INQUIRY REGISTER
              </span>

              <h2>Website Inquiries</h2>
            </div>
          </div>

          {/* TOOLBAR */}
          <div className="cms-inquiries-toolbar">

            <div className="cms-inquiries-search">
              <i className="bi bi-search"></i>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search inquiries..."
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="All">
                All Statuses
              </option>

              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
            >
              <option value="All">
                All Inquiry Types
              </option>

              {inquiryTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="cms-inquiries-refresh-button"
              onClick={fetchInquiries}
            >
              <i className="bi bi-arrow-clockwise"></i>
              Refresh
            </button>

          </div>

          {/* TABLE */}
          {loading ? (
            <div className="cms-inquiries-loading">
              <div className="cms-inquiries-spinner dark"></div>

              <p>
                Loading website inquiries...
              </p>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="cms-inquiries-empty">

              <div className="cms-inquiries-empty-icon">
                <i className="bi bi-inbox"></i>
              </div>

              <h3>No inquiries found</h3>

              <p>
                Website contact submissions will
                appear here when the public contact
                form is connected.
              </p>

            </div>
          ) : (
            <div className="cms-inquiries-table-wrapper">

              <table className="cms-inquiries-table">

                <thead>
                  <tr>
                    <th>INQUIRY</th>
                    <th>CONTACT</th>
                    <th>TYPE</th>
                    <th>ASSIGNED TO</th>
                    <th>STATUS</th>
                    <th>RECEIVED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInquiries.map(
                    (inquiry) => (
                      <tr key={inquiry._id}>

                        <td>
                          <div className="cms-inquiry-identity">

                            <div className="cms-inquiry-type-icon">
                              <i
                                className={`bi ${getInquiryIcon(
                                  inquiry.inquiryType
                                )}`}
                              ></i>
                            </div>

                            <div>
                              <strong>
                                {inquiry.subject}
                              </strong>

                              <span>
                                {inquiry.inquiryNumber}
                              </span>
                            </div>

                          </div>
                        </td>

                        <td>
                          <div className="cms-inquiry-contact">
                            <strong>
                              {inquiry.fullName}
                            </strong>

                            <span>
                              {inquiry.email}
                            </span>

                            {inquiry.phone && (
                              <span>
                                {inquiry.phone}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <span className="cms-inquiry-type">
                            {inquiry.inquiryType}
                          </span>
                        </td>

                        <td>
                          {inquiry.assignedTo?.name ||
                            "Unassigned"}
                        </td>

                        <td>
                          <span
                            className={getStatusClass(
                              inquiry.status
                            )}
                          >
                            {inquiry.status}
                          </span>
                        </td>

                        <td>
                          {formatDateTime(
                            inquiry.createdAt
                          )}
                        </td>

                        <td>
                          <div className="cms-inquiry-actions">

                            <button
                              type="button"
                              className="cms-inquiry-action view"
                              title="View inquiry"
                              onClick={() =>
                                openInquiry(inquiry)
                              }
                            >
                              <i className="bi bi-eye"></i>
                            </button>

                            <button
                              type="button"
                              className="cms-inquiry-action edit"
                              title="Edit inquiry"
                              onClick={() =>
                                handleEdit(inquiry)
                              }
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                            <button
                              type="button"
                              className="cms-inquiry-action delete"
                              title="Delete inquiry"
                              onClick={() =>
                                handleDelete(
                                  inquiry._id
                                )
                              }
                            >
                              <i className="bi bi-trash3"></i>
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

          <div className="cms-inquiries-register-footer">
            Showing {filteredInquiries.length} of{" "}
            {inquiries.length} inquiries
          </div>
        </section>

        {/* DETAIL PANEL */}
        {selectedInquiry && (
          <div
            className="cms-inquiry-overlay"
            onClick={closeInquiry}
          >
            <div
              className="cms-inquiry-detail-panel"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="cms-inquiry-detail-header">

                <div>
                  <span>
                    {selectedInquiry.inquiryNumber}
                  </span>

                  <h2>
                    {selectedInquiry.subject}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeInquiry}
                >
                  <i className="bi bi-x-lg"></i>
                </button>

              </div>

              <div className="cms-inquiry-detail-status">
                <span
                  className={getStatusClass(
                    selectedInquiry.status
                  )}
                >
                  {selectedInquiry.status}
                </span>

                <span>
                  Received{" "}
                  {formatDateTime(
                    selectedInquiry.createdAt
                  )}
                </span>
              </div>

              <div className="cms-inquiry-detail-grid">

                <div>
                  <span className="cms-inquiry-detail-label">
                    CONTACT
                  </span>

                  <strong>
                    {selectedInquiry.fullName}
                  </strong>

                  <a
                    href={`mailto:${selectedInquiry.email}`}
                  >
                    {selectedInquiry.email}
                  </a>

                  {selectedInquiry.phone && (
                    <span>
                      {selectedInquiry.phone}
                    </span>
                  )}
                </div>

                <div>
                  <span className="cms-inquiry-detail-label">
                    INQUIRY TYPE
                  </span>

                  <strong>
                    {selectedInquiry.inquiryType}
                  </strong>
                </div>

                <div>
                  <span className="cms-inquiry-detail-label">
                    ASSIGNED TO
                  </span>

                  <strong>
                    {selectedInquiry.assignedTo?.name ||
                      "Unassigned"}
                  </strong>
                </div>

                <div>
                  <span className="cms-inquiry-detail-label">
                    LAST UPDATED
                  </span>

                  <strong>
                    {formatDateTime(
                      selectedInquiry.updatedAt
                    )}
                  </strong>
                </div>

              </div>

              <div className="cms-inquiry-detail-message">

                <span className="cms-inquiry-detail-label">
                  MESSAGE
                </span>

                <p>
                  {selectedInquiry.message}
                </p>

              </div>

              {selectedInquiry.adminNotes && (
                <div className="cms-inquiry-detail-notes">

                  <span className="cms-inquiry-detail-label">
                    ADMIN NOTES
                  </span>

                  <p>
                    {selectedInquiry.adminNotes}
                  </p>

                </div>
              )}

              {selectedInquiry.resolvedAt && (
                <div className="cms-inquiry-resolved-info">

                  <i className="bi bi-check-circle"></i>

                  Resolved on{" "}
                  {formatDate(
                    selectedInquiry.resolvedAt
                  )}

                </div>
              )}

              <div className="cms-inquiry-detail-actions">

                <button
                  type="button"
                  className="cms-inquiries-cancel-button"
                  onClick={closeInquiry}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="cms-inquiries-primary-button"
                  onClick={() => {
                    closeInquiry();
                    handleEdit(
                      selectedInquiry
                    );
                  }}
                >
                  <i className="bi bi-pencil"></i>
                  Edit Inquiry
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}