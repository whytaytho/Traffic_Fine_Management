import { useEffect, useState } from "react";

import api from "../api/axios";
import DataTable from "../components/DataTable";
import Loader from "../components/Loader";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const summaryCards = [
  { key: "total_owners", label: "Total Owners" },
  { key: "total_vehicles", label: "Total Vehicles" },
  { key: "total_officers", label: "Total Officers" },
  { key: "total_fines", label: "Total Fines" },
  { key: "unpaid_fines_count", label: "Unpaid Fines" },
  { key: "paid_fines_count", label: "Paid Fines" },
  { key: "disputed_fines_count", label: "Disputed Fines" },
  { key: "cancelled_fines_count", label: "Cancelled Fines" },
];

function Dashboard() {
  const [dashboard, setDashboard] = useState({
    summary: null,
    repeatOffenders: [],
    commonViolations: [],
    topOfficers: [],
    oldUnpaid: [],
    unpaidPerOwner: [],
    revenue: [],
    topVehicles: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const [
          summaryRes,
          repeatRes,
          unpaidPerOwnerRes,
          commonRes,
          topVehiclesRes,
          topOfficersRes,
          revenueRes,
          oldUnpaidRes,
        ] = await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/dashboard/repeat-offenders"),
          api.get("/dashboard/unpaid-per-owner"),
          api.get("/dashboard/common-violations"),
          api.get("/dashboard/top-vehicles"),
          api.get("/dashboard/top-officers"),
          api.get("/dashboard/revenue"),
          api.get("/dashboard/old-unpaid"),
        ]);

        setDashboard({
          summary: summaryRes.data,
          repeatOffenders: repeatRes.data,
          commonViolations: commonRes.data,
          topOfficers: topOfficersRes.data,
          oldUnpaid: oldUnpaidRes.data,
          unpaidPerOwner: unpaidPerOwnerRes.data,
          revenue: revenueRes.data,
          topVehicles: topVehiclesRes.data,
        });
        setError("");
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) return <Loader text="Loading dashboard insights..." />;

  return (
    <div className="stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Operations overview</p>
          <h2>Track fines, enforcement patterns, and payment health in one place.</h2>
        </div>
        <div className="hero-metrics">
          <div>
            <span>Total unpaid amount</span>
            <strong>{currency.format(dashboard.summary?.total_unpaid_amount || 0)}</strong>
          </div>
          <div>
            <span>Total paid amount</span>
            <strong>{currency.format(dashboard.summary?.total_paid_amount || 0)}</strong>
          </div>
        </div>
      </section>

      {error ? <div className="alert error">{error}</div> : null}

      <section className="summary-grid">
        {summaryCards.map((card) => (
          <article key={card.key} className="summary-card">
            <span>{card.label}</span>
            <strong>{dashboard.summary?.[card.key] ?? 0}</strong>
          </article>
        ))}
      </section>

      <section className="panel-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Repeat offenders</h3>
            <p>Vehicles with repeated violations across the system.</p>
          </div>
          <DataTable
            columns={[
              { key: "license_plate_no", label: "Plate" },
              { key: "owner_name", label: "Owner" },
              { key: "total_fines", label: "Fines" },
              { key: "unpaid_fines", label: "Unpaid" },
              {
                key: "total_amount",
                label: "Total Amount",
                render: (value) => currency.format(value || 0),
              },
            ]}
            data={dashboard.repeatOffenders}
          />
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Common violations</h3>
            <p>Most frequent violation types currently recorded.</p>
          </div>
          <DataTable
            columns={[
              { key: "name", label: "Violation" },
              { key: "fine_count", label: "Count" },
              {
                key: "total_amount",
                label: "Amount",
                render: (value) => currency.format(value || 0),
              },
            ]}
            data={dashboard.commonViolations}
          />
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Top officers</h3>
            <p>Officers issuing the highest number of fines.</p>
          </div>
          <DataTable
            columns={[
              { key: "name", label: "Officer" },
              { key: "badge_no", label: "Badge" },
              { key: "fine_count", label: "Issued" },
              {
                key: "total_amount_issued",
                label: "Amount",
                render: (value) => currency.format(value || 0),
              },
            ]}
            data={dashboard.topOfficers}
          />
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Old unpaid fines</h3>
            <p>Unpaid fines older than 30 days.</p>
          </div>
          <DataTable
            columns={[
              { key: "Fine_id", label: "Fine ID" },
              { key: "license_plate_no", label: "Plate" },
              { key: "owner_name", label: "Owner" },
              { key: "violation_name", label: "Violation" },
              { key: "days_overdue", label: "Days Overdue" },
            ]}
            data={dashboard.oldUnpaid}
          />
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Unpaid per owner</h3>
            <p>Outstanding liability grouped by owner.</p>
          </div>
          <DataTable
            columns={[
              { key: "owner_name", label: "Owner" },
              { key: "license_no", label: "License" },
              { key: "unpaid_fines_count", label: "Unpaid Fines" },
              {
                key: "unpaid_total_amount",
                label: "Amount",
                render: (value) => currency.format(value || 0),
              },
            ]}
            data={dashboard.unpaidPerOwner}
          />
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Revenue by month</h3>
            <p>Paid fine totals based on payment date.</p>
          </div>
          <DataTable
            columns={[
              { key: "payment_month", label: "Month" },
              { key: "paid_fines_count", label: "Paid Fines" },
              {
                key: "revenue",
                label: "Revenue",
                render: (value) => currency.format(value || 0),
              },
            ]}
            data={dashboard.revenue}
          />
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
