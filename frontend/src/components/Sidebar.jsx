import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Zap,
  FolderKanban,
  Star,
  UserCheck,
  Clock,
  ChevronDown,
  Gift,
  ArrowUpRight,
  Bell,
  Plus,
} from "lucide-react";
import { SkeletonSidebarList } from "./SkeletonLoader.jsx";

export default function Sidebar({
  projects = [],
  projectsLoading = false,
  onSelectProject,
  onCreateNew,
  activeFilter,
  setActiveFilter,
  userName = "Ashok",
}) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-60 h-screen bg-[#0c0a09] border-r border-white/[0.06] flex flex-col justify-between select-none shrink-0 z-20">
      {/* Top Section */}
      <div className="flex flex-col p-3 space-y-4">
        {/* Workspace Switcher */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-orange-500/20">
              {userName.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white tracking-tight truncate">
                {userName}'s Lovable
              </span>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-transform" />
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-col space-y-0.5">
          <button
            onClick={() => {
              setActiveFilter?.("all");
              navigate("/");
            }}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              location.pathname === "/"
                ? "bg-white/[0.06] text-white"
                : "text-stone-400 hover:text-stone-200 hover:bg-white/[0.03]"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {}}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-white/[0.03] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </div>
            <kbd className="text-[10px] font-mono text-stone-600 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">
              Ctrl K
            </kbd>
          </button>

          <button
            onClick={() => navigate("/connectors")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              location.pathname === "/connectors"
                ? "bg-white/[0.06] text-white"
                : "text-stone-400 hover:text-stone-200 hover:bg-white/[0.03]"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Connectors</span>
          </button>
        </nav>

        {/* Projects Tree */}
        <div className="flex flex-col pt-2 border-t border-white/[0.05]">
          <div className="flex items-center justify-between px-3 py-1 mb-1">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              Projects
            </span>
            <button
              onClick={onCreateNew}
              className="p-1 hover:bg-white/10 rounded-md text-stone-500 hover:text-white transition-colors"
              title="New Project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col space-y-0.5">
            <button
              onClick={() => {
                setActiveFilter?.("all");
                if (location.pathname !== "/") navigate("/");
              }}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                activeFilter === "all" && location.pathname === "/"
                  ? "bg-white/[0.05] text-white font-medium"
                  : "text-stone-400 hover:bg-white/[0.03] hover:text-stone-200"
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>All projects</span>
            </button>

            <button
              onClick={() => {
                setActiveFilter?.("starred");
                if (location.pathname !== "/") navigate("/");
              }}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                activeFilter === "starred"
                  ? "bg-white/[0.05] text-white font-medium"
                  : "text-stone-400 hover:bg-white/[0.03] hover:text-stone-200"
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>Starred</span>
            </button>

            <button
              onClick={() => {
                setActiveFilter?.("owned");
                if (location.pathname !== "/") navigate("/");
              }}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                activeFilter === "owned"
                  ? "bg-white/[0.05] text-white font-medium"
                  : "text-stone-400 hover:bg-white/[0.03] hover:text-stone-200"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Owned by me</span>
            </button>
          </div>

          {/* Recents */}
          {projectsLoading ? (
            <SkeletonSidebarList count={3} />
          ) : projects.length > 0 ? (
            <div className="flex flex-col mt-4 pt-3 border-t border-white/[0.05]">
              <span className="px-3 text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                Recents
              </span>
              <div className="flex flex-col space-y-0.5 max-h-36 overflow-y-auto">
                {projects.slice(0, 5).map((p) => {
                  const pId = p._id || p.id;
                  const pTitle = p.title || p.name || "Untitled";
                  return (
                    <button
                      key={pId}
                      onClick={() => onSelectProject(pId, pTitle)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-stone-400 hover:text-stone-200 hover:bg-white/[0.03] text-left truncate transition-colors group"
                    >
                      <Clock className="w-3 h-3 text-stone-600 group-hover:text-orange-400 shrink-0" />
                      <span className="truncate">{pTitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-3 space-y-3 border-t border-white/[0.06]">
        {/* Upgrade Link */}
        <div
          onClick={() => {}}
          className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] cursor-pointer transition-colors group"
        >
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-white">Upgrade to Pro</span>
            <span className="text-[10px] text-stone-500">Unlock more features</span>
          </div>
          <ArrowUpRight className="w-4 h-4 text-stone-500 group-hover:text-orange-400 transition-colors" />
        </div>

        {/* User Account Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-[10px] font-bold text-orange-300">
              {userName.charAt(0)}
            </div>
          </div>
          <button className="p-1 text-stone-500 hover:text-stone-300 rounded-lg hover:bg-white/5 transition-colors relative">
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full" />
          </button>
        </div>
      </div>
    </aside>
  );
}
