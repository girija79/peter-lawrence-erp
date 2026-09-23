import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const initialForm = {
  pageTitle: "",
  slug: "",
  pageType: "Other",
  content: "",
  metaTitle: "",
  metaDescription: "",
  status: "Draft",
};

const pageTypes = [
  "About",
  "Services",
  "Contact",
  "Privacy Policy",
  "Terms & Conditions",
  "Other",
];

const statusOptions = ["Draft", "Published", "Archived"];

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const makeSlug = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const getStatusClass = (status) => {
  switch (status) {
    case "Published":
      return "cms-status cms-status-published";
    case "Archived":
      return "cms-status cms-status-archived";
    default:
      return "cms-status cms-status-draft";
  }
};

export default function CmsPages() {
  const [pages, setPages] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/cms-pages?_t=${Date.now()}`);
      setPages(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load CMS pages."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const statistics = useMemo(() => {
    return {
      total: pages.length,
      published: pages.filter((page) => page.status === "Published").length,
      draft: pages.filter((page) => page.status === "Draft").length,
      archived: pages.filter((page) => page.status === "Archived").length,
    };
  }, [pages]);

  const filteredPages = useMemo(() => {
    const query = search.trim().toLowerCase();

    return pages.filter((page) => {
      const matchesSearch =
        !query ||
        page.pageTitle?.toLowerCase().includes(query) ||
        page.slug?.toLowerCase().includes(query) ||
        page.pageType?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || page.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [pages, search, statusFilter]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleTitleChange = (event) => {
    const value = event.target.value;

    setForm((current) => ({
      ...current,
      pageTitle: value,
      slug: editingId ? current.slug : makeSlug(value),
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setError("");
    setSuccess("");
    setForm(initialForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (page) => {
    setError("");
    setSuccess("");

    setForm({
      pageTitle: page.pageTitle || "",
      slug: page.slug || "",
      pageType: page.pageType || "Other",
      content: page.content || "",
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      status: page.status || "Draft",
    });

    setEditingId(page._id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.pageTitle.trim()) {
        setError("Page title is required.");
        return;
      }

      if (!form.slug.trim()) {
        setError("Page slug is required.");
        return;
      }

      if (!form.content.trim()) {
        setError("Page content is required.");
        return;
      }

      const payload = {
        ...form,
        slug: makeSlug(form.slug),
      };

      if (editingId) {
        await api.put(`/cms-pages/${editingId}`, payload);
        setSuccess("CMS page updated successfully.");
      } else {
        await api.post("/cms-pages", payload);
        setSuccess("CMS page created successfully.");
      }

      await fetchPages();
      resetForm();

      setTimeout(() => {
        setSuccess("");
      }, 3500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save CMS page."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (page) => {
    const confirmed = window.confirm(
      `Delete "${page.pageTitle}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/cms-pages/${page._id}`);

      setSuccess("CMS page deleted successfully.");
      await fetchPages();

      setTimeout(() => {
        setSuccess("");
      }, 3500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete CMS page."
      );
    }
  };

  return (
    <div className="cms-pages-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">WEBSITE ADMINISTRATION</div>

          <h1>Website CMS</h1>

          <p>
            Manage public website pages, content and publishing status
            from the legal ERP.
          </p>
        </div>

        <div className="cms-header-actions">
          <button
            type="button"
            className="cms-secondary-button"
            onClick={fetchPages}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise"></i>
            Refresh
          </button>

          <button
            type="button"
            className="cms-primary-button"
            onClick={openCreateForm}
          >
            <i className="bi bi-plus-lg"></i>
            Add Page
          </button>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="cms-alert cms-alert-success">
          <i className="bi bi-check-circle"></i>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="cms-alert cms-alert-error">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Statistics */}
      <div className="cms-statistics">
        <div className="cms-stat-item">
          <div className="cms-stat-label">TOTAL PAGES</div>
          <div className="cms-stat-value">{statistics.total}</div>
        </div>

        <div className="cms-stat-item">
          <div className="cms-stat-label">PUBLISHED</div>
          <div className="cms-stat-value">{statistics.published}</div>
        </div>

        <div className="cms-stat-item">
          <div className="cms-stat-label">DRAFTS</div>
          <div className="cms-stat-value">{statistics.draft}</div>
        </div>

        <div className="cms-stat-item">
          <div className="cms-stat-label">ARCHIVED</div>
          <div className="cms-stat-value">{statistics.archived}</div>
        </div>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <section className="cms-form-section">
          <div className="cms-section-heading">
            <div>
              <div className="cms-section-eyebrow">
                {editingId ? "EDIT CONTENT" : "NEW CONTENT"}
              </div>

              <h2>
                {editingId
                  ? "Edit Website Page"
                  : "Create Website Page"}
              </h2>
            </div>

            <button
              type="button"
              className="cms-close-button"
              onClick={resetForm}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="cms-form-grid">
              <div className="cms-form-field cms-form-field-wide">
                <label>Page Title *</label>

                <input
                  type="text"
                  name="pageTitle"
                  value={form.pageTitle}
                  onChange={handleTitleChange}
                  placeholder="e.g. About Peter Law Firm"
                />
              </div>

              <div className="cms-form-field">
                <label>Page Type *</label>

                <select
                  name="pageType"
                  value={form.pageType}
                  onChange={handleChange}
                >
                  {pageTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cms-form-field">
                <label>Status *</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cms-form-field cms-form-field-wide">
                <label>URL Slug *</label>

                <div className="cms-slug-input">
                  <span>/</span>

                  <input
                    type="text"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="about-us"
                  />
                </div>

                <small>
                  This becomes the public website URL identifier.
                </small>
              </div>

              <div className="cms-form-field cms-form-field-wide">
                <label>Page Content *</label>

                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows="8"
                  placeholder="Enter the website page content..."
                ></textarea>
              </div>

              <div className="cms-form-field">
                <label>SEO Meta Title</label>

                <input
                  type="text"
                  name="metaTitle"
                  value={form.metaTitle}
                  onChange={handleChange}
                  placeholder="SEO page title"
                />
              </div>

              <div className="cms-form-field">
                <label>SEO Meta Description</label>

                <input
                  type="text"
                  name="metaDescription"
                  value={form.metaDescription}
                  onChange={handleChange}
                  placeholder="Short description for search engines"
                />
              </div>
            </div>

            <div className="cms-form-footer">
              <button
                type="button"
                className="cms-secondary-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="cms-primary-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="cms-button-spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2"></i>
                    {editingId ? "Update Page" : "Create Page"}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Page Register */}
      <section className="cms-register-section">
        <div className="cms-section-heading cms-register-heading">
          <div>
            <div className="cms-section-eyebrow">CONTENT REGISTER</div>
            <h2>Website Pages</h2>
          </div>

          <div className="cms-register-controls">
            <div className="cms-search-box">
              <i className="bi bi-search"></i>

              <input
                type="text"
                placeholder="Search pages..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              className="cms-filter-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All Statuses</option>

              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="cms-loading">
            <span className="cms-loading-spinner"></span>
            Loading CMS pages...
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="cms-empty">
            <div className="cms-empty-icon">
              <i className="bi bi-file-earmark-text"></i>
            </div>

            <h3>No CMS pages found</h3>

            <p>
              {pages.length === 0
                ? "Create your first website page to begin managing public content."
                : "No pages match the current search or status filter."}
            </p>

            {pages.length === 0 && (
              <button
                type="button"
                className="cms-primary-button"
                onClick={openCreateForm}
              >
                <i className="bi bi-plus-lg"></i>
                Create First Page
              </button>
            )}
          </div>
        ) : (
          <div className="cms-table-wrapper">
            <table className="cms-table">
              <thead>
                <tr>
                  <th>PAGE</th>
                  <th>TYPE</th>
                  <th>URL SLUG</th>
                  <th>STATUS</th>
                  <th>UPDATED</th>
                  <th className="cms-action-column">ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredPages.map((page) => (
                  <tr key={page._id}>
                    <td>
                      <div className="cms-page-name">
                        <div className="cms-page-icon">
                          <i className="bi bi-file-earmark-text"></i>
                        </div>

                        <div>
                          <strong>{page.pageTitle}</strong>

                          <span>
                            {page.metaTitle || "No SEO title"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="cms-type-label">
                        {page.pageType}
                      </span>
                    </td>

                    <td>
                      <code className="cms-slug">
                        /{page.slug}
                      </code>
                    </td>

                    <td>
                      <span className={getStatusClass(page.status)}>
                        <span></span>
                        {page.status}
                      </span>
                    </td>

                    <td>
                      <div className="cms-date">
                        {formatDate(page.updatedAt)}
                      </div>
                    </td>

                    <td>
                      <div className="cms-row-actions">
                        <button
                          type="button"
                          className="cms-row-action"
                          onClick={() => openEditForm(page)}
                          title="Edit page"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          type="button"
                          className="cms-row-action cms-row-delete"
                          onClick={() => handleDelete(page)}
                          title="Delete page"
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
}