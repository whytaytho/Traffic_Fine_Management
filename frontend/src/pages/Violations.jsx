import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import DataTable from "../components/DataTable";
import Loader from "../components/Loader";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

function Violations() {
  const navigate = useNavigate();
  const [violations, setViolations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [violationToDelete, setViolationToDelete] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchViolations(search);
    }, 250);

    return () => clearTimeout(timeout);
  }, [search]);

  async function fetchViolations(searchValue = "") {
    try {
      setLoading(true);
      const params = searchValue.trim() ? { search: searchValue.trim() } : {};
      const response = await api.get("/violations", { params });
      setViolations(response.data);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load violations");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!violationToDelete) return;

    try {
      await api.delete(`/violations/${violationToDelete.id}`);
      setViolationToDelete(null);
      fetchViolations(search);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to delete violation type");
      setViolationToDelete(null);
    }
  }

  if (loading) return <Loader text="Loading violations..." />;

  return (
    <div className="stack">
      <section className="panel toolbar">
        <div>
          <h3>Violation Types</h3>
          <p>Search by violation name or description.</p>
        </div>
        <div className="toolbar-actions">
          <input
            type="text"
            className="input"
            placeholder="Search violations..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="button" className="btn btn-primary" onClick={() => navigate("/violations/new")}>
            Add Violation
          </button>
        </div>
      </section>

      {error ? <div className="alert error">{error}</div> : null}

      <section className="panel">
        <DataTable
          columns={[
            { key: "name", label: "Violation" },
            { key: "Description", label: "Description" },
            {
              key: "Default_amount",
              label: "Default Amount",
              render: (value) => currency.format(value || 0),
            },
          ]}
          data={violations}
          actions={(row) => (
            <div className="table-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(`/violations/edit/${row.id}`)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => setViolationToDelete(row)}
              >
                Delete
              </button>
            </div>
          )}
        />
      </section>

      <ConfirmModal
        isOpen={Boolean(violationToDelete)}
        title="Delete violation type"
        message={`Delete ${violationToDelete?.name || "this violation type"}? This cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onClose={() => setViolationToDelete(null)}
      />
    </div>
  );
}

export default Violations;
