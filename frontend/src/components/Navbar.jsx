import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="topbar">
      <div className="container nav-row">
        <Link to="/" className="brand">ServiceHub</Link>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          {!isAuthenticated && <Link to="/auth">Login</Link>}
          {isAuthenticated && (
            <Link to={role === "vendor" ? "/vendor-dashboard" : "/user-dashboard"}>Dashboard</Link>
          )}
          {isAuthenticated && (
            <button className="btn secondary small" onClick={handleLogout}>Logout</button>
          )}
        </nav>
      </div>
    </header>
  );
}
