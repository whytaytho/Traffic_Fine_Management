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

function StatusBadge({ status }) {
  return <span className={`status-pill ${String(status).toLowerCase()}`}>{status}</span>;
}

function Fines() {
  const navigate = useNavigate();
  const [fines, setFines] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    ownerId: "",
    vehicleId: "",
    officerId: "",
    violationTypeId: "",
  });
  const [options, setOptions] = useState({
    owners: [],
    vehicles: [],
    officers: [],
    violations: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [ownersRes, vehiclesRes, officersRes, violationsRes] = await Promise.all([
          api.get("/owners"),
          api.get("/vehicles"),
          api.get("/officers"),
          api.get("/violations"),
        ]);

        setOptions({
          owners: ownersRes.data,
          vehicles: vehiclesRes.data,
          officers: officersRes.data,
          violations: violationsRes.data,
        });
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load filter data");
      }
    }

    loadOptions();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchFines();
    }, 250);

    return () => clearTimeout(timeout);
  }, [filters]);

  async function fetchFines() {
    try {
      setLoading(true);
      const params = {};

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params[key] = value;
        }
      });

      const response = await api.get("/fines", { params });
      setFines(response.data);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load fines");
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function openConfirm(action, fine) {
    const messages = {
      delete: {
        title: "Delete fine",
        message: `Delete fine #${fine.Fine_id}? This cannot be undone.`,
        confirmText: "Delete",
        tone: "danger",
      },
      cancel: {
        title: "Cancel fine",
        message: `Cancel fine #${fine.Fine_id}?`,
        confirmText: "Cancel Fine",
        tone: "danger",
      },
    };

    setConfirmState({
      action,
      fine,
      ...messages[action],
    });
  }

  async function handleConfirm() {
    if (!confirmState) return;

    try {
      if (confirmState.action === "delete") {
        await api.delete(`/fines/${confirmState.fine.Fine_id}`);
      }

      if (confirmState.action === "cancel") {
        await api.post(`/fines/${confirmState.fine.Fine_id}/cancel`);
      }

      setConfirmState(null);
      fetchFines();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Action failed");
      setConfirmState(null);
    }
  }

  async function handleFineAction(endpoint) {
    try {
      await api.post(endpoint);
      fetchFines();
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Action failed");
    }
  }

  if (loading) return <Loader text="Loading fines..." />;

  return (
    <div className="stack">
      <section className="panel toolbar">
        <div>
          <h3>Fines</h3>
          <p>Search, filter, and manage the entire fine lifecycle.</p>
        </div>
        <div className="toolbar-actions">
          <button type="button" className="btn btn-primary" onClick={() => navigate("/fines/new")}>
            Add Fine
          </button>
        </div>
      </section>

      {error ? <div className="alert error">{error}</div> : null}

      <section className="panel filter-grid">
        <input
          className="input"
          name="search"
          placeholder="Search plate, owner, violation, officer, remarks..."
          value={filters.search}
          onChange={handleFilterChange}
        />
        <select className="input" name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All statuses</option>
          <option value="UNPAID">UNPAID</option>
          <option value="PAID">PAID</option>
          <option value="DISPUTED">DISPUTED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <select className="input" name="ownerId" value={filters.ownerId} onChange={handleFilterChange}>
          <option value="">All owners</option>
          {options.owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.name}
            </option>
          ))}
        </select>
        <select className="input" name="vehicleId" value={filters.vehicleId} onChange={handleFilterChange}>
          <option value="">All vehicles</option>
          {options.vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.license_plate_no}
            </option>
          ))}
        </select>
        <select className="input" name="officerId" value={filters.officerId} onChange={handleFilterChange}>
          <option value="">All officers</option>
          {options.officers.map((officer) => (
            <option key={officer.Officer_id} value={officer.Officer_id}>
              {officer.name}
            </option>
          ))}
        </select>
        <select
          className="input"
          name="violationTypeId"
          value={filters.violationTypeId}
          onChange={handleFilterChange}
        >
          <option value="">All violation types</option>
          {options.violations.map((violation) => (
            <option key={violation.id} value={violation.id}>
              {violation.name}
            </option>
          ))}
        </select>
      </section>

      <section className="panel">
        <DataTable
          columns={[
            { key: "Fine_id", label: "Fine ID" },
            { key: "license_plate_no", label: "Vehicle" },
            { key: "owner_name", label: "Owner" },
            { key: "officer_name", label: "Officer" },
            { key: "violation_name", label: "Violation" },
            { key: "Date", label: "Date" },
            { key: "Location", label: "Location" },
            {
              key: "Amount",
              label: "Amount",
              render: (value) => currency.format(value || 0),
            },
            {
              key: "Payment_status",
              label: "Status",
              render: (value) => <StatusBadge status={value} />,
            },
          ]}
          data={fines}
          actions={(row) => (
            <div className="table-actions wrap">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(`/fines/${row.Fine_id}`)}
              >
                Details
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(`/fines/edit/${row.Fine_id}`)}
              >
                Edit
              </button>
              {row.Payment_status === "UNPAID" ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleFineAction(`/fines/${row.Fine_id}/pay`)}
                >
                  Pay
                </button>
              ) : null}
              {row.Payment_status === "UNPAID" ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleFineAction(`/fines/${row.Fine_id}/dispute`)}
                >
                  Dispute
                </button>
              ) : null}
              {["UNPAID", "DISPUTED"].includes(row.Payment_status) ? (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => openConfirm("cancel", row)}
                >
                  Cancel
                </button>
              ) : null}
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => openConfirm("delete", row)}
              >
                Delete
              </button>
            </div>
          )}
        />
      </section>

      <ConfirmModal
        isOpen={Boolean(confirmState)}
        title={confirmState?.title || ""}
        message={confirmState?.message || ""}
        confirmText={confirmState?.confirmText || "Confirm"}
        tone={confirmState?.tone || "danger"}
        onConfirm={handleConfirm}
        onClose={() => setConfirmState(null)}
      />
    </div>
  );
}

export default Fines;
