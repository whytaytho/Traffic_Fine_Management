import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";
import Loader from "../components/Loader";

const initialForm = {
  name: "",
  phone_no: "",
  badge_no: "",
  rank: "",
  Station: "",
};

function OfficerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditMode) return;

    async function fetchOfficer() {
      try {
        setLoading(true);
        const response = await api.get(`/officers/${id}`);
        setForm(response.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load officer");
      } finally {
        setLoading(false);
      }
    }

    fetchOfficer();
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

      if (isEditMode) {
        await api.put(`/officers/${id}`, form);
      } else {
        await api.post("/officers", form);
      }

      navigate("/officers");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to save officer");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading officer form..." />;

  return (
    <section className="panel form-panel">
      <div className="panel-header">
        <div>
          <h3>{isEditMode ? "Edit Officer" : "Add Officer"}</h3>
          <p>Manage enforcement personnel and issuing station details.</p>
        </div>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span>Name</span>
          <input className="input" name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          <span>Phone Number</span>
          <input
            className="input"
            name="phone_no"
            value={form.phone_no}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          <span>Badge Number</span>
          <input className="input" name="badge_no" value={form.badge_no} onChange={handleChange} required />
        </label>
        <label>
          <span>Rank</span>
          <input className="input" name="rank" value={form.rank} onChange={handleChange} required />
        </label>
        <label className="full-width">
          <span>Station</span>
          <input className="input" name="Station" value={form.Station} onChange={handleChange} required />
        </label>

        <div className="form-actions full-width">
          <Link to="/officers" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : isEditMode ? "Update Officer" : "Create Officer"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default OfficerForm;
