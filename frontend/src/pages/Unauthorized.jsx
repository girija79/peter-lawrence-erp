
function Unauthorized() {
  return (
    <div className="unauthorized-page">
      <div className="unauthorized-content">

        <div className="unauthorized-mark">
          <i className="bi bi-shield-lock"></i>
        </div>

        <div className="unauthorized-kicker">
          PETER LAW FIRM · ACCESS CONTROL
        </div>

        <h1 className="unauthorized-title">
          Access Restricted
        </h1>

        <p className="unauthorized-description">
          Your account does not have permission to access this section
          of the legal office system.
        </p>

        <a
          href="/dashboard"
          className="pl-button pl-button-primary unauthorized-button"
        >
          <i className="bi bi-arrow-left"></i>
          Return to Overview
        </a>

      </div>
    </div>
  );
}

export default Unauthorized;

