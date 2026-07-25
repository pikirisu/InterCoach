import { Navigate } from "react-router";

import { useAuth } from "../hooks/useAuth";
import { RouteLoader } from "./RouteLoader";

export function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <RouteLoader />;
  }

  return <Navigate replace to={isAuthenticated ? "/app" : "/login"} />;
}
