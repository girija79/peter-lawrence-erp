import { useEffect, useState } from 'react';
import api from '../api/axios';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [lawyers, setLawyers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const [formData, setFormData] = useState({
    clientId: '',
    lawyerId: '',
    title: '',
    appointmentType: 'Client Meeting',
    appointmentDate: '',
    location: '',
    status: 'Scheduled',
    purpose: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        appointmentsResponse,
        clientsResponse,
        lawyersResponse
      ] = await Promise.all([
        api.get('/appointments'),
        api.get('/clients'),
        api.get('/lawyers')
      ]);

      setAppointments(appointmentsResponse.data);
      setClients(clientsResponse.data);
      setLawyers(lawyersResponse.data);
    } catch (err) {
      console.error('Fetch Appointments Error:', err);

      setError(
        err.response?.data?.message ||
        'Failed to load appointment data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      clientId: '',
      lawyerId: '',
      title: '',
      appointmentType: 'Client Meeting',
      appointmentDate: '',
      location: '',
      status: 'Scheduled',
      purpose: '',
      notes: ''
    });
  };

  const handleAdd = () => {
    setEditingAppointment(null);
    resetForm();
    setShowForm(true);
    setError('');
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);

    setFormData({
      clientId: appointment.clientId?._id || '',
      lawyerId: appointment.lawyerId?._id || '',
      title: appointment.title || '',
      appointmentType:
        appointment.appointmentType || 'Client Meeting',
      appointmentDate: appointment.appointmentDate
        ? appointment.appointmentDate.slice(0, 16)
        : '',
      location: appointment.location || '',
      status: appointment.status || 'Scheduled',
      purpose: appointment.purpose || '',
      notes: appointment.notes || ''
    });

    setShowForm(true);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');

      if (editingAppointment) {
        await api.put(
          `/appointments/${editingAppointment._id}`,
          formData
        );
      } else {
        await api.post('/appointments', formData);
      }

      setShowForm(false);
      setEditingAppointment(null);
      resetForm();

      await fetchData();
    } catch (err) {
      console.error('Save Appointment Error:', err);

      setError(
        err.response?.data?.message ||
        'Failed to save appointment.'
      );
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this appointment?'
    );

    if (!confirmed) return;

    try {
      setError('');

      await api.delete(`/appointments/${id}`);

      await fetchData();
    } catch (err) {
      console.error('Delete Appointment Error:', err);

      setError(
        err.response?.data?.message ||
        'Failed to delete appointment.'
      );
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'status-info';

      case 'Completed':
        return 'status-active';

      case 'Rescheduled':
        return 'status-warning';

      case 'Cancelled':
        return 'status-inactive';

      default:
        return 'status-neutral';
    }
  };

  const totalAppointments = appointments.length;

  const scheduledAppointments = appointments.filter(
    (item) => item.status === 'Scheduled'
  ).length;

  const completedAppointments = appointments.filter(
    (item) => item.status === 'Completed'
  ).length;

  const cancelledAppointments = appointments.filter(
    (item) => item.status === 'Cancelled'
  ).length;

  const formatDateTime = (date) => {
    if (!date) return '—';

    return new Date(date).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <i className="bi bi-hourglass-split"></i>
          <h3>Loading appointments</h3>
          <p>
            Please wait while appointment records are being loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">

      {/* PAGE HEADER */}
      <div className="page-header">

        <div>
          <p className="eyebrow">SCHEDULE & PROCEEDINGS</p>

          <h1>Appointments</h1>

          <p className="page-description">
            Manage client meetings, consultations, court hearings
            and other scheduled legal appointments.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAdd}
        >
          <i className="bi bi-calendar-plus me-2"></i>
          New Appointment
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="summary-grid">

        <div className="summary-card">
          <div className="summary-label">
            Total Appointments
          </div>

          <div className="summary-value">
            {totalAppointments}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Scheduled
          </div>

          <div className="summary-value">
            {scheduledAppointments}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Completed
          </div>

          <div className="summary-value">
            {completedAppointments}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Cancelled
          </div>

          <div className="summary-value">
            {cancelledAppointments}
          </div>
        </div>

      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="content-card lawyer-form-card">

          <div className="card-header">

            <div>
              <p className="eyebrow">
                {editingAppointment
                  ? 'APPOINTMENT UPDATE'
                  : 'APPOINTMENT REGISTRATION'}
              </p>

              <h2>
                {editingAppointment
                  ? 'Edit Appointment'
                  : 'Schedule Appointment'}
              </h2>
            </div>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div>
                <label className="form-label">
                  Client
                </label>

                <select
                  name="clientId"
                  className="form-select"
                  value={formData.clientId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select client
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
                  Lawyer
                </label>

                <select
                  name="lawyerId"
                  className="form-select"
                  value={formData.lawyerId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select lawyer
                  </option>

                  {lawyers.map((lawyer) => (
                    <option
                      key={lawyer._id}
                      value={lawyer._id}
                    >
                      {lawyer.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">
                  Appointment Title
                </label>

                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter appointment title"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  Appointment Type
                </label>

                <select
                  name="appointmentType"
                  className="form-select"
                  value={formData.appointmentType}
                  onChange={handleChange}
                >
                  <option value="Client Meeting">
                    Client Meeting
                  </option>

                  <option value="Court Hearing">
                    Court Hearing
                  </option>

                  <option value="Consultation">
                    Consultation
                  </option>

                  <option value="Internal Meeting">
                    Internal Meeting
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  Date & Time
                </label>

                <input
                  type="datetime-local"
                  name="appointmentDate"
                  className="form-control"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  Status
                </label>

                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Scheduled">
                    Scheduled
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>

                  <option value="Rescheduled">
                    Rescheduled
                  </option>
                </select>
              </div>

              <div className="form-grid-full">
                <label className="form-label">
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  className="form-control"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Office, court or online meeting"
                />
              </div>

              <div className="form-grid-full">
                <label className="form-label">
                  Purpose
                </label>

                <textarea
                  name="purpose"
                  className="form-control"
                  rows="3"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="Reason for the appointment"
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
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional appointment notes"
                ></textarea>
              </div>

            </div>

            <div className="form-actions">

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingAppointment(null);
                  resetForm();
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
              >
                <i className="bi bi-check2 me-2"></i>

                {editingAppointment
                  ? 'Update Appointment'
                  : 'Schedule Appointment'}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* APPOINTMENT REGISTER */}
      <div className="content-card">

        <div className="card-header">

          <div>
            <p className="eyebrow">APPOINTMENT REGISTER</p>

            <h2>Scheduled Appointments</h2>
          </div>

          <span className="record-count">
            {totalAppointments} records
          </span>

        </div>

        {appointments.length === 0 ? (

          <div className="empty-state">
            <i className="bi bi-calendar-x"></i>

            <h3>No appointments recorded</h3>

            <p>
              Schedule the first appointment to begin the
              firm's appointment register.
            </p>
          </div>

        ) : (

          <div className="table-responsive">

            <table className="table">

              <thead>
                <tr>
                  <th>Appointment</th>
                  <th>Client</th>
                  <th>Lawyer</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>

                {appointments.map((appointment) => (

                  <tr key={appointment._id}>

                    <td>
                      <div className="table-primary-text">
                        {appointment.title}
                      </div>

                      <div className="table-secondary-text">
                        {appointment.location || 'Location not specified'}
                      </div>
                    </td>

                    <td>
                      <div className="table-primary-text">
                        {appointment.clientId?.fullName || '—'}
                      </div>

                      <div className="table-secondary-text">
                        {appointment.clientId?.email || ''}
                      </div>
                    </td>

                    <td>
                      <div className="table-primary-text">
                        {appointment.lawyerId?.fullName || '—'}
                      </div>

                      <div className="table-secondary-text">
                        {appointment.lawyerId?.specialization || ''}
                      </div>
                    </td>

                    <td>
                      <div className="table-primary-text">
                        {formatDateTime(
                          appointment.appointmentDate
                        )}
                      </div>
                    </td>

                    <td>
                      {appointment.appointmentType}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </td>

                    <td>

                      <div className="table-actions">

                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          title="Edit appointment"
                          onClick={() =>
                            handleEdit(appointment)
                          }
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          title="Delete appointment"
                          onClick={() =>
                            handleDelete(appointment._id)
                          }
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

export default Appointments;