import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import DataTable from "../components/DataTable";
import Loader from "../components/Loader";

function Owners() {
  const navigate = useNavigate();
  const [owners, setOwners] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ownerToDelete, setOwnerToDelete] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchOwners(search);
    }, 250);

    return () => clearTimeout(timeout);
  }, [search]);

  async function fetchOwners(searchValue = "") {
    try {
      setLoading(true);
      const params = searchValue.trim() ? { search: searchValue.trim() } : {};
      const response = await api.get("/owners", { params });
      setOwners(response.data);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load owners");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!ownerToDelete) return;

    try {
      await api.delete(`/owners/${ownerToDelete.id}`);
      setOwnerToDelete(null);
      fetchOwners(search);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to delete owner");
      setOwnerToDelete(null);
    }
  }

  if (loading) return <Loader text="Loading owners..." />;

  return (
    <div className="stack">
      <section className="panel toolbar">
        <div>
          <h3>Owners</h3>
          <p>Search owners by name, email, or license number.</p>
        </div>
        <div className="toolbar-actions">
          <input
            type="text"
            className="input"
            placeholder="Search owners..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="button" className="btn btn-primary" onClick={() => navigate("/owners/new")}>
            Add Owner
          </button>
        </div>
      </section>

      {error ? <div className="alert error">{error}</div> : null}

      <section className="panel">
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "phone_no", label: "Phone" },
            { key: "email", label: "Email" },
            { key: "license_no", label: "License No" },
            { key: "address", label: "Address" },
          ]}
          data={owners}
          actions={(row) => (
            <div className="table-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(`/owners/edit/${row.id}`)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => setOwnerToDelete(row)}
              >
                Delete
              </button>
            </div>
          )}
        />
      </section>

      <ConfirmModal
        isOpen={Boolean(ownerToDelete)}
        title="Delete owner"
        message={`Delete ${ownerToDelete?.name || "this owner"}? This cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onClose={() => setOwnerToDelete(null)}
      />
    </div>
  );
}

export default Owners;
