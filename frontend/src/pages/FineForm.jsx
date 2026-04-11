import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";
import Loader from "../components/Loader";

const initialForm = {
  vehicle_id: "",
  officer_id: "",
  violation_type_id: "",
  location: "",
  remarks: "",
};

function FineForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [lookups, setLookups] = useState({
    vehicles: [],
    officers: [],
    violations: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPageData() {
      try {
        setLoading(true);
        const requests = [api.get("/vehicles"), api.get("/officers"), api.get("/violations")];

        if (isEditMode) {
          requests.push(api.get(`/fines/${id}`));
        }

        const [vehiclesRes, officersRes, violationsRes, fineRes] = await Promise.all(requests);

        setLookups({
          vehicles: vehiclesRes.data,
          officers: officersRes.data,
          violations: violationsRes.data,
        });

        if (fineRes) {
          setForm({
            vehicle_id: String(fineRes.data.Vehicle_id || ""),
            officer_id: String(fineRes.data.Police_Officer_id || ""),
            violation_type_id: String(fineRes.data.Violation_type_id || ""),
            location: fineRes.data.Location || "",
            remarks: fineRes.data.Remarks || "",
          });
        }

        setError("");
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load fine form");
      } finally {
        setLoading(false);
      }
    }

    loadPageData();
  }, [id, isEditMode]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        vehicle_id: Number(form.vehicle_id),
        officer_id: Number(form.officer_id),
        violation_type_id: Number(form.violation_type_id),
        location: form.location,
        remarks: form.remarks,
      };

      if (isEditMode) {
        await api.put(`/fines/${id}`, payload);
      } else {
        await api.post("/fines", payload);
      }

      navigate("/fines");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to save fine");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading fine form..." />;

  return (
    <section className="panel form-panel">
      <div className="panel-header">
        <div>
          <h3>{isEditMode ? "Edit Fine" : "Issue Fine"}</h3>
          <p>
            {isEditMode
              ? "Update the fine record. Amount stays aligned with the selected violation type."
              : "Create a fine using the stored procedure so amount and business rules stay in MySQL."}
          </p>
        </div>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span>Vehicle</span>
          <select className="input" name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required>
            <option value="">Select vehicle</option>
            {lookups.vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.license_plate_no} - {vehicle.owner_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Officer</span>
          <select className="input" name="officer_id" value={form.officer_id} onChange={handleChange} required>
            <option value="">Select officer</option>
            {lookups.officers.map((officer) => (
              <option key={officer.Officer_id} value={officer.Officer_id}>
                {officer.name} ({officer.badge_no})
              </option>
            ))}
          </select>
        </label>
        <label className="full-width">
          <span>Violation Type</span>
          <select
            className="input"
            name="violation_type_id"
            value={form.violation_type_id}
            onChange={handleChange}
            required
          >
            <option value="">Select violation type</option>
            {lookups.violations.map((violation) => (
              <option key={violation.id} value={violation.id}>
                {violation.name}
              </option>
            ))}
          </select>
        </label>
        <label className="full-width">
          <span>Location</span>
          <input className="input" name="location" value={form.location} onChange={handleChange} required />
        </label>
        <label className="full-width">
          <span>Remarks</span>
          <textarea className="input textarea" name="remarks" value={form.remarks} onChange={handleChange} />
        </label>

        <div className="form-actions full-width">
          <Link to="/fines" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : isEditMode ? "Update Fine" : "Issue Fine"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default FineForm;
