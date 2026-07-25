import { Outlet } from "react-router";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <Outlet />
    </div>
  );
}
