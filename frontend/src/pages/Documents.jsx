import { useEffect, useState } from 'react';
import api from '../api/axios';

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const emptyForm = {
    documentName: '',
    documentType: 'Other',
    clientId: '',
    caseId: '',
    fileName: '',
    fileUrl: '',
    description: '',
    status: 'Active'
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [documentsRes, clientsRes, casesRes] = await Promise.all([
        api.get('/documents'),
        api.get('/clients'),
        api.get('/cases')
      ]);

      setDocuments(documentsRes.data);
      setClients(clientsRes.data);
      setCases(casesRes.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to load documents.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.documentName || !form.clientId) {
      setError('Document name and client are required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = {
        ...form,
        caseId: form.caseId || null
      };

      if (editingId) {
        await api.put(`/documents/${editingId}`, payload);
      } else {
        await api.post('/documents', payload);
      }

      await loadData();
      resetForm();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to save document.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (document) => {
    setForm({
      documentName: document.documentName || '',
      documentType: document.documentType || 'Other',
      clientId: document.clientId?._id || document.clientId || '',
      caseId: document.caseId?._id || document.caseId || '',
      fileName: document.fileName || '',
      fileUrl: document.fileUrl || '',
      description: document.description || '',
      status: document.status || 'Active'
    });

    setEditingId(document._id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this document?'
    );

    if (!confirmed) return;

    try {
      await api.delete(`/documents/${id}`);
      await loadData();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to delete document.'
      );
    }
  };

  const getStatusClass = (status) => {
    if (status === 'Active') return 'status-active';
    if (status === 'Archived') return 'status-neutral';
    return 'status-neutral';
  };

  const getClientName = (document) => {
    return document.clientId?.fullName || '—';
  };

  const getCaseName = (document) => {
    if (!document.caseId) return 'No case linked';

    return (
      document.caseId.caseNumber ||
      document.caseId.title ||
      '—'
    );
  };

  const activeCount = documents.filter(
    (document) => document.status === 'Active'
  ).length;

  const archivedCount = documents.filter(
    (document) => document.status === 'Archived'
  ).length;

  const linkedCasesCount = documents.filter(
    (document) => document.caseId
  ).length;

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <div className="eyebrow">Legal Records</div>

          <h1>Documents</h1>

          <p className="page-description">
            Manage agreements, court documents, evidence and
            other legal records associated with clients and cases.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(true);
            setError('');
          }}
        >
          <i className="bi bi-file-earmark-plus me-2"></i>
          Add Document
        </button>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}

      <div className="summary-grid">

        <div className="summary-card">
          <div className="summary-label">
            Total Documents
          </div>

          <div className="summary-value">
            {documents.length}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Active
          </div>

          <div className="summary-value">
            {activeCount}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Archived
          </div>

          <div className="summary-value">
            {archivedCount}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Linked to Cases
          </div>

          <div className="summary-value">
            {linkedCasesCount}
          </div>
        </div>

      </div>

      {showForm && (
        <div className="card lawyer-form-card">

          <div className="card-header">
            <h3>
              {editingId
                ? 'Edit Document'
                : 'Add New Document'}
            </h3>

            <p>
              Enter the document details and associate it
              with the relevant client or legal case.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div>
                <label className="form-label">
                  Document Name *
                </label>

                <input
                  type="text"
                  name="documentName"
                  className="form-control"
                  value={form.documentName}
                  onChange={handleChange}
                  placeholder="e.g. Service Agreement"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  Document Type
                </label>

                <select
                  name="documentType"
                  className="form-select"
                  value={form.documentType}
                  onChange={handleChange}
                >
                  <option value="Agreement">Agreement</option>
                  <option value="Contract">Contract</option>
                  <option value="Court Document">
                    Court Document
                  </option>
                  <option value="Evidence">Evidence</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Identity Document">
                    Identity Document
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  Client *
                </label>

                <select
                  name="clientId"
                  className="form-select"
                  value={form.clientId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Client
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
                  Related Case
                </label>

                <select
                  name="caseId"
                  className="form-select"
                  value={form.caseId}
                  onChange={handleChange}
                >
                  <option value="">
                    No Case Linked
                  </option>

                  {cases.map((caseItem) => (
                    <option
                      key={caseItem._id}
                      value={caseItem._id}
                    >
                      {caseItem.caseNumber} — {caseItem.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">
                  File Name
                </label>

                <input
                  type="text"
                  name="fileName"
                  className="form-control"
                  value={form.fileName}
                  onChange={handleChange}
                  placeholder="e.g. contract-2026.pdf"
                />
              </div>

              <div>
                <label className="form-label">
                  File URL
                </label>

                <input
                  type="text"
                  name="fileUrl"
                  className="form-control"
                  value={form.fileUrl}
                  onChange={handleChange}
                  placeholder="Optional document URL"
                />
              </div>

              <div>
                <label className="form-label">
                  Status
                </label>

                <select
                  name="status"
                  className="form-select"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="form-grid-full">
                <label className="form-label">
                  Description
                </label>

                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Brief description of the document"
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
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId
                  ? 'Update Document'
                  : 'Save Document'}
              </button>

            </div>

          </form>
        </div>
      )}

      <div className="card">

        <div className="card-header d-flex justify-content-between align-items-center">

          <div>
            <h3>Document Register</h3>
            <p>
              {documents.length} document
              {documents.length !== 1 ? 's' : ''} recorded
            </p>
          </div>

        </div>

        {loading ? (
          <div className="empty-state">
            <i className="bi bi-hourglass-split"></i>
            <h3>Loading documents...</h3>
            <p>
              Retrieving document records from the system.
            </p>
          </div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-file-earmark-text"></i>

            <h3>No documents recorded</h3>

            <p>
              Add the first legal document to begin building
              the document register.
            </p>
          </div>
        ) : (
          <div className="table-responsive">

            <table className="table">

              <thead>
                <tr>
                  <th>Document</th>
                  <th>Client</th>
                  <th>Case</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="text-end">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {documents.map((document) => (
                  <tr key={document._id}>

                    <td>
                      <div className="table-primary-text">
                        {document.documentName}
                      </div>

                      {document.fileName && (
                        <div className="table-secondary-text">
                          {document.fileName}
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="table-primary-text">
                        {getClientName(document)}
                      </div>

                      {document.clientId?.email && (
                        <div className="table-secondary-text">
                          {document.clientId.email}
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="table-primary-text">
                        {getCaseName(document)}
                      </div>
                    </td>

                    <td>
                      {document.documentType}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          document.status
                        )}`}
                      >
                        {document.status}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">

                        {document.fileUrl && (
                          <a
                            href={document.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline-secondary"
                            title="Open document"
                          >
                            <i className="bi bi-box-arrow-up-right"></i>
                          </a>
                        )}

                        <button
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            handleEdit(document)
                          }
                          title="Edit document"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          className="btn btn-outline-danger"
                          onClick={() =>
                            handleDelete(document._id)
                          }
                          title="Delete document"
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

export default Documents;