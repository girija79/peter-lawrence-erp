import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

const Communication = () => {
  const { user } = useContext(AuthContext);

  const isAdmin = user?.role === "admin";
  const isHR = user?.role === "hr";
  const canSend = isAdmin || isHR;

  const [communications, setCommunications] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState(null);

  const [formData, setFormData] = useState({
    recipientId: "",
    recipientRole: "",
    subject: "",
    message: "",
    type: "Announcement",
    priority: "Normal",
  });

  const fetchCommunications = async () => {
    try {
      setLoading(true);

      const res = await api.get("/communications");
      setCommunications(res.data);
    } catch (error) {
      console.error(
        "Failed to fetch communications:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!canSend) return;

    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.error(
        "Failed to fetch users:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    fetchCommunications();
    fetchUsers();
  }, [canSend]);

  const resetForm = () => {
    setFormData({
      recipientId: "",
      recipientRole: "",
      subject: "",
      message: "",
      type: "Announcement",
      priority: "Normal",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRecipientChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      recipientId: value,
      recipientRole: value ? "" : prev.recipientRole,
    }));
  };

  const handleRoleChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      recipientRole: value,
      recipientId: value ? "" : prev.recipientId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.message.trim()) {
      alert("Subject and message are required.");
      return;
    }

    if (!formData.recipientId && !formData.recipientRole) {
      alert("Please select a recipient or recipient role.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/communications", {
        recipientId: formData.recipientId || null,
        recipientRole: formData.recipientRole || null,
        subject: formData.subject,
        message: formData.message,
        type: formData.type,
        priority: formData.priority,
      });

      alert("Communication sent successfully.");

      resetForm();
      setShowForm(false);
      await fetchCommunications();
    } catch (error) {
      console.error(
        "Failed to send communication:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to send communication."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleMarkRead = async (communication) => {
    if (communication.isRead) {
      setSelectedCommunication(communication);
      return;
    }

    try {
      await api.put(
        `/communications/${communication._id}/read`
      );

      setCommunications((prev) =>
        prev.map((item) =>
          item._id === communication._id
            ? {
                ...item,
                isRead: true,
                readAt: new Date(),
              }
            : item
        )
      );

      setSelectedCommunication({
        ...communication,
        isRead: true,
      });
    } catch (error) {
      console.error(
        "Failed to mark communication as read:",
        error.response?.data || error.message
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this communication?")) {
      return;
    }

    try {
      await api.delete(`/communications/${id}`);

      setCommunications((prev) =>
        prev.filter((item) => item._id !== id)
      );

      if (selectedCommunication?._id === id) {
        setSelectedCommunication(null);
      }
    } catch (error) {
      console.error(
        "Failed to delete communication:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete communication."
      );
    }
  };

  const filteredCommunications = useMemo(() => {
    return communications.filter((communication) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        communication.subject
          ?.toLowerCase()
          .includes(searchText) ||
        communication.message
          ?.toLowerCase()
          .includes(searchText) ||
        communication.senderId?.name
          ?.toLowerCase()
          .includes(searchText);

      const matchesType =
        filterType === "All" ||
        communication.type === filterType;

      const matchesStatus =
        filterStatus === "All" ||
        (filterStatus === "Unread" && !communication.isRead) ||
        (filterStatus === "Read" && communication.isRead);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [
    communications,
    search,
    filterType,
    filterStatus,
  ]);

  const unreadCount = communications.filter(
    (item) => !item.isRead
  ).length;

  const highPriorityCount = communications.filter(
    (item) =>
      item.priority === "High" ||
      item.priority === "Urgent"
  ).length;

  const getPriorityBadge = (priority) => {
    const classes = {
      Low: "bg-secondary",
      Normal: "bg-primary",
      High: "bg-warning text-dark",
      Urgent: "bg-danger",
    };

    return (
      <span
        className={`badge ${
          classes[priority] || "bg-secondary"
        }`}
      >
        {priority}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const classes = {
      Announcement: "bg-info text-dark",
      "Internal Message": "bg-primary",
      "HR Notice": "bg-success",
      General: "bg-secondary",
    };

    return (
      <span
        className={`badge ${
          classes[type] || "bg-secondary"
        }`}
      >
        {type}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString();
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">
            Employee Communication
          </h3>

          <p className="text-muted mb-0">
            Internal announcements, HR notices and messages
          </p>
        </div>

        {canSend && (
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <i className="bi bi-send me-2"></i>
            New Communication
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted mb-1">
                    Total Messages
                  </p>
                  <h3 className="fw-bold mb-0">
                    {communications.length}
                  </h3>
                </div>

                <div className="text-primary fs-2">
                  <i className="bi bi-chat-square-text"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted mb-1">
                    Unread
                  </p>
                  <h3 className="fw-bold mb-0">
                    {unreadCount}
                  </h3>
                </div>

                <div className="text-warning fs-2">
                  <i className="bi bi-envelope"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted mb-1">
                    High Priority
                  </p>
                  <h3 className="fw-bold mb-0">
                    {highPriorityCount}
                  </h3>
                </div>

                <div className="text-danger fs-2">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-5">
              <label className="form-label">
                Search
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search subject, message or sender..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Type
              </label>

              <select
                className="form-select"
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value)
                }
              >
                <option value="All">All Types</option>
                <option value="Announcement">
                  Announcement
                </option>
                <option value="Internal Message">
                  Internal Message
                </option>
                <option value="HR Notice">
                  HR Notice
                </option>
                <option value="General">
                  General
                </option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Status
              </label>

              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value)
                }
              >
                <option value="All">
                  All Messages
                </option>
                <option value="Unread">
                  Unread
                </option>
                <option value="Read">
                  Read
                </option>
              </select>
            </div>

            <div className="col-md-1 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                title="Reset filters"
                onClick={() => {
                  setSearch("");
                  setFilterType("All");
                  setFilterStatus("All");
                }}
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Communications Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-semibold">
            Communications
          </h5>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
              ></div>

              <p className="text-muted mt-3 mb-0">
                Loading communications...
              </p>
            </div>
          ) : filteredCommunications.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-chat-square-text fs-1 text-muted"></i>

              <p className="text-muted mt-3 mb-0">
                No communications found.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Status</th>
                    <th>Subject</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>From</th>
                    <th>Date</th>
                    {isAdmin && <th>Action</th>}
                  </tr>
                </thead>

                <tbody>
                  {filteredCommunications.map(
                    (communication) => (
                      <tr
                        key={communication._id}
                        className={
                          !communication.isRead
                            ? "table-primary"
                            : ""
                        }
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          handleMarkRead(communication)
                        }
                      >
                        <td>
                          {communication.isRead ? (
                            <span className="badge bg-light text-dark border">
                              <i className="bi bi-envelope-open me-1"></i>
                              Read
                            </span>
                          ) : (
                            <span className="badge bg-primary">
                              <i className="bi bi-envelope me-1"></i>
                              New
                            </span>
                          )}
                        </td>

                        <td>
                          <div
                            className={
                              !communication.isRead
                                ? "fw-bold"
                                : ""
                            }
                          >
                            {communication.subject}
                          </div>
                        </td>

                        <td>
                          {getTypeBadge(
                            communication.type
                          )}
                        </td>

                        <td>
                          {getPriorityBadge(
                            communication.priority
                          )}
                        </td>

                        <td>
                          {communication.senderId?.name ||
                            "-"}
                        </td>

                        <td>
                          {formatDate(
                            communication.createdAt
                          )}
                        </td>

                        {isAdmin && (
                          <td
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                          >
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDelete(
                                  communication._id
                                )
                              }
                            >
                              <i className="bi bi-trash"></i>
                            </button>
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

      {/* New Communication Modal */}
      {showForm && canSend && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  New Communication
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowForm(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Send an individual message or a
                    role-based announcement.
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Specific User
                      </label>

                      <select
                        className="form-select"
                        value={formData.recipientId}
                        onChange={handleRecipientChange}
                      >
                        <option value="">
                          Select a user
                        </option>

                        {users.map((item) => (
                          <option
                            key={item._id}
                            value={item._id}
                          >
                            {item.name} — {item.role}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        OR Recipient Role
                      </label>

                      <select
                        className="form-select"
                        value={formData.recipientRole}
                        onChange={handleRoleChange}
                      >
                        <option value="">
                          Select a role
                        </option>
                        <option value="employee">
                          All Employees
                        </option>
                        <option value="lawyer">
                          All Lawyers
                        </option>
                        <option value="hr">
                          HR
                        </option>
                        <option value="accountant">
                          Accountants
                        </option>
                        <option value="client">
                          Clients
                        </option>
                        <option value="all">
                          Everyone
                        </option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Type
                      </label>

                      <select
                        name="type"
                        className="form-select"
                        value={formData.type}
                        onChange={handleChange}
                      >
                        <option value="Announcement">
                          Announcement
                        </option>
                        <option value="Internal Message">
                          Internal Message
                        </option>
                        <option value="HR Notice">
                          HR Notice
                        </option>
                        <option value="General">
                          General
                        </option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Priority
                      </label>

                      <select
                        name="priority"
                        className="form-select"
                        value={formData.priority}
                        onChange={handleChange}
                      >
                        <option value="Low">
                          Low
                        </option>
                        <option value="Normal">
                          Normal
                        </option>
                        <option value="High">
                          High
                        </option>
                        <option value="Urgent">
                          Urgent
                        </option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label">
                        Subject
                      </label>

                      <input
                        type="text"
                        name="subject"
                        className="form-control"
                        placeholder="Enter communication subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">
                        Message
                      </label>

                      <textarea
                        name="message"
                        className="form-control"
                        rows="6"
                        placeholder="Write your message..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
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
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                        ></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Send Communication
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Communication Detail Modal */}
      {selectedCommunication && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold">
                    {selectedCommunication.subject}
                  </h5>

                  <div className="mt-2">
                    {getTypeBadge(
                      selectedCommunication.type
                    )}{" "}
                    {getPriorityBadge(
                      selectedCommunication.priority
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setSelectedCommunication(null)
                  }
                ></button>
              </div>

              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <small className="text-muted">
                      From
                    </small>

                    <div className="fw-semibold">
                      {selectedCommunication.senderId?.name ||
                        "-"}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted">
                      Date
                    </small>

                    <div className="fw-semibold">
                      {formatDate(
                        selectedCommunication.createdAt
                      )}
                    </div>
                  </div>
                </div>

                <div className="border rounded p-4 bg-light">
                  <p
                    className="mb-0"
                    style={{
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedCommunication.message}
                  </p>
                </div>

                {selectedCommunication.isRead && (
                  <div className="text-muted small mt-3">
                    <i className="bi bi-check2-all me-1"></i>
                    Read
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setSelectedCommunication(null)
                  }
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communication;