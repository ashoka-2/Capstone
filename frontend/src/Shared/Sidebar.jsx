import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../Hooks/useTheme.jsx";
import {
  LayoutDashboard,
  Search,
  Cable,
  FolderKanban,
  Star,
  UserCheck,
  Plus,
  Moon,
  Sun,
  Bell,
  Clock,
  Sparkles,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { SkeletonSidebarList } from "../Components/SkeletonLoader.jsx";

export default function Sidebar({
  projects = [],
  projectsLoading = false,
  onSelectProject,
  onCreateNew,
  onDeleteProject,
  activeFilter = "all",
  setActiveFilter,
  userName = "Ashok",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  const navActive =
    "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))] font-semibold shadow-sm";
  const navIdle =
    "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))] font-medium";

  return (
    <aside className="w-60 h-screen bg-[hsl(var(--sidebar))] border-r border-[hsl(var(--sidebar-border))] flex flex-col justify-between shrink-0 select-none z-20 transition-colors duration-200">
      {/* Top Header & Navigation */}
      <div className="flex flex-col space-y-4">
        {/* Workspace Dropdown */}
        <div className="p-3 border-b border-[hsl(var(--sidebar-border))]">
          <button
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[hsl(var(--sidebar-accent))] transition-colors group text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--brand-tiger-primary)), hsl(var(--brand-flamingo-primary)))",
                }}
              >
                {userName.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[hsl(var(--sidebar-foreground))] truncate">
                  {userName}'s Lovable
                </span>
                <span className="text-[10px] text-[hsl(var(--muted-foreground)/0.7)] truncate">
                  Core Workspace
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--sidebar-foreground))] transition-transform" />
          </button>
        </div>

        {/* Primary Links */}
        <div className="px-3 space-y-0.5">
          <button
            onClick={() => navigate("/")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
              location.pathname === "/" ? navActive : navIdle
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[hsl(var(--brand-tiger-primary))]" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => navigate("/search")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
              location.pathname === "/search" ? navActive : navIdle
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[hsl(var(--sidebar-border))] text-[hsl(var(--muted-foreground))]">
              Ctrl K
            </span>
          </button>

          <button
            onClick={() => navigate("/connectors")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
              location.pathname === "/connectors" ? navActive : navIdle
            }`}
          >
            <Cable className="w-4 h-4" />
            <span>Connectors</span>
          </button>
        </div>

        {/* Projects Filter Sections */}
        <div className="px-3 pt-2">
          <div className="flex items-center justify-between px-3 py-1 mb-1">
            <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground)/0.6)] uppercase tracking-wider">
              Projects
            </span>
            <button
              onClick={onCreateNew}
              className="p-1 hover:bg-[hsl(var(--sidebar-accent))] rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--sidebar-foreground))] transition-colors"
              title="New Project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col space-y-0.5">
            {[
              { key: "all", icon: FolderKanban, label: "All projects" },
              { key: "starred", icon: Star, label: "Starred" },
              { key: "owned", icon: UserCheck, label: "Owned by me" },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveFilter?.(key);
                  if (location.pathname !== "/") navigate("/");
                }}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  activeFilter === key && location.pathname === "/"
                    ? navActive
                    : navIdle
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    key === "starred" ? "text-amber-500" : ""
                  }`}
                />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Recents list with delete */}
          {projectsLoading ? (
            <SkeletonSidebarList count={3} />
          ) : projects.length > 0 ? (
            <div className="flex flex-col mt-4 pt-3 border-t border-[hsl(var(--sidebar-border))]">
              <span className="px-3 text-[10px] font-bold text-[hsl(var(--muted-foreground)/0.5)] uppercase tracking-wider mb-1.5">
                Recents
              </span>
              <div className="flex flex-col space-y-0.5 max-h-48 overflow-y-auto">
                {projects.slice(0, 6).map((p) => {
                  const pId = p._id || p.id;
                  const pTitle = p.title || p.name || "Untitled";
                  return (
                    <div
                      key={pId}
                      className={`group flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${navIdle}`}
                    >
                      <button
                        onClick={() => onSelectProject(pId, pTitle)}
                        className="flex items-center gap-2 truncate text-left flex-1 min-w-0"
                      >
                        <Clock className="w-3 h-3 shrink-0 group-hover:text-[hsl(var(--brand-tiger-primary))]" />
                        <span className="truncate">{pTitle}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              `Delete project "${pTitle}" and terminate pod?`
                            )
                          ) {
                            onDeleteProject?.(pId);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-400 transition-opacity"
                        title="Delete project"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Bottom User Avatar & Theme Switcher */}
      <div className="p-3 border-t border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--brand-tiger-primary)), hsl(var(--brand-flamingo-primary)))",
              }}
            >
              {userName.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[hsl(var(--sidebar-foreground))]">
                {userName}
              </span>
              <span className="text-[9px] text-[hsl(var(--muted-foreground))]">
                Lovable Pro
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--sidebar-foreground))] transition-colors"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              )}
            </button>

            {/* Notifications */}
            <button
              className="p-1.5 rounded-lg hover:bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--sidebar-foreground))] transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[hsl(var(--brand-flamingo-primary))]" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
