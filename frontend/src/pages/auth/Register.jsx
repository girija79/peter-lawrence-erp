import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Public registration creates Client accounts
      await register(name, email, password, 'client');
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed'
      );
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center bg-light"
      style={{ padding: '40px 20px' }}
    >
      <div
        className="card border-0 shadow-sm"
        style={{
          width: '100%',
          maxWidth: '450px',
          borderRadius: '12px'
        }}
      >
        <div className="card-body p-4 p-md-5">

          {/* Logo / Brand */}
          <div className="text-center mb-4">

            <div
              className="d-inline-flex align-items-center justify-content-center bg-dark text-white rounded-circle mb-3"
              style={{
                width: '55px',
                height: '55px',
                fontSize: '24px'
              }}
            >
              <i className="bi bi-building"></i>
            </div>

            <h2 className="fw-bold mb-1">
              Peter Lawrence Legal CRM
            </h2>

            <p className="text-muted mb-0">
              Create your client account
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Full Name
              </label>

              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-person"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Email Address
              </label>

              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-envelope"></i>
                </span>

                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Password
              </label>

              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-lock"></i>
                </span>

                <input
                  type="password"
                  className="form-control"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="btn btn-dark w-100 py-2"
            >
              <i className="bi bi-person-plus me-2"></i>
              Create Account
            </button>

          </form>

          {/* Login Link */}
          <div className="text-center mt-4">
            <span className="text-muted">
              Already have an account?
            </span>{' '}
            <Link
              to="/login"
              className="text-decoration-none fw-semibold"
            >
              Sign In
            </Link>
          </div>

          {/* Small Information */}
          <div className="text-center mt-3">
            <small className="text-muted">
              New accounts are registered as Client accounts.
            </small>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;