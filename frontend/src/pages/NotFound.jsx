import { Link } from "react-router-dom";

function NotFound() {
  return (
    <section className="panel not-found">
      <p className="eyebrow">404</p>
      <h2>Page not found</h2>
      <p>The page you are looking for does not exist or has been moved.</p>
      <Link to="/dashboard" className="btn btn-primary">
        Go to Dashboard
      </Link>
    </section>
  );
}

export default NotFound;
