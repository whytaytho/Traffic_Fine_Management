import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";
import Loader from "../components/Loader";

const initialForm = {
  license_plate_no: "",
  Owner_id: "",
  Type: "",
  Brand: "",
  Model: "",
  Colour: "",
};

function VehicleForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPageData() {
      try {
        setLoading(true);
        const requests = [api.get("/owners")];

        if (isEditMode) {
          requests.push(api.get(`/vehicles/${id}`));
        }

        const [ownersResponse, vehicleResponse] = await Promise.all(requests);
        setOwners(ownersResponse.data);

        if (vehicleResponse) {
          setForm({
            license_plate_no: vehicleResponse.data.license_plate_no || "",
            Owner_id: String(vehicleResponse.data.Owner_id || ""),
            Type: vehicleResponse.data.Type || "",
            Brand: vehicleResponse.data.Brand || "",
            Model: vehicleResponse.data.Model || "",
            Colour: vehicleResponse.data.Colour || "",
          });
        }

        setError("");
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load vehicle form");
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
        ...form,
        Owner_id: Number(form.Owner_id),
      };

      if (isEditMode) {
        await api.put(`/vehicles/${id}`, payload);
      } else {
        await api.post("/vehicles", payload);
      }

      navigate("/vehicles");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to save vehicle");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading vehicle form..." />;

  return (
    <section className="panel form-panel">
      <div className="panel-header">
        <div>
          <h3>{isEditMode ? "Edit Vehicle" : "Add Vehicle"}</h3>
          <p>Link vehicles to existing owners and maintain registry details.</p>
        </div>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span>License Plate Number</span>
          <input
            className="input"
            name="license_plate_no"
            value={form.license_plate_no}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          <span>Owner</span>
          <select className="input" name="Owner_id" value={form.Owner_id} onChange={handleChange} required>
            <option value="">Select owner</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} ({owner.license_no})
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Type</span>
          <input className="input" name="Type" value={form.Type} onChange={handleChange} />
        </label>
        <label>
          <span>Brand</span>
          <input className="input" name="Brand" value={form.Brand} onChange={handleChange} required />
        </label>
        <label>
          <span>Model</span>
          <input className="input" name="Model" value={form.Model} onChange={handleChange} required />
        </label>
        <label>
          <span>Colour</span>
          <input className="input" name="Colour" value={form.Colour} onChange={handleChange} />
        </label>

        <div className="form-actions full-width">
          <Link to="/vehicles" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : isEditMode ? "Update Vehicle" : "Create Vehicle"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default VehicleForm;
