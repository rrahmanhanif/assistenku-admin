import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const admin = localStorage.getItem("assistenku_admin");

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
