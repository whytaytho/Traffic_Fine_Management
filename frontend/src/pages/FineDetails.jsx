import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";
import Loader from "../components/Loader";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

function FineDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [fine, setFine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [decision, setDecision] = useState("ACCEPT");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFine();
  }, [id]);

  async function fetchFine() {
    try {
      setLoading(true);
      const response = await api.get(`/fines/${id}`);
      setFine(response.data);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load fine details");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(endpoint, payload) {
    try {
      setActionLoading(true);
      await api.post(endpoint, payload);
      await fetchFine();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <Loader text="Loading fine details..." />;
  if (!fine) return <div className="alert error">{error || "Fine not found"}</div>;

  return (
    <div className="stack">
      {error ? <div className="alert error">{error}</div> : null}

      <section className="panel detail-hero">
        <div>
          <p className="eyebrow">Fine #{fine.Fine_id}</p>
          <h2>{fine.violation_name}</h2>
          <p>
            {fine.license_plate_no} at {fine.Location} on {fine.Date} {fine.Time}
          </p>
        </div>
        <div className="detail-hero-side">
          <span className={`status-pill ${String(fine.Payment_status).toLowerCase()}`}>
            {fine.Payment_status}
          </span>
          <strong>{currency.format(fine.Amount || 0)}</strong>
        </div>
      </section>

      <section className="detail-grid">
        <article className="panel detail-card">
          <h3>Owner</h3>
          <p>{fine.owner_name}</p>
          <p>{fine.owner_phone_no}</p>
          <p>{fine.owner_email}</p>
          <p>{fine.owner_address}</p>
          <p>License: {fine.owner_license_no}</p>
        </article>

        <article className="panel detail-card">
          <h3>Vehicle</h3>
          <p>{fine.license_plate_no}</p>
          <p>
            {fine.vehicle_brand} {fine.vehicle_model}
          </p>
          <p>Type: {fine.vehicle_type || "-"}</p>
          <p>Colour: {fine.vehicle_colour || "-"}</p>
        </article>

        <article className="panel detail-card">
          <h3>Officer</h3>
          <p>{fine.officer_name}</p>
          <p>Badge: {fine.badge_no}</p>
          <p>{fine.officer_rank}</p>
          <p>{fine.Station}</p>
          <p>{fine.officer_phone_no}</p>
        </article>

        <article className="panel detail-card">
          <h3>Violation</h3>
          <p>{fine.violation_name}</p>
          <p>{fine.violation_description || "No description available."}</p>
          <p>Default amount: {currency.format(fine.Default_amount || 0)}</p>
          <p>Payment date: {fine.Payment_date || "Not paid yet"}</p>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Remarks</h3>
            <p>{fine.Remarks || "No remarks added for this fine."}</p>
          </div>
          <div className="table-actions">
            <Link to="/fines" className="btn btn-secondary">
              Back
            </Link>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(`/fines/edit/${fine.Fine_id}`)}>
              Edit
            </button>
            {fine.Payment_status === "UNPAID" ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={actionLoading}
                onClick={() => handleAction(`/fines/${fine.Fine_id}/pay`)}
              >
                Pay Fine
              </button>
            ) : null}
            {fine.Payment_status === "UNPAID" ? (
              <button
                type="button"
                className="btn btn-secondary"
                disabled={actionLoading}
                onClick={() => handleAction(`/fines/${fine.Fine_id}/dispute`)}
              >
                Raise Dispute
              </button>
            ) : null}
            {["UNPAID", "DISPUTED"].includes(fine.Payment_status) ? (
              <button
                type="button"
                className="btn btn-danger"
                disabled={actionLoading}
                onClick={() => handleAction(`/fines/${fine.Fine_id}/cancel`)}
              >
                Cancel Fine
              </button>
            ) : null}
          </div>
        </div>

        {fine.Payment_status === "DISPUTED" ? (
          <div className="resolve-box">
            <select className="input" value={decision} onChange={(event) => setDecision(event.target.value)}>
              <option value="ACCEPT">ACCEPT</option>
              <option value="REJECT">REJECT</option>
            </select>
            <button
              type="button"
              className="btn btn-primary"
              disabled={actionLoading}
              onClick={() =>
                handleAction(`/fines/${fine.Fine_id}/resolve-dispute`, {
                  decision,
                })
              }
            >
              Resolve Dispute
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default FineDetails;
