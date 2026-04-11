import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="content-shell">
        <Navbar />
        <main className="page-shell">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
