import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setMessage(response.data.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to process password reset request."
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

            <h2>Legal ERP &amp; Client Relationship Management</h2>

            <div className="auth-brand-line"></div>

            <p className="auth-brand-description">
              Secure access to your firm's legal, client, financial and
              operational management platform.
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
              <p className="auth-form-eyebrow">ACCOUNT RECOVERY</p>

              <h1>Forgot Password</h1>

              <p>
                Enter your registered email address and we'll help you regain
                access to your account.
              </p>
            </div>

            {message && (
              <div className="auth-alert auth-alert-success">
                <div className="auth-alert-icon">
                  <i className="bi bi-check-circle"></i>
                </div>

                <div>
                  <strong>Request submitted</strong>
                  <p>{message}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="auth-alert auth-alert-error">
                <div className="auth-alert-icon">
                  <i className="bi bi-exclamation-circle"></i>
                </div>

                <div>
                  <strong>Unable to continue</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="forgot-email">Email Address</label>

                <div className="auth-input-wrapper">
                  <i className="bi bi-envelope"></i>

                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                    Processing...
                  </>
                ) : (
                  <>
                    Request Password Reset
                    <i className="bi bi-arrow-right"></i>
                  </>
                )}
              </button>
            </form>

            <div className="auth-back-link">
              <Link to="/login">
                <i className="bi bi-arrow-left"></i>
                Back to Login
              </Link>
            </div>

            <div className="auth-security-note">
              <i className="bi bi-shield-lock"></i>

              <span>
                For your security, password reset links are temporary and can
                only be used once.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;