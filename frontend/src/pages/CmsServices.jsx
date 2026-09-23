import { useEffect, useState } from "react";
import api from "../api/axios";

const initialForm = {
  serviceTitle: "",
  slug: "",
  shortDescription: "",
  description: "",
  icon: "",
  displayOrder: 0,
  metaTitle: "",
  metaDescription: "",
  status: "Draft",
};

const CmsServices = () => {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cms-services");
      setServices(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load CMS services."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingId) {
        await api.put(`/cms-services/${editingId}`, form);
        setSuccess("Legal service updated successfully.");
      } else {
        await api.post("/cms-services", form);
        setSuccess("Legal service created successfully.");
      }

      resetForm();
      await fetchServices();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save legal service."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service) => {
    setEditingId(service._id);

    setForm({
      serviceTitle: service.serviceTitle || "",
      slug: service.slug || "",
      shortDescription: service.shortDescription || "",
      description: service.description || "",
      icon: service.icon || "",
      displayOrder: service.displayOrder ?? 0,
      metaTitle: service.metaTitle || "",
      metaDescription: service.metaDescription || "",
      status: service.status || "Draft",
    });

    setSuccess("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this legal service?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/cms-services/${id}`);

      setSuccess("Legal service deleted successfully.");

      if (editingId === id) {
        resetForm();
      }

      await fetchServices();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete legal service."
      );
    }
  };

  const filteredServices = services.filter((service) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      service.serviceTitle?.toLowerCase().includes(search) ||
      service.slug?.toLowerCase().includes(search) ||
      service.shortDescription?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || service.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalServices = services.length;

  const publishedServices = services.filter(
    (service) => service.status === "Published"
  ).length;

  const draftServices = services.filter(
    (service) => service.status === "Draft"
  ).length;

  const archivedServices = services.filter(
    (service) => service.status === "Archived"
  ).length;

  const getStatusClass = (status) => {
    if (status === "Published") return "cms-service-status published";
    if (status === "Archived") return "cms-service-status archived";
    return "cms-service-status draft";
  };

  return (
    <div className="cms-services-page">
      {/* PAGE HEADER */}
      <div className="cms-services-header">
        <div>
          <div className="cms-services-eyebrow">
            WEBSITE ADMINISTRATION
          </div>

          <h1>Legal Services</h1>

          <p>
            Manage the legal services displayed across the firm's public
            website.
          </p>
        </div>

        <button
          type="button"
          className="cms-services-primary-btn"
          onClick={resetForm}
        >
          <i className="bi bi-plus-lg"></i>
          New Service
        </button>
      </div>

      {/* ALERTS */}
      {success && (
        <div className="cms-services-alert success">
          <i className="bi bi-check-circle"></i>
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Close"
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {error && (
        <div className="cms-services-alert error">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close"
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {/* SUMMARY */}
      <div className="cms-services-summary">
        <div className="cms-services-summary-item">
          <span>Total Services</span>
          <strong>{totalServices}</strong>
        </div>

        <div className="cms-services-summary-item">
          <span>Published</span>
          <strong>{publishedServices}</strong>
        </div>

        <div className="cms-services-summary-item">
          <span>Drafts</span>
          <strong>{draftServices}</strong>
        </div>

        <div className="cms-services-summary-item">
          <span>Archived</span>
          <strong>{archivedServices}</strong>
        </div>
      </div>

      {/* FORM */}
      <section className="cms-services-form-section">
        <div className="cms-services-section-heading">
          <div>
            <span>CONTENT MANAGEMENT</span>
            <h2>{editingId ? "Edit Legal Service" : "Create Legal Service"}</h2>
          </div>

          {editingId && (
            <button
              type="button"
              className="cms-services-secondary-btn"
              onClick={resetForm}
            >
              Cancel Editing
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="cms-services-form-grid">
            <div className="cms-services-field">
              <label>Service Title *</label>

              <input
                type="text"
                name="serviceTitle"
                value={form.serviceTitle}
                onChange={handleChange}
                placeholder="Corporate & Commercial Law"
                required
              />
            </div>

            <div className="cms-services-field">
              <label>Slug *</label>

              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="corporate-commercial-law"
                required
              />
            </div>

            <div className="cms-services-field full-width">
              <label>Short Description *</label>

              <input
                type="text"
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                placeholder="Legal guidance for businesses and commercial matters."
                required
              />
            </div>

            <div className="cms-services-field full-width">
              <label>Full Description *</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="6"
                placeholder="Describe the legal service in detail..."
                required
              ></textarea>
            </div>

            <div className="cms-services-field">
              <label>Icon</label>

              <input
                type="text"
                name="icon"
                value={form.icon}
                onChange={handleChange}
                placeholder="bi-building"
              />

              <small>
                Use a Bootstrap Icons class such as bi-building.
              </small>
            </div>

            <div className="cms-services-field">
              <label>Display Order</label>

              <input
                type="number"
                name="displayOrder"
                value={form.displayOrder}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="cms-services-field">
              <label>Status</label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="cms-services-field">
              <label>Meta Title</label>

              <input
                type="text"
                name="metaTitle"
                value={form.metaTitle}
                onChange={handleChange}
                placeholder="Corporate & Commercial Law | Peter Law Firm"
              />
            </div>

            <div className="cms-services-field full-width">
              <label>Meta Description</label>

              <textarea
                name="metaDescription"
                value={form.metaDescription}
                onChange={handleChange}
                rows="3"
                placeholder="SEO description for the legal services page..."
              ></textarea>
            </div>
          </div>

          <div className="cms-services-form-actions">
            <button
              type="submit"
              className="cms-services-primary-btn"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check2"></i>
                  {editingId ? "Update Service" : "Create Service"}
                </>
              )}
            </button>

            {editingId && (
              <button
                type="button"
                className="cms-services-secondary-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* SERVICES LIST */}
      <section className="cms-services-list-section">
        <div className="cms-services-section-heading">
          <div>
            <span>SERVICE REGISTER</span>
            <h2>Legal Services</h2>
          </div>
        </div>

        <div className="cms-services-toolbar">
          <div className="cms-services-search">
            <i className="bi bi-search"></i>

            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="cms-services-filter"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {loading ? (
          <div className="cms-services-empty">
            <div className="spinner-border"></div>
            <p>Loading legal services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="cms-services-empty">
            <div className="cms-services-empty-icon">
              <i className="bi bi-briefcase"></i>
            </div>

            <h3>No legal services found</h3>

            <p>
              Create your first legal service to begin building the firm's
              public services catalogue.
            </p>
          </div>
        ) : (
          <div className="cms-services-table-wrapper">
            <table className="cms-services-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Slug</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service._id}>
                    <td>
                      <div className="cms-service-name">
                        <div className="cms-service-icon">
                          <i
                            className={`bi ${
                              service.icon || "bi-briefcase"
                            }`}
                          ></i>
                        </div>

                        <div>
                          <strong>{service.serviceTitle}</strong>

                          <span>
                            {service.shortDescription}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <code>/{service.slug}</code>
                    </td>

                    <td>{service.displayOrder}</td>

                    <td>
                      <span className={getStatusClass(service.status)}>
                        {service.status}
                      </span>
                    </td>

                    <td>
                      {service.updatedAt
                        ? new Date(service.updatedAt).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                      <div className="cms-services-actions">
                        <button
                          type="button"
                          className="cms-service-action edit"
                          onClick={() => handleEdit(service)}
                          title="Edit service"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          type="button"
                          className="cms-service-action delete"
                          onClick={() => handleDelete(service._id)}
                          title="Delete service"
                        >
                          <i className="bi bi-trash3"></i>
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

export default CmsServices;