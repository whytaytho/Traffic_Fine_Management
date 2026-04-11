import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";
import Loader from "../components/Loader";

const initialForm = {
  name: "",
  Description: "",
  Default_amount: "",
};

function ViolationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditMode) return;

    async function fetchViolation() {
      try {
        setLoading(true);
        const response = await api.get(`/violations/${id}`);
        setForm({
          name: response.data.name || "",
          Description: response.data.Description || "",
          Default_amount: response.data.Default_amount || "",
        });
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load violation type");
      } finally {
        setLoading(false);
      }
    }

    fetchViolation();
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
        ...form,
        Default_amount: Number(form.Default_amount),
      };

      if (isEditMode) {
        await api.put(`/violations/${id}`, payload);
      } else {
        await api.post("/violations", payload);
      }

      navigate("/violations");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to save violation type");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading violation form..." />;

  return (
    <section className="panel form-panel">
      <div className="panel-header">
        <div>
          <h3>{isEditMode ? "Edit Violation Type" : "Add Violation Type"}</h3>
          <p>Define violation categories and the default amount applied by the system.</p>
        </div>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span>Violation Name</span>
          <input className="input" name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          <span>Default Amount</span>
          <input
            className="input"
            name="Default_amount"
            type="number"
            min="0"
            step="0.01"
            value={form.Default_amount}
            onChange={handleChange}
            required
          />
        </label>
        <label className="full-width">
          <span>Description</span>
          <textarea
            className="input textarea"
            name="Description"
            value={form.Description}
            onChange={handleChange}
          />
        </label>

        <div className="form-actions full-width">
          <Link to="/violations" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : isEditMode ? "Update Violation" : "Create Violation"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ViolationForm;
