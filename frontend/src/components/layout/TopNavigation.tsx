import { LogOut, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { useAuth } from "../../hooks/useAuth";
import { Button, useToast } from "../ui";

interface TopNavigationProps {
  onMenuClick: () => void;
}

function getInitials(name?: string) {
  if (!name) {
    return "IC";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function TopNavigation({ onMenuClick }: TopNavigationProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogout = async () => {
    await logout();
    showToast({ description: "Your session has ended.", title: "Signed out", tone: "info" });
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/85 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button aria-label="Open navigation" className="size-10 px-0 lg:hidden" onClick={onMenuClick} size="sm" variant="ghost">
            <Menu aria-hidden="true" size={20} />
          </Button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 py-1.5 pl-1.5 pr-3 transition hover:border-slate-700" to="/app/profile">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-xs font-semibold text-white">
              {getInitials(user?.name)}
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-sm font-semibold text-slate-50">{user?.name ?? "InterCoach"}</span>
              <span className="block truncate text-xs text-slate-500">{user?.email ?? "Workspace"}</span>
            </span>
          </Link>
          <Button aria-label="Log out" className="size-10 px-0" onClick={handleLogout} size="sm" variant="secondary">
            <LogOut aria-hidden="true" size={17} />
          </Button>
        </div>
      </div>
    </header>
  );
}
