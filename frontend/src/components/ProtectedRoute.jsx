import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, role: currentRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (role && currentRole !== role) {
    return <Navigate to={currentRole === "vendor" ? "/vendor-dashboard" : "/user-dashboard"} replace />;
  }

  return children;
}
