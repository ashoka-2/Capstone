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
  X,
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
  isOpen = false,
  onClose,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleTheme, isDark } = useTheme();
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  const navActive =
    "bg-[#ff5a5f]/15 text-[#ff7e40] font-semibold border border-[#ff5a5f]/25 shadow-sm";
  const navIdle =
    "text-sub hover:bg-black/5 dark:hover:bg-white/5 hover:text-main font-medium";

  const content = (
    <aside className="w-64 h-full bg-aside border-r border-aside flex flex-col justify-between shrink-0 select-none z-30 transition-colors duration-200 text-main">
      {/* Top Header & Navigation */}
      <div className="flex flex-col space-y-4">
        {/* Workspace Dropdown Header */}
        <div className="p-3 border-b border-aside">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              className="flex-1 flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#ff5a5f] to-[#ff7e40] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md shadow-[#ff5a5f]/20">
                  {userName.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-main truncate">
                    {userName}'s Studio
                  </span>
                  <span className="text-[10px] text-sub truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff7e40]" />
                    Online Workspace
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-sub group-hover:text-main transition-transform ${workspaceMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden p-2 text-sub hover:text-main rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Primary Links */}
        <div className="px-3 space-y-1">
          <button
            onClick={() => {
              navigate("/");
              if (onClose) onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
              location.pathname === "/" ? navActive : navIdle
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#ff7e40]" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {
              navigate("/search");
              if (onClose) onClose();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
              location.pathname === "/search" ? navActive : navIdle
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-subtle text-sub bg-panel">
              Ctrl K
            </span>
          </button>

          <button
            onClick={() => {
              navigate("/connectors");
              if (onClose) onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
              location.pathname === "/connectors" ? navActive : navIdle
            }`}
          >
            <Cable className="w-4 h-4 text-sky-400" />
            <span>Connectors</span>
          </button>
        </div>

        {/* Projects Filter Sections */}
        <div className="px-3 pt-2">
          <div className="flex items-center justify-between px-3 py-1 mb-1">
            <span className="text-[10px] font-bold text-sub uppercase tracking-wider">
              Projects
            </span>
            <button
              onClick={onCreateNew}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md text-sub hover:text-[#ff7e40] transition-colors"
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
                  if (onClose) onClose();
                }}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  activeFilter === key && location.pathname === "/"
                    ? navActive
                    : navIdle
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    key === "starred" ? "text-amber-400" : ""
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
            <div className="flex flex-col mt-4 pt-3 border-t border-aside">
              <span className="px-3 text-[10px] font-bold text-sub uppercase tracking-wider mb-1.5">
                Recents
              </span>
              <div className="flex flex-col space-y-0.5 max-h-48 overflow-y-auto">
                {projects.slice(0, 8).map((p) => {
                  const pId = p._id || p.id;
                  const pTitle = p.title || p.name || "Untitled";
                  return (
                    <div
                      key={pId}
                      className={`group flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${navIdle}`}
                    >
                      <button
                        onClick={() => {
                          onSelectProject(pId, pTitle);
                          if (onClose) onClose();
                        }}
                        className="flex items-center gap-2 truncate text-left flex-1 min-w-0"
                      >
                        <Clock className="w-3 h-3 shrink-0 text-sub group-hover:text-[#ff7e40]" />
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
      <div className="p-3 border-t border-aside">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ff5a5f] to-[#ff7e40] flex items-center justify-center text-white text-[10px] font-bold shadow-sm shadow-[#ff5a5f]/20">
              {userName.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-main">
                {userName}
              </span>
              <span className="text-[9px] text-sub">
                Cloud Studio Pro
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme Toggle with Skipper UI View Transition */}
            <button
              onClick={(e) => toggleTheme(e)}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-sub hover:text-main transition-transform hover:rotate-45"
              title={isDark ? "Switch to soothing light mode" : "Switch to studio dark mode"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            {/* Notifications */}
            <button
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-sub hover:text-main transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#ff5a5f]" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        {content}
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative z-10 w-64 h-full shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
