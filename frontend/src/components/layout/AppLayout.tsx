import { Outlet } from "react-router";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Outlet />
    </div>
  );
}
