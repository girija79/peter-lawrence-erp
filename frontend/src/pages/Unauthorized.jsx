function Unauthorized() {
  return (
    <div className="container py-5">
      <div className="text-center">

        <i className="bi bi-shield-lock fs-1 text-danger"></i>

        <h2 className="fw-bold mt-3">
          Access Denied
        </h2>

        <p className="text-muted">
          You do not have permission to access this page.
        </p>

        <a
          href="/dashboard"
          className="btn btn-primary"
        >
          Back to Dashboard
        </a>

      </div>
    </div>
  );
}

export default Unauthorized;