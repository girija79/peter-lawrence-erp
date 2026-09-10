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
    <div className="auth-page">

      {/* Left Branding Panel */}
      <section className="auth-brand-panel">

        <div className="auth-brand">
          <div className="auth-brand-mark">PL</div>

          <div>
            <div className="auth-brand-name">
              Peter Lawrence
            </div>

            <div className="auth-brand-subtitle">
              Legal ERP & CRM
            </div>
          </div>
        </div>

        <div className="auth-brand-content">
          <div className="auth-kicker">
            PETER LAW FIRM · BELGRADE
          </div>

          <h1>
            Your legal
            <br />
            <em>matter starts here.</em>
          </h1>

          <p>
            Create your client account to stay connected
            with your legal matters, appointments,
            documents and payment information.
          </p>
        </div>

        <div className="auth-brand-footer">
          <span>PRIVATE FIRM WORKSPACE</span>
          <span>© Peter Lawrence</span>
        </div>

      </section>


      {/* Registration Form Panel */}
      <section className="auth-form-panel">

        <div className="auth-form-container">

          {/* Mobile Brand */}
          <div className="auth-mobile-brand">
            <div className="auth-brand-mark">PL</div>

            <div>
              <div className="auth-brand-name">
                Peter Lawrence
              </div>

              <div className="auth-brand-subtitle">
                Legal ERP & CRM
              </div>
            </div>
          </div>


          {/* Heading */}
          <div className="auth-form-heading">

            <span className="auth-form-kicker">
              CLIENT REGISTRATION
            </span>

            <h2>Create your account.</h2>

            <p>
              Set up your client access to the firm workspace.
            </p>

          </div>


          {/* Error */}
          {error && (
            <div className="auth-error">
              <i className="bi bi-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}


          {/* Registration Form */}
          <form onSubmit={handleSubmit}>

            {/* Full Name */}
            <div className="auth-field">

              <label htmlFor="register-name">
                Full name
              </label>

              <div className="auth-input-wrapper">

                <i className="bi bi-person"></i>

                <input
                  id="register-name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

              </div>

            </div>


            {/* Email */}
            <div className="auth-field">

              <label htmlFor="register-email">
                Email address
              </label>

              <div className="auth-input-wrapper">

                <i className="bi bi-envelope"></i>

                <input
                  id="register-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

              </div>

            </div>


            {/* Password */}
            <div className="auth-field">

              <div className="auth-label-row">

                <label htmlFor="register-password">
                  Password
                </label>

                <span>
                  Secure account access
                </span>

              </div>

              <div className="auth-input-wrapper">

                <i className="bi bi-lock"></i>

                <input
                  id="register-password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

              </div>

            </div>


            {/* Account Type */}
            <div className="auth-account-note">

              <div className="auth-account-note-icon">
                <i className="bi bi-person-vcard"></i>
              </div>

              <div>
                <strong>Client account</strong>

                <span>
                  New public registrations are created as
                  client accounts.
                </span>
              </div>

            </div>


            {/* Submit */}
            <button
              type="submit"
              className="auth-submit"
            >
              <span>Create client account</span>
              <i className="bi bi-arrow-right"></i>
            </button>

          </form>


          {/* Login Link */}
          <div className="auth-register">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign in
              <i className="bi bi-arrow-up-right"></i>
            </Link>

          </div>


          {/* Security */}
          <div className="auth-security">

            <i className="bi bi-shield-check"></i>

            <div>
              <strong>Protected workspace</strong>

              <span>
                Your access is controlled according to
                your assigned role.
              </span>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Register;