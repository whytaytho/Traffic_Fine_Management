import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";
import Loader from "../components/Loader";

const initialForm = {
  name: "",
  phone_no: "",
  email: "",
  address: "",
  license_no: "",
  aadhar_id: "",
};

function OwnerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditMode) return;

    async function fetchOwner() {
      try {
        setLoading(true);
        const response = await api.get(`/owners/${id}`);
        setForm({
          ...initialForm,
          ...response.data,
          aadhar_id: response.data.aadhar_id || "",
        });
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load owner");
      } finally {
        setLoading(false);
      }
    }

    fetchOwner();
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
        await api.put(`/owners/${id}`, form);
      } else {
        await api.post("/owners", form);
      }

      navigate("/owners");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to save owner");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading owner form..." />;

  return (
    <section className="panel form-panel">
      <div className="panel-header">
        <div>
          <h3>{isEditMode ? "Edit Owner" : "Add Owner"}</h3>
          <p>Maintain contact information for the owner. Aadhar is optional and kept separate from the internal owner ID.</p>
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
          <span>Email</span>
          <input className="input" name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          <span>License Number</span>
          <input
            className="input"
            name="license_no"
            value={form.license_no}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          <span>Aadhar ID</span>
          <input
            className="input"
            name="aadhar_id"
            value={form.aadhar_id}
            onChange={handleChange}
            placeholder="Optional"
          />
        </label>
        <label className="full-width">
          <span>Address</span>
          <textarea
            className="input textarea"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
          />
        </label>

        <div className="form-actions full-width">
          <Link to="/owners" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : isEditMode ? "Update Owner" : "Create Owner"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default OwnerForm;
