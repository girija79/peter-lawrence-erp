import { useEffect, useState } from 'react';
import api from '../api/axios';

function Vendors() {
  const emptyForm = {
    vendorName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    serviceType: 'Other',
    contractDetails: '',
    paymentTerms: '',
    status: 'Active',
    notes: ''
  };

  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/vendors');
      setVendors(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to load vendors.'
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

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.vendorName.trim()) {
      setError('Vendor name is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (editingId) {
        await api.put(`/vendors/${editingId}`, form);
      } else {
        await api.post('/vendors', form);
      }

      await loadVendors();
      resetForm();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to save vendor.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (vendor) => {
    setForm({
      vendorName: vendor.vendorName || '',
      contactPerson: vendor.contactPerson || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      serviceType: vendor.serviceType || 'Other',
      contractDetails: vendor.contractDetails || '',
      paymentTerms: vendor.paymentTerms || '',
      status: vendor.status || 'Active',
      notes: vendor.notes || ''
    });

    setEditingId(vendor._id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this vendor?'
    );

    if (!confirmed) return;

    try {
      await api.delete(`/vendors/${id}`);
      await loadVendors();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to delete vendor.'
      );
    }
  };

  const getStatusClass = (status) => {
    return status === 'Active'
      ? 'status-active'
      : 'status-inactive';
  };

  const activeCount = vendors.filter(
    (vendor) => vendor.status === 'Active'
  ).length;

  const inactiveCount = vendors.filter(
    (vendor) => vendor.status === 'Inactive'
  ).length;

  const serviceTypes = new Set(
    vendors.map((vendor) => vendor.serviceType)
  ).size;

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <div className="eyebrow">Operations</div>

          <h1>Vendors</h1>

          <p className="page-description">
            Manage external service providers, contracts,
            payment terms and vendor relationships.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openAddForm}
        >
          <i className="bi bi-building-add me-2"></i>
          Add Vendor
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
            Total Vendors
          </div>

          <div className="summary-value">
            {vendors.length}
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
            Inactive
          </div>

          <div className="summary-value">
            {inactiveCount}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Service Categories
          </div>

          <div className="summary-value">
            {serviceTypes}
          </div>
        </div>

      </div>

      {showForm && (
        <div className="card lawyer-form-card">

          <div className="card-header">
            <h3>
              {editingId
                ? 'Edit Vendor'
                : 'Register Vendor'}
            </h3>

            <p>
              Enter vendor information, service details and
              commercial terms.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div>
                <label className="form-label">
                  Vendor Name *
                </label>

                <input
                  type="text"
                  name="vendorName"
                  className="form-control"
                  value={form.vendorName}
                  onChange={handleChange}
                  placeholder="e.g. Belgrade IT Solutions"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  Contact Person
                </label>

                <input
                  type="text"
                  name="contactPerson"
                  className="form-control"
                  value={form.contactPerson}
                  onChange={handleChange}
                  placeholder="Contact person's name"
                />
              </div>

              <div>
                <label className="form-label">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="vendor@example.com"
                />
              </div>

              <div>
                <label className="form-label">
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+381..."
                />
              </div>

              <div>
                <label className="form-label">
                  Service Type
                </label>

                <select
                  name="serviceType"
                  className="form-select"
                  value={form.serviceType}
                  onChange={handleChange}
                >
                  <option value="Legal Services">
                    Legal Services
                  </option>

                  <option value="IT Services">
                    IT Services
                  </option>

                  <option value="Office Supplies">
                    Office Supplies
                  </option>

                  <option value="Consulting">
                    Consulting
                  </option>

                  <option value="Maintenance">
                    Maintenance
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
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
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="form-grid-full">
                <label className="form-label">
                  Address
                </label>

                <textarea
                  name="address"
                  className="form-control"
                  rows="2"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Vendor office address"
                ></textarea>
              </div>

              <div>
                <label className="form-label">
                  Contract Details
                </label>

                <textarea
                  name="contractDetails"
                  className="form-control"
                  rows="3"
                  value={form.contractDetails}
                  onChange={handleChange}
                  placeholder="Contract number, duration or terms"
                ></textarea>
              </div>

              <div>
                <label className="form-label">
                  Payment Terms
                </label>

                <textarea
                  name="paymentTerms"
                  className="form-control"
                  rows="3"
                  value={form.paymentTerms}
                  onChange={handleChange}
                  placeholder="e.g. Monthly, Net 30"
                ></textarea>
              </div>

              <div className="form-grid-full">
                <label className="form-label">
                  Notes
                </label>

                <textarea
                  name="notes"
                  className="form-control"
                  rows="3"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Additional vendor notes"
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
                  ? 'Update Vendor'
                  : 'Save Vendor'}
              </button>

            </div>

          </form>
        </div>
      )}

      <div className="card">

        <div className="card-header">
          <h3>Vendor Register</h3>

          <p>
            {vendors.length} vendor
            {vendors.length !== 1 ? 's' : ''} registered
          </p>
        </div>

        {loading ? (
          <div className="empty-state">
            <i className="bi bi-hourglass-split"></i>

            <h3>Loading vendors...</h3>

            <p>
              Retrieving vendor records from the system.
            </p>
          </div>
        ) : vendors.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-building"></i>

            <h3>No vendors registered</h3>

            <p>
              Add the first vendor to begin managing
              external service providers.
            </p>
          </div>
        ) : (
          <div className="table-responsive">

            <table className="table">

              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Contact</th>
                  <th>Service</th>
                  <th>Contract</th>
                  <th>Status</th>
                  <th className="text-end">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {vendors.map((vendor) => (
                  <tr key={vendor._id}>

                    <td>
                      <div className="table-primary-text">
                        {vendor.vendorName}
                      </div>

                      {vendor.address && (
                        <div className="table-secondary-text">
                          {vendor.address}
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="table-primary-text">
                        {vendor.contactPerson || '—'}
                      </div>

                      <div className="table-secondary-text">
                        {vendor.email ||
                          vendor.phone ||
                          'No contact details'}
                      </div>
                    </td>

                    <td>
                      {vendor.serviceType}
                    </td>

                    <td>
                      <div className="table-primary-text">
                        {vendor.contractDetails
                          ? 'Available'
                          : 'Not specified'}
                      </div>

                      <div className="table-secondary-text">
                        {vendor.paymentTerms ||
                          'No payment terms'}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          vendor.status
                        )}`}
                      >
                        {vendor.status}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">

                        <button
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            handleEdit(vendor)
                          }
                          title="Edit vendor"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          className="btn btn-outline-danger"
                          onClick={() =>
                            handleDelete(vendor._id)
                          }
                          title="Delete vendor"
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

export default Vendors;