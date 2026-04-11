import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import FineDetails from "./pages/FineDetails";
import FineForm from "./pages/FineForm";
import Fines from "./pages/Fines";
import NotFound from "./pages/NotFound";
import OfficerForm from "./pages/OfficerForm";
import Officers from "./pages/Officers";
import OwnerForm from "./pages/OwnerForm";
import Owners from "./pages/Owners";
import VehicleForm from "./pages/VehicleForm";
import Vehicles from "./pages/Vehicles";
import ViolationForm from "./pages/ViolationForm";
import Violations from "./pages/Violations";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/owners" element={<Owners />} />
        <Route path="/owners/new" element={<OwnerForm />} />
        <Route path="/owners/edit/:id" element={<OwnerForm />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/new" element={<VehicleForm />} />
        <Route path="/vehicles/edit/:id" element={<VehicleForm />} />
        <Route path="/officers" element={<Officers />} />
        <Route path="/officers/new" element={<OfficerForm />} />
        <Route path="/officers/edit/:id" element={<OfficerForm />} />
        <Route path="/violations" element={<Violations />} />
        <Route path="/violations/new" element={<ViolationForm />} />
        <Route path="/violations/edit/:id" element={<ViolationForm />} />
        <Route path="/fines" element={<Fines />} />
        <Route path="/fines/new" element={<FineForm />} />
        <Route path="/fines/edit/:id" element={<FineForm />} />
        <Route path="/fines/:id" element={<FineDetails />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
