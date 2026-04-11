import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import DataTable from "../components/DataTable";
import Loader from "../components/Loader";

function Vehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchVehicles(search);
    }, 250);

    return () => clearTimeout(timeout);
  }, [search]);

  async function fetchVehicles(searchValue = "") {
    try {
      setLoading(true);
      const params = searchValue.trim() ? { search: searchValue.trim() } : {};
      const response = await api.get("/vehicles", { params });
      setVehicles(response.data);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!vehicleToDelete) return;

    try {
      await api.delete(`/vehicles/${vehicleToDelete.id}`);
      setVehicleToDelete(null);
      fetchVehicles(search);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to delete vehicle");
      setVehicleToDelete(null);
    }
  }

  if (loading) return <Loader text="Loading vehicles..." />;

  return (
    <div className="stack">
      <section className="panel toolbar">
        <div>
          <h3>Vehicles</h3>
          <p>Search by plate, owner name, brand, or model.</p>
        </div>
        <div className="toolbar-actions">
          <input
            type="text"
            className="input"
            placeholder="Search vehicles..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="button" className="btn btn-primary" onClick={() => navigate("/vehicles/new")}>
            Add Vehicle
          </button>
        </div>
      </section>

      {error ? <div className="alert error">{error}</div> : null}

      <section className="panel">
        <DataTable
          columns={[
            { key: "license_plate_no", label: "Plate" },
            { key: "owner_name", label: "Owner" },
            { key: "Type", label: "Type" },
            { key: "Brand", label: "Brand" },
            { key: "Model", label: "Model" },
            { key: "Colour", label: "Colour" },
          ]}
          data={vehicles}
          actions={(row) => (
            <div className="table-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(`/vehicles/edit/${row.id}`)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => setVehicleToDelete(row)}
              >
                Delete
              </button>
            </div>
          )}
        />
      </section>

      <ConfirmModal
        isOpen={Boolean(vehicleToDelete)}
        title="Delete vehicle"
        message={`Delete vehicle ${vehicleToDelete?.license_plate_no || ""}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onClose={() => setVehicleToDelete(null)}
      />
    </div>
  );
}

export default Vehicles;
