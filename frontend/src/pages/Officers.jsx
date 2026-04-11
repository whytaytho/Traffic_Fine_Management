import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import DataTable from "../components/DataTable";
import Loader from "../components/Loader";

function Officers() {
  const navigate = useNavigate();
  const [officers, setOfficers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [officerToDelete, setOfficerToDelete] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchOfficers(search);
    }, 250);

    return () => clearTimeout(timeout);
  }, [search]);

  async function fetchOfficers(searchValue = "") {
    try {
      setLoading(true);
      const params = searchValue.trim() ? { search: searchValue.trim() } : {};
      const response = await api.get("/officers", { params });
      setOfficers(response.data);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load officers");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!officerToDelete) return;

    try {
      await api.delete(`/officers/${officerToDelete.Officer_id}`);
      setOfficerToDelete(null);
      fetchOfficers(search);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to delete officer");
      setOfficerToDelete(null);
    }
  }

  if (loading) return <Loader text="Loading officers..." />;

  return (
    <div className="stack">
      <section className="panel toolbar">
        <div>
          <h3>Officers</h3>
          <p>Search officers by name, badge number, rank, or station.</p>
        </div>
        <div className="toolbar-actions">
          <input
            type="text"
            className="input"
            placeholder="Search officers..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="button" className="btn btn-primary" onClick={() => navigate("/officers/new")}>
            Add Officer
          </button>
        </div>
      </section>

      {error ? <div className="alert error">{error}</div> : null}

      <section className="panel">
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "phone_no", label: "Phone" },
            { key: "badge_no", label: "Badge No" },
            { key: "rank", label: "Rank" },
            { key: "Station", label: "Station" },
          ]}
          data={officers}
          actions={(row) => (
            <div className="table-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(`/officers/edit/${row.Officer_id}`)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => setOfficerToDelete(row)}
              >
                Delete
              </button>
            </div>
          )}
        />
      </section>

      <ConfirmModal
        isOpen={Boolean(officerToDelete)}
        title="Delete officer"
        message={`Delete ${officerToDelete?.name || "this officer"}? This cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onClose={() => setOfficerToDelete(null)}
      />
    </div>
  );
}

export default Officers;
