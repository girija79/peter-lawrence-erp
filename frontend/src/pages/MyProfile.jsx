import { useEffect, useState } from "react";
import api from "../api/axios";

function MyProfile() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const res = await api.get("/employees/me");
        setEmployee(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load your profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyProfile();
  }, []);

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border" role="status"></div>
          <p className="mt-2">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          Employee profile not found.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          <i className="bi bi-person-circle me-2"></i>
          My Profile
        </h2>
        <p className="text-muted mb-0">
          View your employee information and employment details.
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center">

            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
              style={{
                width: "70px",
                height: "70px",
                fontSize: "28px"
              }}
            >
              {employee.fullName?.charAt(0)?.toUpperCase()}
            </div>

            <div>
              <h4 className="fw-bold mb-1">
                {employee.fullName}
              </h4>

              <p className="text-muted mb-1">
                {employee.designation}
              </p>

              <span
                className={`badge ${
                  employee.status === "Active"
                    ? "bg-success"
                    : "bg-secondary"
                }`}
              >
                {employee.status}
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">
            <i className="bi bi-person me-2"></i>
            Personal Information
          </h5>
        </div>

        <div className="card-body">
          <div className="row g-4">

            <div className="col-md-6">
              <label className="text-muted small">
                Employee ID
              </label>
              <div className="fw-semibold">
                {employee.employeeId}
              </div>
            </div>

            <div className="col-md-6">
              <label className="text-muted small">
                Full Name
              </label>
              <div className="fw-semibold">
                {employee.fullName}
              </div>
            </div>

            <div className="col-md-6">
              <label className="text-muted small">
                Email
              </label>
              <div className="fw-semibold">
                {employee.email}
              </div>
            </div>

            <div className="col-md-6">
              <label className="text-muted small">
                Phone
              </label>
              <div className="fw-semibold">
                {employee.phone || "Not provided"}
              </div>
            </div>

            <div className="col-md-12">
              <label className="text-muted small">
                Address
              </label>
              <div className="fw-semibold">
                {employee.address || "Not provided"}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">
            <i className="bi bi-briefcase me-2"></i>
            Employment Information
          </h5>
        </div>

        <div className="card-body">
          <div className="row g-4">

            <div className="col-md-6">
              <label className="text-muted small">
                Department
              </label>
              <div className="fw-semibold">
                {employee.department}
              </div>
            </div>

            <div className="col-md-6">
              <label className="text-muted small">
                Designation
              </label>
              <div className="fw-semibold">
                {employee.designation}
              </div>
            </div>

            <div className="col-md-6">
              <label className="text-muted small">
                Joining Date
              </label>
              <div className="fw-semibold">
                {employee.joiningDate
                  ? new Date(employee.joiningDate).toLocaleDateString()
                  : "Not provided"}
              </div>
            </div>

            <div className="col-md-6">
              <label className="text-muted small">
                Employment Type
              </label>
              <div className="fw-semibold">
                {employee.employmentType}
              </div>
            </div>

            <div className="col-md-6">
              <label className="text-muted small">
                Reporting Manager
              </label>
              <div className="fw-semibold">
                {employee.reportingManager || "Not provided"}
              </div>
            </div>

            <div className="col-md-6">
              <label className="text-muted small">
                Salary
              </label>
              <div className="fw-semibold">
                {employee.salary?.toLocaleString()} 
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

export default MyProfile;