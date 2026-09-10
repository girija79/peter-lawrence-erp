import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Login failed'
      );
    }
  };

  return (
    <div className="auth-page">

      {/* =====================================================
          LEFT — FIRM BRANDING
          ===================================================== */}

      <section className="auth-brand-panel">

        <div className="auth-brand">

          <div className="auth-brand-mark">
            PL
          </div>

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
            Legal work,
            <br />
            <em>organised.</em>
          </h1>

          <p>
            A central workspace for managing clients,
            cases, documents, appointments and the
            day-to-day operations of the firm.
          </p>

        </div>


        <div className="auth-brand-footer">
          <span>
            PRIVATE FIRM WORKSPACE
          </span>

          <span>
            © Peter Lawrence
          </span>
        </div>

      </section>


      {/* =====================================================
          RIGHT — LOGIN FORM
          ===================================================== */}

      <section className="auth-form-panel">

        <div className="auth-form-container">

          <div className="auth-mobile-brand">
            <div className="auth-brand-mark">
              PL
            </div>

            <div>
              <div className="auth-brand-name">
                Peter Lawrence
              </div>

              <div className="auth-brand-subtitle">
                Legal ERP & CRM
              </div>
            </div>
          </div>


          <div className="auth-form-heading">

            <span className="auth-form-kicker">
              SECURE ACCESS
            </span>

            <h2>
              Welcome back.
            </h2>

            <p>
              Sign in to continue to your firm workspace.
            </p>

          </div>


          {/* Error */}

          {error && (
            <div className="auth-error">
              <i className="bi bi-exclamation-circle"></i>

              <span>
                {error}
              </span>
            </div>
          )}


          {/* Login Form */}

          <form onSubmit={handleSubmit}>

            {/* Email */}

            <div className="auth-field">

              <label htmlFor="login-email">
                Email address
              </label>

              <div className="auth-input-wrapper">

                <i className="bi bi-envelope"></i>

                <input
                  id="login-email"
                  type="email"
                  placeholder="name@firm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

              </div>

            </div>


            {/* Password */}

            <div className="auth-field">

              <div className="auth-label-row">

                <label htmlFor="login-password">
                  Password
                </label>

                <span>
                  Secure sign-in
                </span>

              </div>

              <div className="auth-input-wrapper">

                <i className="bi bi-lock"></i>

                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

              </div>

            </div>


            {/* Submit */}

            <button
              type="submit"
              className="auth-submit"
            >
              <span>
                Sign in to workspace
              </span>

              <i className="bi bi-arrow-right"></i>
            </button>

          </form>


          {/* Register */}

          <div className="auth-register">

            <span>
              New to the firm workspace?
            </span>

            <Link to="/register">
              Create a client account
              <i className="bi bi-arrow-up-right"></i>
            </Link>

          </div>


          {/* Security */}

          <div className="auth-security">

            <i className="bi bi-shield-check"></i>

            <div>
              <strong>
                Protected workspace
              </strong>

              <span>
                Access is restricted according to your assigned role.
              </span>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;