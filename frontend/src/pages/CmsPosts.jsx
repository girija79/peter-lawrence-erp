import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const initialForm = {
  title: "",
  slug: "",
  category: "Legal News",
  excerpt: "",
  content: "",
  featuredImage: "",
  author: "",
  publicationDate: "",
  status: "Draft",
  metaTitle: "",
  metaDescription: "",
};

const categories = [
  "Legal News",
  "Firm News",
  "Legal Insights",
  "Case Updates",
  "Announcements",
  "Events",
  "Other",
];

const statuses = ["Draft", "Published", "Archived"];

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toDateInputValue(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toISOString().split("T")[0];
}

function getStatusClass(status) {
  if (status === "Published") return "cms-post-status published";
  if (status === "Archived") return "cms-post-status archived";

  return "cms-post-status draft";
}

export default function CmsPosts() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cms-posts");

      setPosts(response.data || []);
    } catch (err) {
      console.error("Failed to fetch CMS posts:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load news and blog posts."
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
    fetchPosts();
    fetchUsers();
  }, []);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesSearch =
        !query ||
        post.title?.toLowerCase().includes(query) ||
        post.slug?.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All" ||
        post.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        post.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [posts, search, categoryFilter, statusFilter]);

  const totalPosts = posts.length;

  const publishedPosts = posts.filter(
    (post) => post.status === "Published"
  ).length;

  const draftPosts = posts.filter(
    (post) => post.status === "Draft"
  ).length;

  const archivedPosts = posts.filter(
    (post) => post.status === "Archived"
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

    if (!form.title.trim()) {
      setError("Post title is required.");
      return;
    }

    if (!form.slug.trim()) {
      setError("Slug is required.");
      return;
    }

    if (!form.excerpt.trim()) {
      setError("Excerpt is required.");
      return;
    }

    if (!form.content.trim()) {
      setError("Post content is required.");
      return;
    }

    if (!form.author) {
      setError("Please select an author.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim().toLowerCase(),
        category: form.category,
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        featuredImage: form.featuredImage.trim(),
        author: form.author,
        publicationDate: form.publicationDate || null,
        status: form.status,
        metaTitle: form.metaTitle.trim(),
        metaDescription: form.metaDescription.trim(),
      };

      if (editingId) {
        await api.put(`/cms-posts/${editingId}`, payload);

        setSuccess("News / blog post updated successfully.");
      } else {
        await api.post("/cms-posts", payload);

        setSuccess("News / blog post created successfully.");
      }

      resetForm();
      await fetchPosts();
    } catch (err) {
      console.error("Failed to save CMS post:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save the news / blog post."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (post) => {
    setError("");
    setSuccess("");

    setEditingId(post._id);

    setForm({
      title: post.title || "",
      slug: post.slug || "",
      category: post.category || "Legal News",
      excerpt: post.excerpt || "",
      content: post.content || "",
      featuredImage: post.featuredImage || "",
      author: post.author?._id || post.author || "",
      publicationDate: toDateInputValue(post.publicationDate),
      status: post.status || "Draft",
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this news / blog post?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/cms-posts/${id}`);

      setSuccess("News / blog post deleted successfully.");

      if (editingId === id) {
        resetForm();
      }

      await fetchPosts();
    } catch (err) {
      console.error("Failed to delete CMS post:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete the news / blog post."
      );
    }
  };

  const generateSlug = () => {
    const slug = form.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setForm((previous) => ({
      ...previous,
      slug,
    }));
  };

  return (
    <div className="cms-posts-page">
      <div className="cms-posts-container">

        {/* PAGE HEADER */}
        <div className="cms-posts-page-header">
          <div>
            <div className="cms-posts-eyebrow">
              WEBSITE CMS
            </div>

            <h1>News &amp; Blog Management</h1>

            <p>
              Create, publish, and manage legal news, firm updates,
              insights, announcements, and events.
            </p>
          </div>

          <button
            type="button"
            className="cms-posts-secondary-button"
            onClick={resetForm}
          >
            <i className="bi bi-plus-lg"></i>
            New Post
          </button>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="cms-posts-alert cms-posts-alert-error">
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
          <div className="cms-posts-alert cms-posts-alert-success">
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
        <div className="cms-posts-summary">
          <div className="cms-post-summary-card">
            <div className="cms-post-summary-icon">
              <i className="bi bi-newspaper"></i>
            </div>

            <div>
              <span>Total Posts</span>
              <strong>{totalPosts}</strong>
            </div>
          </div>

          <div className="cms-post-summary-card">
            <div className="cms-post-summary-icon published">
              <i className="bi bi-broadcast"></i>
            </div>

            <div>
              <span>Published</span>
              <strong>{publishedPosts}</strong>
            </div>
          </div>

          <div className="cms-post-summary-card">
            <div className="cms-post-summary-icon draft">
              <i className="bi bi-pencil-square"></i>
            </div>

            <div>
              <span>Drafts</span>
              <strong>{draftPosts}</strong>
            </div>
          </div>

          <div className="cms-post-summary-card">
            <div className="cms-post-summary-icon archived">
              <i className="bi bi-archive"></i>
            </div>

            <div>
              <span>Archived</span>
              <strong>{archivedPosts}</strong>
            </div>
          </div>
        </div>

        {/* FORM */}
        <section className="cms-posts-section">
          <div className="cms-posts-section-header">
            <div>
              <span className="cms-posts-section-eyebrow">
                {editingId ? "EDIT ARTICLE" : "CREATE ARTICLE"}
              </span>

              <h2>
                {editingId
                  ? "Edit News / Blog Post"
                  : "Create News / Blog Post"}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                className="cms-posts-cancel-button"
                onClick={resetForm}
              >
                Cancel Editing
              </button>
            )}
          </div>

          <form
            className="cms-posts-form"
            onSubmit={handleSubmit}
          >
            <div className="cms-posts-form-grid">

              {/* TITLE */}
              <div className="cms-posts-field cms-posts-field-wide">
                <label>
                  Post Title <span>*</span>
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter article title"
                />
              </div>

              {/* SLUG */}
              <div className="cms-posts-field">
                <label>
                  Slug <span>*</span>
                </label>

                <div className="cms-posts-slug-row">
                  <input
                    type="text"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="article-url-slug"
                  />

                  <button
                    type="button"
                    onClick={generateSlug}
                    title="Generate slug from title"
                  >
                    <i className="bi bi-magic"></i>
                  </button>
                </div>

                <small>
                  Example:{" "}
                  <strong>/news/new-legal-update</strong>
                </small>
              </div>

              {/* CATEGORY */}
              <div className="cms-posts-field">
                <label>Category</label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* AUTHOR */}
              <div className="cms-posts-field">
                <label>
                  Author <span>*</span>
                </label>

                <select
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                >
                  <option value="">
                    Select author
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

              {/* PUBLICATION DATE */}
              <div className="cms-posts-field">
                <label>Publication Date</label>

                <input
                  type="date"
                  name="publicationDate"
                  value={form.publicationDate}
                  onChange={handleChange}
                />
              </div>

              {/* STATUS */}
              <div className="cms-posts-field">
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

              {/* FEATURED IMAGE */}
              <div className="cms-posts-field cms-posts-field-wide">
                <label>Featured Image URL</label>

                <input
                  type="url"
                  name="featuredImage"
                  value={form.featuredImage}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />

                <small>
                  Image upload/storage can be integrated later.
                </small>
              </div>

              {/* EXCERPT */}
              <div className="cms-posts-field cms-posts-field-wide">
                <label>
                  Excerpt <span>*</span>
                </label>

                <textarea
                  name="excerpt"
                  value={form.excerpt}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Short summary shown in news/blog listings..."
                ></textarea>
              </div>

              {/* CONTENT */}
              <div className="cms-posts-field cms-posts-field-wide">
                <label>
                  Full Content <span>*</span>
                </label>

                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows="9"
                  placeholder="Write the complete article content..."
                ></textarea>

                <small>
                  Rich text editor can be added later for advanced
                  formatting.
                </small>
              </div>

              {/* SEO */}
              <div className="cms-posts-form-divider">
                <span>SEARCH ENGINE OPTIMIZATION</span>
              </div>

              <div className="cms-posts-field">
                <label>Meta Title</label>

                <input
                  type="text"
                  name="metaTitle"
                  value={form.metaTitle}
                  onChange={handleChange}
                  placeholder="SEO title"
                />
              </div>

              <div className="cms-posts-field">
                <label>Meta Description</label>

                <input
                  type="text"
                  name="metaDescription"
                  value={form.metaDescription}
                  onChange={handleChange}
                  placeholder="SEO description"
                />
              </div>
            </div>

            <div className="cms-posts-form-actions">
              <button
                type="button"
                className="cms-posts-cancel-button"
                onClick={resetForm}
              >
                Clear
              </button>

              <button
                type="submit"
                className="cms-posts-primary-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="cms-posts-spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2"></i>
                    {editingId
                      ? "Update Post"
                      : "Create Post"}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* POSTS REGISTER */}
        <section className="cms-posts-section">
          <div className="cms-posts-section-header">
            <div>
              <span className="cms-posts-section-eyebrow">
                CONTENT REGISTER
              </span>

              <h2>News &amp; Blog Posts</h2>
            </div>
          </div>

          {/* FILTERS */}
          <div className="cms-posts-toolbar">
            <div className="cms-posts-search">
              <i className="bi bi-search"></i>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search posts..."
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
            >
              <option value="All">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

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

            <button
              type="button"
              className="cms-posts-refresh-button"
              onClick={fetchPosts}
            >
              <i className="bi bi-arrow-clockwise"></i>
              Refresh
            </button>
          </div>

          {/* TABLE */}
          {loading ? (
            <div className="cms-posts-loading">
              <div className="cms-posts-spinner dark"></div>
              <p>Loading news and blog posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="cms-posts-empty">
              <div className="cms-posts-empty-icon">
                <i className="bi bi-newspaper"></i>
              </div>

              <h3>No posts found</h3>

              <p>
                Create your first news or blog post to
                populate the website content register.
              </p>
            </div>
          ) : (
            <div className="cms-posts-table-wrapper">
              <table className="cms-posts-table">
                <thead>
                  <tr>
                    <th>POST</th>
                    <th>CATEGORY</th>
                    <th>AUTHOR</th>
                    <th>PUBLICATION</th>
                    <th>STATUS</th>
                    <th>UPDATED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPosts.map((post) => (
                    <tr key={post._id}>
                      <td>
                        <div className="cms-post-identity">
                          {post.featuredImage ? (
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="cms-post-thumbnail"
                            />
                          ) : (
                            <div className="cms-post-thumbnail-placeholder">
                              <i className="bi bi-newspaper"></i>
                            </div>
                          )}

                          <div>
                            <strong>{post.title}</strong>

                            <span>
                              /{post.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="cms-post-category">
                          {post.category}
                        </span>
                      </td>

                      <td>
                        {post.author?.name || "—"}
                      </td>

                      <td>
                        {formatDate(
                          post.publicationDate
                        )}
                      </td>

                      <td>
                        <span
                          className={getStatusClass(
                            post.status
                          )}
                        >
                          {post.status}
                        </span>
                      </td>

                      <td>
                        {formatDate(post.updatedAt)}
                      </td>

                      <td>
                        <div className="cms-post-actions">
                          <button
                            type="button"
                            className="cms-post-action edit"
                            onClick={() =>
                              handleEdit(post)
                            }
                            title="Edit post"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          <button
                            type="button"
                            className="cms-post-action delete"
                            onClick={() =>
                              handleDelete(post._id)
                            }
                            title="Delete post"
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

          <div className="cms-posts-register-footer">
            Showing {filteredPosts.length} of {posts.length} posts
          </div>
        </section>
      </div>
    </div>
  );
}