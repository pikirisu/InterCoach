import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "../hooks/useAuth";
import { RouteLoader } from "./RouteLoader";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}
