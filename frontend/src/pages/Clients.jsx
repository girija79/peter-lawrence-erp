import { useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

function Clients() {
  const { user } = useContext(AuthContext);

  const isAdmin = user?.role === 'admin';
  const isLawyer = user?.role === 'lawyer';

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingClientId, setEditingClientId] = useState(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [company, setCompany] = useState('');

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/clients');

      setClients(response.data);

    } catch (err) {
      console.error('Fetch Clients Error:', err);

      setError(
        err.response?.data?.message ||
        'Failed to load clients'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCompany('');

    setEditingClientId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) return;

    setError('');

    try {
      const data = {
        fullName,
        email,
        phone,
        address,
        company
      };

      if (editingClientId) {
        await api.put(
          `/clients/${editingClientId}`,
          data
        );
      } else {
        await api.post(
          '/clients',
          data
        );
      }

      resetForm();

      await fetchClients();

    } catch (err) {
      console.error('Save Client Error:', err);

      setError(
        err.response?.data?.message ||
        'Failed to save client'
      );
    }
  };

  const handleEdit = (client) => {
    if (!isAdmin) return;

    setEditingClientId(client._id);

    setFullName(client.fullName || '');
    setEmail(client.email || '');
    setPhone(client.phone || '');
    setAddress(client.address || '');
    setCompany(client.company || '');

    setError('');
    setShowForm(true);
  };

  const handleDelete = async (client) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${client.fullName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      await api.delete(
        `/clients/${client._id}`
      );

      setClients((currentClients) =>
        currentClients.filter(
          (item) => item._id !== client._id
        )
      );

    } catch (err) {
      console.error('Delete Client Error:', err);

      setError(
        err.response?.data?.message ||
        'Failed to delete client'
      );
    }
  };

  return (
    <div className="clients-page">

      {/* PAGE HEADER */}
      <div className="page-header clients-header">

        <div>
          <div className="page-kicker">
            {isLawyer
              ? 'WORKSPACE · CLIENT RELATIONS'
              : 'WORKSPACE · CLIENT RELATIONS'}
          </div>

          <h1 className="page-title">
            {isLawyer ? 'My Clients' : 'Clients'}
          </h1>

          <p className="page-description">
            {isLawyer
              ? 'Review clients connected to your assigned legal matters.'
              : 'Maintain client records and contact information for the Peter Lawrence legal office.'
            }
          </p>
        </div>

        {/* ADMIN ONLY */}
        {isAdmin && (
          <button
            className="pl-button pl-button-primary"
            onClick={() => {
              setError('');
              resetForm();
              setShowForm(true);
            }}
          >
            <i className="bi bi-person-plus"></i>
            Add client
          </button>
        )}

      </div>


      {/* SUMMARY */}
      <div className="users-summary clients-summary">

        <div className="users-summary-item">
          <span>
            {isLawyer ? 'My clients' : 'Total clients'}
          </span>

          <strong>
            {clients.length}
          </strong>
        </div>

        <div className="users-summary-divider"></div>

        <div className="users-summary-item">
          <span>With company</span>

          <strong>
            {clients.filter(
              (client) => client.company
            ).length}
          </strong>
        </div>

        <div className="users-summary-divider"></div>

        <div className="users-summary-item">
          <span>Individuals</span>

          <strong>
            {clients.filter(
              (client) => !client.company
            ).length}
          </strong>
        </div>

      </div>


      {/* ERROR */}
      {error && (
        <div className="pl-alert pl-alert-danger">
          <i className="bi bi-exclamation-circle"></i>

          <span>
            {error}
          </span>
        </div>
      )}


      {/* ADMIN ONLY — ADD / EDIT FORM */}
      {isAdmin && showForm && (
        <div className="pl-form-panel">

          <div className="pl-form-header">

            <div>
              <div className="page-kicker">
                CLIENT RECORD
              </div>

              <h2>
                {editingClientId
                  ? 'Edit client'
                  : 'Add client'}
              </h2>
            </div>

            <button
              type="button"
              className="pl-close-button"
              onClick={resetForm}
              aria-label="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>

          </div>


          <form onSubmit={handleSubmit}>

            <div className="pl-form-grid">

              {/* FULL NAME */}
              <div className="pl-form-field">

                <label htmlFor="client-name">
                  Full name
                </label>

                <input
                  id="client-name"
                  type="text"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  required
                />

              </div>


              {/* EMAIL */}
              <div className="pl-form-field">

                <label htmlFor="client-email">
                  Email address
                </label>

                <input
                  id="client-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

              </div>


              {/* PHONE */}
              <div className="pl-form-field">

                <label htmlFor="client-phone">
                  Phone number
                </label>

                <input
                  id="client-phone"
                  type="text"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                />

              </div>


              {/* COMPANY */}
              <div className="pl-form-field">

                <label htmlFor="client-company">
                  Company
                </label>

                <input
                  id="client-company"
                  type="text"
                  placeholder="Company name (optional)"
                  value={company}
                  onChange={(e) =>
                    setCompany(e.target.value)
                  }
                />

              </div>


              {/* ADDRESS */}
              <div className="pl-form-field pl-form-field-full">

                <label htmlFor="client-address">
                  Address
                </label>

                <textarea
                  id="client-address"
                  rows="3"
                  placeholder="Enter client address"
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                ></textarea>

              </div>

            </div>


            <div className="pl-form-actions">

              <button
                type="submit"
                className="pl-button pl-button-primary"
              >
                <i
                  className={`bi ${
                    editingClientId
                      ? 'bi-check2'
                      : 'bi-person-plus'
                  }`}
                ></i>

                {editingClientId
                  ? 'Save changes'
                  : 'Create client'}
              </button>

              <button
                type="button"
                className="pl-button pl-button-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}


      {/* LOADING */}
      {loading && (
        <div className="pl-loading">

          <div className="pl-loading-line"></div>

          <p>
            Loading client records...
          </p>

        </div>
      )}


      {/* CLIENT TABLE */}
      {!loading && (
        <div className="pl-table-panel">

          <div className="pl-table-header">

            <div>
              <div className="page-kicker">
                {isLawyer
                  ? 'ASSIGNED CLIENTS'
                  : 'CLIENT DIRECTORY'}
              </div>

              <h2>
                {isLawyer
                  ? 'My client records'
                  : 'Client records'}
              </h2>
            </div>

            <span className="pl-record-count">
              {clients.length}{' '}
              {clients.length === 1
                ? 'record'
                : 'records'}
            </span>

          </div>


          <div className="table-responsive">

            <table className="pl-table">

              <thead>

                <tr>
                  <th>CLIENT</th>
                  <th>EMAIL</th>
                  <th>PHONE</th>
                  <th>COMPANY</th>

                  {/* ADMIN ONLY */}
                  {isAdmin && (
                    <th className="text-end">
                      ACTIONS
                    </th>
                  )}
                </tr>

              </thead>


              <tbody>

                {clients.length === 0 ? (

                  <tr>

                    <td
                      colSpan={isAdmin ? 5 : 4}
                      className="pl-empty-state"
                    >

                      <i className="bi bi-person-vcard"></i>

                      <strong>
                        {isLawyer
                          ? 'No assigned clients'
                          : 'No client records'}
                      </strong>

                      <span>
                        {isLawyer
                          ? 'Clients connected to your assigned cases will appear here.'
                          : 'Add a client using the button above.'}
                      </span>

                    </td>

                  </tr>

                ) : (

                  clients.map((client) => (

                    <tr key={client._id}>

                      {/* CLIENT */}
                      <td>

                        <div className="user-cell">

                          <div className="user-avatar">
                            {client.fullName
                              ?.charAt(0)
                              ?.toUpperCase() || 'C'}
                          </div>

                          <div>

                            <strong>
                              {client.fullName}
                            </strong>

                            <span>
                              Client
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* EMAIL */}
                      <td>
                        <span className="user-email">
                          {client.email}
                        </span>
                      </td>


                      {/* PHONE */}
                      <td>
                        <span className="user-email">
                          {client.phone || '—'}
                        </span>
                      </td>


                      {/* COMPANY */}
                      <td>

                        {client.company ? (

                          <span className="client-company">
                            {client.company}
                          </span>

                        ) : (

                          <span className="client-empty-value">
                            Individual
                          </span>

                        )}

                      </td>


                      {/* ADMIN ACTIONS */}
                      {isAdmin && (
                        <td>

                          <div className="user-actions">

                            <button
                              className="user-action-button"
                              title="Edit client"
                              onClick={() =>
                                handleEdit(client)
                              }
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                            <button
                              className="user-action-button user-action-delete"
                              title="Delete client"
                              onClick={() =>
                                handleDelete(client)
                              }
                            >
                              <i className="bi bi-trash3"></i>
                            </button>

                          </div>

                        </td>
                      )}

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>
      )}

    </div>
  );
}

export default Clients;