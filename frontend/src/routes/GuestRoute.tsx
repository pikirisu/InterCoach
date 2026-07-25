import { Navigate, Outlet } from "react-router";

import { useAuth } from "../hooks/useAuth";
import { RouteLoader } from "./RouteLoader";

export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (isAuthenticated) {
    return <Navigate replace to="/app" />;
  }

  return <Outlet />;
}
