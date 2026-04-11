import { useLocation } from "react-router-dom";

const titleMap = {
  "/dashboard": "Dashboard",
  "/owners": "Owner Management",
  "/vehicles": "Vehicle Registry",
  "/officers": "Officer Directory",
  "/violations": "Violation Types",
  "/fines": "Fine Management",
};

function Navbar() {
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.startsWith("/owners/")) return "Owner Form";
    if (location.pathname.startsWith("/vehicles/")) return "Vehicle Form";
    if (location.pathname.startsWith("/officers/")) return "Officer Form";
    if (location.pathname.startsWith("/violations/")) return "Violation Form";
    if (location.pathname.startsWith("/fines/edit")) return "Edit Fine";
    if (location.pathname.startsWith("/fines/new")) return "Create Fine";
    if (location.pathname.startsWith("/fines/")) return "Fine Details";
    return titleMap[location.pathname] || "Traffic Fine Management";
  };

  const today = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
  }).format(new Date());

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Traffic Fine Management System</p>
        <h1>{getTitle()}</h1>
      </div>
      <div className="topbar-meta">
        <span className="status-pill success">System Online</span>
        <span className="topbar-date">{today}</span>
      </div>
    </header>
  );
}

export default Navbar;
