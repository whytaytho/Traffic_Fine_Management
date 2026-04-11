import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/owners", label: "Owners" },
  { to: "/vehicles", label: "Vehicles" },
  { to: "/officers", label: "Officers" },
  { to: "/violations", label: "Violations" },
  { to: "/fines", label: "Fines" },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">TF</div>
        <div>
          <h2>Traffic Fines</h2>
          <p>Admin operations panel</p>
        </div>
      </div>

      <nav className="nav-list">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
