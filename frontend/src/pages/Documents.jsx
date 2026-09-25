import { useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

function Documents() {
  const { user } = useContext(AuthContext);

  // ======================================================
  // ROLE CHECKS
  // ======================================================

  const isAdmin = user?.role === 'admin';
  const isHR = user?.role === 'hr';
  const isLawyer = user?.role === 'lawyer';
  const isEmployee = user?.role === 'employee';
  const isClient = user?.role === 'client';

  // Admin + HR can create and edit
  const canManageDocuments = isAdmin || isHR;

  // ======================================================
  // STATE
  // ======================================================

  const [documents, setDocuments] = useState([]);
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [error, setError] = useState('');

  // ======================================================
  // EMPTY FORM
  // ======================================================

  const emptyForm = {
    documentName: '',

    documentCategory: isHR
      ? 'Employee'
      : 'Legal',

    documentType: 'Other',

    clientId: '',
    employeeId: '',
    caseId: '',

    fileName: '',
    fileUrl: '',

    description: '',

    status: 'Active'
  };

  const [form, setForm] = useState(emptyForm);

  // ======================================================
  // LOAD DOCUMENTS
  // ======================================================

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError('');

      let response;

      // Employee → own documents
      if (isEmployee) {
        response = await api.get('/documents/me');
      }

      // Client → client documents
      else if (isClient) {
        response = await api.get(
          '/documents/my-client-documents'
        );
      }

      // Admin / HR / Lawyer
      else {
        response = await api.get('/documents');
      }

      setDocuments(response.data || []);

    } catch (err) {
      console.error(
        'LOAD DOCUMENTS ERROR:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Failed to load documents.'
      );

    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD MANAGEMENT DATA
  // ======================================================

  const loadManagementData = async () => {
    if (!canManageDocuments) return;

    try {
      const requests = [];

      // ADMIN
      // Admin can manage clients, cases and employees
      if (isAdmin) {
        requests.push(
          api.get('/clients'),
          api.get('/cases'),
          api.get('/employees')
        );
      }

      // HR
      // HR only needs employee records
      if (isHR) {
        requests.push(
          api.get('/employees')
        );
      }

      const responses = await Promise.all(
        requests
      );

      // ADMIN RESPONSE ORDER
      if (isAdmin) {
        setClients(
          responses[0]?.data || []
        );

        setCases(
          responses[1]?.data || []
        );

        setEmployees(
          responses[2]?.data || []
        );
      }

      // HR RESPONSE ORDER
      if (isHR) {
        setEmployees(
          responses[0]?.data || []
        );
      }

    } catch (err) {
      console.error(
        'LOAD DOCUMENT SUPPORT DATA ERROR:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Failed to load document management data.'
      );
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    if (!user) return;

    loadDocuments();
    loadManagementData();
  }, [user]);

  // ======================================================
  // FORM HANDLING
  // ======================================================

  const handleChange = (e) => {
    const {
      name,
      value
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ======================================================
  // CATEGORY CHANGE
  // ======================================================

  const handleCategoryChange = (e) => {
    const category = e.target.value;

    setForm((prev) => ({
      ...prev,
      documentCategory: category
    }));
  };

  // ======================================================
  // RESET FORM
  // ======================================================

  const resetForm = () => {
    setForm({
      ...emptyForm,
      documentCategory:
        isHR
          ? 'Employee'
          : 'Legal'
    });

    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  // ======================================================
  // OPEN CREATE FORM
  // ======================================================

  const openCreateForm = () => {
    setForm({
      ...emptyForm,
      documentCategory:
        isHR
          ? 'Employee'
          : 'Legal'
    });

    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  // ======================================================
  // CREATE / UPDATE DOCUMENT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canManageDocuments) return;

    setError('');

    // Document name
    if (!form.documentName.trim()) {
      setError(
        'Document name is required.'
      );

      return;
    }

    // At least one owner
    if (
      !form.employeeId &&
      !form.clientId
    ) {
      setError(
        'Please select an employee or client.'
      );

      return;
    }

    // Cannot have both
    if (
      form.employeeId &&
      form.clientId
    ) {
      setError(
        'A document cannot be assigned to both an employee and a client.'
      );

      return;
    }

    // Employee documents cannot have cases
    if (
      form.employeeId &&
      form.caseId
    ) {
      setError(
        'Employee documents cannot be linked to a legal case.'
      );

      return;
    }

    // HR restriction
    if (
      isHR &&
      !form.employeeId
    ) {
      setError(
        'HR documents must be assigned to an employee.'
      );

      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,

        clientId:
          form.clientId || null,

        employeeId:
          form.employeeId || null,

        caseId:
          form.caseId || null
      };

      if (editingId) {
        await api.put(
          `/documents/${editingId}`,
          payload
        );
      } else {
        await api.post(
          '/documents',
          payload
        );
      }

      await loadDocuments();

      resetForm();

    } catch (err) {
      console.error(
        'SAVE DOCUMENT ERROR:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Failed to save document.'
      );

    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // EDIT DOCUMENT
  // ======================================================

  const handleEdit = (document) => {
    if (!canManageDocuments) return;

    setForm({
      documentName:
        document.documentName || '',

      documentCategory:
        document.documentCategory ||
        (isHR
          ? 'Employee'
          : 'Legal'),

      documentType:
        document.documentType ||
        'Other',

      clientId:
        document.clientId?._id ||
        document.clientId ||
        '',

      employeeId:
        document.employeeId?._id ||
        document.employeeId ||
        '',

      caseId:
        document.caseId?._id ||
        document.caseId ||
        '',

      fileName:
        document.fileName || '',

      fileUrl:
        document.fileUrl || '',

      description:
        document.description || '',

      status:
        document.status || 'Active'
    });

    setEditingId(
      document._id
    );

    setShowForm(true);
    setError('');
  };

  // ======================================================
  // DELETE DOCUMENT
  // ADMIN ONLY
  // ======================================================

  const handleDelete = async (id) => {
    if (!isAdmin) return;

    const confirmed =
      window.confirm(
        'Are you sure you want to permanently delete this document?'
      );

    if (!confirmed) return;

    try {
      setError('');

      await api.delete(
        `/documents/${id}`
      );

      await loadDocuments();

    } catch (err) {
      console.error(
        'DELETE DOCUMENT ERROR:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Failed to delete document.'
      );
    }
  };

  // ======================================================
  // VIEW DOCUMENT DETAILS
  // ======================================================

  const handleView = async (document) => {
    try {
      setError('');

      const response =
        await api.get(
          `/documents/${document._id}`
        );

      setSelectedDocument(
        response.data
      );

      setShowDetails(true);

    } catch (err) {
      console.error(
        'VIEW DOCUMENT ERROR:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Failed to open document details.'
      );
    }
  };

  // ======================================================
  // FILTER DOCUMENTS
  // ======================================================

  const filteredDocuments = useMemo(() => {
    return documents.filter(
      (document) => {
        const searchText =
          search
            .toLowerCase()
            .trim();

        const employeeName =
          document.employeeId
            ?.fullName || '';

        const employeeCode =
          document.employeeId
            ?.employeeId || '';

        const clientName =
          document.clientId
            ?.fullName || '';

        const caseNumber =
          document.caseId
            ?.caseNumber || '';

        const documentName =
          document.documentName || '';

        const documentType =
          document.documentType || '';

        const matchesSearch =
          !searchText ||
          documentName
            .toLowerCase()
            .includes(searchText) ||
          documentType
            .toLowerCase()
            .includes(searchText) ||
          employeeName
            .toLowerCase()
            .includes(searchText) ||
          employeeCode
            .toLowerCase()
            .includes(searchText) ||
          clientName
            .toLowerCase()
            .includes(searchText) ||
          caseNumber
            .toLowerCase()
            .includes(searchText);

        const matchesCategory =
          categoryFilter === 'All' ||
          document.documentCategory ===
            categoryFilter;

        const matchesStatus =
          statusFilter === 'All' ||
          document.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus
        );
      }
    );
  }, [
    documents,
    search,
    categoryFilter,
    statusFilter
  ]);

  // ======================================================
  // SUMMARY
  // ======================================================

  const activeCount =
    documents.filter(
      (document) =>
        document.status === 'Active'
    ).length;

  const archivedCount =
    documents.filter(
      (document) =>
        document.status === 'Archived'
    ).length;

  const employeeDocumentCount =
    documents.filter(
      (document) =>
        document.employeeId
    ).length;

  const caseDocumentCount =
    documents.filter(
      (document) =>
        document.caseId
    ).length;

  // ======================================================
  // HELPERS
  // ======================================================

  const getStatusClass = (
    status
  ) => {
    if (status === 'Active') {
      return 'status-active';
    }

    return 'status-neutral';
  };

  const getCategoryBadgeClass = (
    category
  ) => {
    switch (category) {
      case 'HR':
      case 'Employee':
        return 'status-active';

      case 'Legal':
      case 'Case':
        return 'status-neutral';

      case 'Finance':
      case 'Identity':
      case 'Client':
      case 'Other':
      default:
        return 'status-neutral';
    }
  };

  const getOwnerName = (
    document
  ) => {
    if (document.employeeId) {
      return (
        document.employeeId.fullName ||
        'Employee'
      );
    }

    if (document.clientId) {
      return (
        document.clientId.fullName ||
        'Client'
      );
    }

    return '—';
  };

  const getOwnerType = (
    document
  ) => {
    if (document.employeeId) {
      return 'Employee';
    }

    if (document.clientId) {
      return 'Client';
    }

    return '—';
  };

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="page-container">

      {/* ==========================================
          PAGE HEADER
      ========================================== */}

      <div className="page-header">

        <div>

          <div className="eyebrow">
            {isHR
              ? 'Human Resources'
              : isEmployee
              ? 'Employee Records'
              : isClient
              ? 'Client Records'
              : isLawyer
              ? 'Legal Records'
              : 'Document Management'}
          </div>

          <h1>
            {isEmployee
              ? 'My Documents'
              : isClient
              ? 'My Documents'
              : isHR
              ? 'HR Documents'
              : 'Documents'}
          </h1>

          <p className="page-description">

            {isHR
              ? 'Manage employee records, HR documents and personnel files.'
              : isEmployee
              ? 'View documents assigned to your employee profile.'
              : isClient
              ? 'View documents associated with your client profile.'
              : isLawyer
              ? 'View documents associated with your assigned legal cases.'
              : 'Manage legal, client, employee and firm documents.'}

          </p>

        </div>

        {/* ADMIN + HR */}

        {canManageDocuments && (
          <button
            className="btn btn-primary"
            onClick={openCreateForm}
          >
            <i className="bi bi-file-earmark-plus me-2"></i>

            Add Document
          </button>
        )}

      </div>


      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}


      {/* ==========================================
          SUMMARY
      ========================================== */}

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
            Employee Documents
          </div>

          <div className="summary-value">
            {employeeDocumentCount}
          </div>

        </div>


        <div className="summary-card">

          <div className="summary-label">
            {isHR
              ? 'Case Documents'
              : 'Linked Cases'}
          </div>

          <div className="summary-value">
            {caseDocumentCount}
          </div>

        </div>

      </div>


      {/* ==========================================
          ADD / EDIT FORM
      ========================================== */}

      {canManageDocuments &&
        showForm && (

          <div className="card lawyer-form-card">

            <div className="card-header">

              <h3>
                {editingId
                  ? 'Edit Document'
                  : 'Add New Document'}
              </h3>

              <p>
                {isHR
                  ? 'Create or update an employee or HR document.'
                  : 'Create or update a legal, client or employee document.'}
              </p>

            </div>


            <form
              onSubmit={handleSubmit}
            >

              <div className="form-grid">

                {/* DOCUMENT NAME */}

                <div>

                  <label className="form-label">
                    Document Name *
                  </label>

                  <input
                    type="text"
                    name="documentName"
                    className="form-control"
                    value={
                      form.documentName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={
                      isHR
                        ? 'e.g. Employment Agreement'
                        : 'e.g. Client Agreement'
                    }
                    required
                  />

                </div>


                {/* CATEGORY */}

                <div>

                  <label className="form-label">
                    Document Category
                  </label>

                  <select
                    name="documentCategory"
                    className="form-select"
                    value={
                      form.documentCategory
                    }
                    onChange={
                      handleCategoryChange
                    }
                  >

                    {/* ADMIN */}

                    {isAdmin && (
                      <>
                        <option value="Legal">
                          Legal
                        </option>

                        <option value="Client">
                          Client
                        </option>

                        <option value="Case">
                          Case
                        </option>

                        <option value="Finance">
                          Finance
                        </option>

                        <option value="HR">
                          HR
                        </option>

                        <option value="Employee">
                          Employee
                        </option>

                        <option value="Identity">
                          Identity
                        </option>

                        <option value="Other">
                          Other
                        </option>
                      </>
                    )}

                    {/* HR */}

                    {isHR && (
                      <>
                        <option value="Employee">
                          Employee
                        </option>

                        <option value="HR">
                          HR
                        </option>

                        <option value="Identity">
                          Identity
                        </option>
                      </>
                    )}

                  </select>

                </div>


                {/* DOCUMENT TYPE */}

                <div>

                  <label className="form-label">
                    Document Type
                  </label>

                  <select
                    name="documentType"
                    className="form-select"
                    value={
                      form.documentType
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="Agreement">
                      Agreement
                    </option>

                    <option value="Contract">
                      Contract
                    </option>

                    <option value="Employment Contract">
                      Employment Contract
                    </option>

                    <option value="Offer Letter">
                      Offer Letter
                    </option>

                    <option value="Appointment Letter">
                      Appointment Letter
                    </option>

                    <option value="Identity Document">
                      Identity Document
                    </option>

                    <option value="Qualification Certificate">
                      Qualification Certificate
                    </option>

                    <option value="Experience Certificate">
                      Experience Certificate
                    </option>

                    <option value="Salary Document">
                      Salary Document
                    </option>

                    <option value="Policy Document">
                      Policy Document
                    </option>

                    <option value="Court Document">
                      Court Document
                    </option>

                    <option value="Evidence">
                      Evidence
                    </option>

                    <option value="Invoice">
                      Invoice
                    </option>

                    <option value="Case Document">
                      Case Document
                    </option>

                    <option value="HR Document">
                      HR Document
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>


                {/* EMPLOYEE */}

                <div>

                  <label className="form-label">
                    Employee
                    {isHR && ' *'}
                  </label>

                  <select
                    name="employeeId"
                    className="form-select"
                    value={
                      form.employeeId
                    }
                    onChange={(e) => {

                      handleChange(e);

                      if (
                        e.target.value
                      ) {

                        setForm(
                          (prev) => ({
                            ...prev,
                            clientId: '',
                            caseId: ''
                          })
                        );

                      }

                    }}
                  >

                    <option value="">
                      No Employee
                    </option>

                    {employees.map(
                      (employee) => (

                        <option
                          key={
                            employee._id
                          }
                          value={
                            employee._id
                          }
                        >

                          {
                            employee.fullName
                          }

                          {' — '}

                          {
                            employee.employeeId
                          }

                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* CLIENT — ADMIN ONLY */}

                {isAdmin && (
                  <div>

                    <label className="form-label">
                      Client
                    </label>

                    <select
                      name="clientId"
                      className="form-select"
                      value={
                        form.clientId
                      }
                      onChange={(e) => {

                        handleChange(e);

                        if (
                          e.target.value
                        ) {

                          setForm(
                            (prev) => ({
                              ...prev,
                              employeeId: '',
                              caseId: ''
                            })
                          );

                        }

                      }}
                    >

                      <option value="">
                        No Client
                      </option>

                      {clients.map(
                        (client) => (

                          <option
                            key={
                              client._id
                            }
                            value={
                              client._id
                            }
                          >
                            {
                              client.fullName
                            }
                          </option>

                        )
                      )}

                    </select>

                  </div>
                )}


                {/* CASE — ADMIN ONLY */}

                {isAdmin && (
                  <div>

                    <label className="form-label">
                      Related Case
                    </label>

                    <select
                      name="caseId"
                      className="form-select"
                      value={
                        form.caseId
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        !!form.employeeId ||
                        !!form.clientId
                      }
                    >

                      <option value="">
                        No Case Linked
                      </option>

                      {cases.map(
                        (caseItem) => (

                          <option
                            key={
                              caseItem._id
                            }
                            value={
                              caseItem._id
                            }
                          >

                            {
                              caseItem.caseNumber
                            }

                            {' — '}

                            {
                              caseItem.title
                            }

                          </option>

                        )
                      )}

                    </select>

                    {(form.employeeId ||
                      form.clientId) && (

                      <small className="text-muted">
                        A case cannot be linked when an employee or client is selected.
                      </small>

                    )}

                  </div>
                )}


                {/* FILE NAME */}

                <div>

                  <label className="form-label">
                    File Name
                  </label>

                  <input
                    type="text"
                    name="fileName"
                    className="form-control"
                    value={
                      form.fileName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. employment-contract.pdf"
                  />

                </div>


                {/* FILE URL */}

                <div>

                  <label className="form-label">
                    File URL
                  </label>

                  <input
                    type="url"
                    name="fileUrl"
                    className="form-control"
                    value={
                      form.fileUrl
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="https://..."
                  />

                </div>


                {/* STATUS */}

                <div>

                  <label className="form-label">
                    Status
                  </label>

                  <select
                    name="status"
                    className="form-select"
                    value={
                      form.status
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="Archived">
                      Archived
                    </option>

                  </select>

                </div>


                {/* DESCRIPTION */}

                <div className="form-grid-full">

                  <label className="form-label">
                    Description
                  </label>

                  <textarea
                    name="description"
                    className="form-control"
                    rows="3"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Brief description of the document"
                  ></textarea>

                </div>

              </div>


              {/* FORM ACTIONS */}

              <div className="form-actions">

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={
                    resetForm
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    saving
                  }
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


      {/* ==========================================
          FILTERS
      ========================================== */}

      <div className="card mb-4">

        <div className="card-header">

          <h3>
            Document Search & Filters
          </h3>

          <p>
            Search and filter document records.
          </p>

        </div>


        <div className="card-body">

          <div className="row g-3">

            {/* SEARCH */}

            <div className="col-md-6">

              <label className="form-label">
                Search
              </label>

              <input
                type="text"
                className="form-control"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search document, employee, client or case..."
              />

            </div>


            {/* CATEGORY */}

            <div className="col-md-3">

              <label className="form-label">
                Category
              </label>

              <select
                className="form-select"
                value={
                  categoryFilter
                }
                onChange={(e) =>
                  setCategoryFilter(
                    e.target.value
                  )
                }
              >

                <option value="All">
                  All Categories
                </option>

                <option value="Legal">
                  Legal
                </option>

                <option value="Client">
                  Client
                </option>

                <option value="Case">
                  Case
                </option>

                <option value="HR">
                  HR
                </option>

                <option value="Employee">
                  Employee
                </option>

                <option value="Finance">
                  Finance
                </option>

                <option value="Identity">
                  Identity
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>


            {/* STATUS */}

            <div className="col-md-3">

              <label className="form-label">
                Status
              </label>

              <select
                className="form-select"
                value={
                  statusFilter
                }
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >

                <option value="All">
                  All Statuses
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Archived">
                  Archived
                </option>

              </select>

            </div>

          </div>

        </div>

      </div>


      {/* ==========================================
          DOCUMENT REGISTER
      ========================================== */}

      <div className="card">

        <div className="card-header d-flex justify-content-between align-items-center">

          <div>

            <h3>
              {isEmployee ||
              isClient
                ? 'My Document Register'
                : isHR
                ? 'HR Document Register'
                : 'Document Register'}
            </h3>

            <p>
              {filteredDocuments.length}{' '}
              document
              {filteredDocuments.length !==
              1
                ? 's'
                : ''}{' '}
              shown
            </p>

          </div>

        </div>


        {/* LOADING */}

        {loading ? (

          <div className="empty-state">

            <i className="bi bi-hourglass-split"></i>

            <h3>
              Loading documents...
            </h3>

            <p>
              Retrieving document records from the system.
            </p>

          </div>

        ) : filteredDocuments.length ===
          0 ? (

          <div className="empty-state">

            <i className="bi bi-file-earmark-text"></i>

            <h3>
              No documents found
            </h3>

            <p>

              {documents.length === 0
                ? canManageDocuments
                  ? 'Add the first document to begin building the document register.'
                  : isEmployee
                  ? 'No documents have been assigned to your employee profile.'
                  : isClient
                  ? 'No documents are associated with your client profile.'
                  : 'No documents are currently available.'
                : 'No documents match your current search or filters.'}

            </p>

          </div>

        ) : (

          <div className="table-responsive">

            <table className="table">

              <thead>

                <tr>

                  <th>
                    Document
                  </th>

                  {!isEmployee &&
                    !isClient && (
                      <th>
                        Owner
                      </th>
                    )}

                  <th>
                    Category
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Case
                  </th>

                  <th>
                    Status
                  </th>

                  <th className="text-end">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredDocuments.map(
                  (document) => (

                    <tr
                      key={
                        document._id
                      }
                    >

                      {/* DOCUMENT */}

                      <td>

                        <div className="table-primary-text">
                          {
                            document.documentName
                          }
                        </div>

                        {document.fileName && (
                          <div className="table-secondary-text">
                            {
                              document.fileName
                            }
                          </div>
                        )}

                      </td>


                      {/* OWNER */}

                      {!isEmployee &&
                        !isClient && (

                          <td>

                            <div className="table-primary-text">
                              {
                                getOwnerName(
                                  document
                                )
                              }
                            </div>

                            <div className="table-secondary-text">
                              {
                                getOwnerType(
                                  document
                                )
                              }
                            </div>

                          </td>

                        )}


                      {/* CATEGORY */}

                      <td>

                        <span
                          className={`status-badge ${getCategoryBadgeClass(
                            document.documentCategory
                          )}`}
                        >
                          {
                            document.documentCategory ||
                            'Other'
                          }
                        </span>

                      </td>


                      {/* TYPE */}

                      <td>
                        {
                          document.documentType
                        }
                      </td>


                      {/* CASE */}

                      <td>

                        {document.caseId ? (

                          <>
                            <div className="table-primary-text">
                              {
                                document.caseId
                                  .caseNumber
                              }
                            </div>

                            {document.caseId
                              .title && (
                              <div className="table-secondary-text">
                                {
                                  document.caseId
                                    .title
                                }
                              </div>
                            )}
                          </>

                        ) : (
                          '—'
                        )}

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={`status-badge ${getStatusClass(
                            document.status
                          )}`}
                        >
                          {
                            document.status
                          }
                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="table-actions">

                          {/* VIEW */}

                          <button
                            className="btn btn-outline-secondary"
                            onClick={() =>
                              handleView(
                                document
                              )
                            }
                            title="View details"
                          >
                            <i className="bi bi-eye"></i>
                          </button>


                          {/* OPEN FILE */}

                          {document.fileUrl && (

                            <a
                              href={
                                document.fileUrl
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-outline-secondary"
                              title="Open document"
                            >
                              <i className="bi bi-box-arrow-up-right"></i>
                            </a>

                          )}


                          {/* EDIT — ADMIN + HR */}

                          {canManageDocuments && (

                            <button
                              className="btn btn-outline-secondary"
                              onClick={() =>
                                handleEdit(
                                  document
                                )
                              }
                              title="Edit document"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                          )}


                          {/* DELETE — ADMIN ONLY */}

                          {isAdmin && (

                            <button
                              className="btn btn-outline-danger"
                              onClick={() =>
                                handleDelete(
                                  document._id
                                )
                              }
                              title="Delete document"
                            >
                              <i className="bi bi-trash"></i>
                            </button>

                          )}

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


      {/* ==========================================
          DOCUMENT DETAILS MODAL
      ========================================== */}

      {showDetails &&
        selectedDocument && (

          <div
            className="modal fade show d-block"
            style={{
              backgroundColor:
                'rgba(0,0,0,0.5)'
            }}
          >

            <div className="modal-dialog modal-lg modal-dialog-centered">

              <div className="modal-content">

                <div className="modal-header">

                  <div>

                    <h5 className="modal-title">
                      {
                        selectedDocument.documentName
                      }
                    </h5>

                    <small className="text-muted">
                      Document Details
                    </small>

                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowDetails(
                        false
                      );

                      setSelectedDocument(
                        null
                      );
                    }}
                  ></button>

                </div>


                <div className="modal-body">

                  <div className="row g-4">

                    {/* CATEGORY */}

                    <div className="col-md-6">

                      <strong>
                        Category
                      </strong>

                      <div className="mt-1">
                        {
                          selectedDocument.documentCategory ||
                          'Other'
                        }
                      </div>

                    </div>


                    {/* TYPE */}

                    <div className="col-md-6">

                      <strong>
                        Document Type
                      </strong>

                      <div className="mt-1">
                        {
                          selectedDocument.documentType
                        }
                      </div>

                    </div>


                    {/* OWNER */}

                    <div className="col-md-6">

                      <strong>
                        Owner
                      </strong>

                      <div className="mt-1">
                        {
                          getOwnerName(
                            selectedDocument
                          )
                        }
                      </div>

                    </div>


                    {/* EMPLOYEE ID */}

                    {selectedDocument.employeeId && (

                      <div className="col-md-6">

                        <strong>
                          Employee ID
                        </strong>

                        <div className="mt-1">
                          {
                            selectedDocument
                              .employeeId
                              .employeeId
                          }
                        </div>

                      </div>

                    )}


                    {/* CASE */}

                    <div className="col-md-6">

                      <strong>
                        Related Case
                      </strong>

                      <div className="mt-1">

                        {selectedDocument.caseId
                          ? `${selectedDocument.caseId.caseNumber || ''} ${
                              selectedDocument.caseId.title || ''
                            }`
                          : 'No case linked'}

                      </div>

                    </div>


                    {/* STATUS */}

                    <div className="col-md-6">

                      <strong>
                        Status
                      </strong>

                      <div className="mt-1">

                        <span
                          className={`status-badge ${getStatusClass(
                            selectedDocument.status
                          )}`}
                        >
                          {
                            selectedDocument.status
                          }
                        </span>

                      </div>

                    </div>


                    {/* FILE */}

                    <div className="col-md-12">

                      <strong>
                        File
                      </strong>

                      <div className="mt-1">

                        {selectedDocument.fileName ||
                          'No file name provided'}

                        {selectedDocument.fileUrl && (

                          <a
                            href={
                              selectedDocument.fileUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-primary ms-3"
                          >
                            <i className="bi bi-box-arrow-up-right me-1"></i>
                            Open File
                          </a>

                        )}

                      </div>

                    </div>


                    {/* DESCRIPTION */}

                    <div className="col-md-12">

                      <strong>
                        Description
                      </strong>

                      <div className="mt-1 text-muted">

                        {
                          selectedDocument.description ||
                          'No description provided.'
                        }

                      </div>

                    </div>


                    {/* UPLOADED BY */}

                    {selectedDocument.uploadedBy && (

                      <div className="col-md-6">

                        <strong>
                          Added By
                        </strong>

                        <div className="mt-1">

                          {
                            selectedDocument
                              .uploadedBy
                              .name
                          }

                        </div>

                        <small className="text-muted">

                          {
                            selectedDocument
                              .uploadedBy
                              .role
                          }

                        </small>

                      </div>

                    )}


                    {/* CREATED DATE */}

                    <div className="col-md-6">

                      <strong>
                        Created
                      </strong>

                      <div className="mt-1">

                        {selectedDocument.createdAt
                          ? new Date(
                              selectedDocument.createdAt
                            ).toLocaleDateString()
                          : '—'}

                      </div>

                    </div>

                  </div>

                </div>


                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowDetails(
                        false
                      );

                      setSelectedDocument(
                        null
                      );
                    }}
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
}

export default Documents;