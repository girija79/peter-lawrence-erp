import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.put(`/auth/reset-password/${token}`, {
        password,
      });

      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password. The link may be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-recovery-page">
      <div className="auth-shell">
        {/* Brand Panel */}
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-mark">PL</div>

            <p className="auth-brand-eyebrow">PETER LAW FIRM</p>

            <h2>Secure Account Recovery</h2>

            <div className="auth-brand-line"></div>

            <p className="auth-brand-description">
              Protecting access to your firm's legal and operational
              information through secure account management.
            </p>
          </div>

          <div className="auth-brand-footer">
            <span>Belgrade, Serbia</span>
            <span>•</span>
            <span>Peter Law Firm</span>
          </div>
        </div>

        {/* Form Panel */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <p className="auth-form-eyebrow">ACCOUNT SECURITY</p>

              <h1>Reset Password</h1>

              <p>
                Create a new password for your Peter Law Firm account.
              </p>
            </div>

            {message && (
              <div className="auth-alert auth-alert-success">
                <div className="auth-alert-icon">
                  <i className="bi bi-check-circle"></i>
                </div>

                <div>
                  <strong>Password updated</strong>
                  <p>{message}</p>
                  <small>Redirecting you to login...</small>
                </div>
              </div>
            )}

            {error && (
              <div className="auth-alert auth-alert-error">
                <div className="auth-alert-icon">
                  <i className="bi bi-exclamation-circle"></i>
                </div>

                <div>
                  <strong>Password reset failed</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {!message && (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-field">
                  <label htmlFor="new-password">New Password</label>

                  <div className="auth-input-wrapper">
                    <i className="bi bi-lock"></i>

                    <input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <span className="auth-field-help">
                    Minimum 6 characters
                  </span>
                </div>

                <div className="auth-field">
                  <label htmlFor="confirm-password">
                    Confirm New Password
                  </label>

                  <div className="auth-input-wrapper">
                    <i className="bi bi-shield-lock"></i>

                    <input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <i className="bi bi-arrow-right"></i>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="auth-back-link">
              <Link to="/login">
                <i className="bi bi-arrow-left"></i>
                Back to Login
              </Link>
            </div>

            <div className="auth-security-note">
              <i className="bi bi-shield-check"></i>

              <span>
                Your new password is securely encrypted before being stored.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;