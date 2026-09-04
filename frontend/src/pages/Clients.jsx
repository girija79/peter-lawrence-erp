import { useEffect, useState } from 'react';
import axios from 'axios';

function Clients() {

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


  // =========================
  // FETCH CLIENTS
  // =========================

  const fetchClients = async () => {

    try {

      const token = localStorage.getItem('token');

      const response = await axios.get(
        'http://localhost:5000/api/clients',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setClients(response.data);
      setError('');

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Failed to load clients'
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    fetchClients();
  }, []);


  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {

    setFullName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCompany('');

    setEditingClientId(null);
    setShowForm(false);

  };


  // =========================
  // CREATE / UPDATE CLIENT
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();
    setError('');

    try {

      const token = localStorage.getItem('token');

      const data = {
        fullName,
        email,
        phone,
        address,
        company
      };


      // UPDATE
      if (editingClientId) {

        await axios.put(
          `http://localhost:5000/api/clients/${editingClientId}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

      }

      // CREATE
      else {

        await axios.post(
          'http://localhost:5000/api/clients',
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

      }


      resetForm();

      await fetchClients();

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Failed to save client'
      );

    }
  };


  // =========================
  // EDIT CLIENT
  // =========================

  const handleEdit = (client) => {

    setEditingClientId(client._id);

    setFullName(client.fullName);
    setEmail(client.email);
    setPhone(client.phone || '');
    setAddress(client.address || '');
    setCompany(client.company || '');

    setError('');
    setShowForm(true);

  };


  // =========================
  // DELETE CLIENT
  // =========================

  const handleDelete = async (client) => {

    const confirmed = window.confirm(
      `Are you sure you want to delete ${client.fullName}?`
    );

    if (!confirmed) {
      return;
    }

    try {

      const token = localStorage.getItem('token');

      await axios.delete(
        `http://localhost:5000/api/clients/${client._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setClients((currentClients) =>
        currentClients.filter(
          (item) => item._id !== client._id
        )
      );

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Failed to delete client'
      );

    }
  };


  return (
    <div>

      {/* ================= HEADER ================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Client Management
          </h2>

          <p className="text-muted mb-0">
            Manage clients registered in the legal ERP system.
          </p>

        </div>


        <button
          className="btn btn-primary"
          onClick={() => {
            setError('');
            resetForm();
            setShowForm(true);
          }}
        >

          <i className="bi bi-person-plus me-2"></i>

          Add Client

        </button>

      </div>


      {/* ================= ERROR ================= */}

      {error && (

        <div className="alert alert-danger">

          {error}

        </div>

      )}


      {/* ================= FORM ================= */}

      {showForm && (

        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body">

            <div className="d-flex justify-content-between align-items-center mb-3">

              <h5 className="fw-bold mb-0">

                {editingClientId
                  ? 'Edit Client'
                  : 'Add New Client'}

              </h5>


              <button
                type="button"
                className="btn-close"
                onClick={resetForm}
              ></button>

            </div>


            <form onSubmit={handleSubmit}>

              <div className="row">


                {/* FULL NAME */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Full Name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter full name"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    required
                  />

                </div>


                {/* EMAIL */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Email
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                  />

                </div>


                {/* PHONE */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Phone
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                  />

                </div>


                {/* COMPANY */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Company
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter company name"
                    value={company}
                    onChange={(e) =>
                      setCompany(e.target.value)
                    }
                  />

                </div>


                {/* ADDRESS */}

                <div className="col-12 mb-3">

                  <label className="form-label">
                    Address
                  </label>

                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter address"
                    value={address}
                    onChange={(e) =>
                      setAddress(e.target.value)
                    }
                  ></textarea>

                </div>

              </div>


              {/* BUTTONS */}

              <div className="d-flex gap-2">

                <button
                  type="submit"
                  className="btn btn-primary"
                >

                  <i
                    className={`bi ${
                      editingClientId
                        ? 'bi-pencil'
                        : 'bi-person-plus'
                    } me-2`}
                  ></i>

                  {editingClientId
                    ? 'Update Client'
                    : 'Create Client'}

                </button>


                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >

                  Cancel

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ================= LOADING ================= */}

      {loading && (

        <div className="text-center py-5">

          <div
            className="spinner-border text-primary"
            role="status"
          ></div>

          <p className="text-muted mt-2">
            Loading clients...
          </p>

        </div>

      )}


      {/* ================= TABLE ================= */}

      {!loading && !error && (

        <div className="card border-0 shadow-sm">

          <div className="card-body">

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>

                  <tr>

                    <th>Client Name</th>

                    <th>Email</th>

                    <th>Phone</th>

                    <th>Company</th>

                    <th>Action</th>

                  </tr>

                </thead>


                <tbody>

                  {clients.length === 0 ? (

                    <tr>

                      <td
                        colSpan="5"
                        className="text-center py-4 text-muted"
                      >

                        No clients found.

                      </td>

                    </tr>

                  ) : (

                    clients.map((client) => (

                      <tr key={client._id}>

                        <td>

                          <div className="fw-semibold">

                            {client.fullName}

                          </div>

                        </td>


                        <td>
                          {client.email}
                        </td>


                        <td>
                          {client.phone || '-'}
                        </td>


                        <td>
                          {client.company || '-'}
                        </td>


                        <td>

                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            title="Edit Client"
                            onClick={() =>
                              handleEdit(client)
                            }
                          >

                            <i className="bi bi-pencil"></i>

                          </button>


                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete Client"
                            onClick={() =>
                              handleDelete(client)
                            }
                          >

                            <i className="bi bi-trash"></i>

                          </button>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Clients;