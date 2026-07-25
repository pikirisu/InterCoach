import { LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router";

import { useAuth } from "../../hooks/useAuth";
import { Button, useToast } from "../ui";

interface TopNavigationProps {
  onMenuClick: () => void;
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
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button aria-label="Open navigation" className="size-9 px-0 lg:hidden" onClick={onMenuClick} size="sm" variant="ghost">
            <Menu aria-hidden="true" size={20} />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">{user?.name ?? "InterCoach"}</p>
            <p className="hidden truncate text-xs text-slate-500 sm:block">{user?.email ?? "Frontend workspace"}</p>
          </div>
        </div>

        <Button leftIcon={<LogOut aria-hidden="true" size={16} />} onClick={handleLogout} size="sm" variant="secondary">
          Logout
        </Button>
      </div>
    </header>
  );
}
