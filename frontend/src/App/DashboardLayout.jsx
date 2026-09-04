import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../Shared/Sidebar.jsx";
import Preloader from "../Components/Preloader.jsx";
import PageTransition from "../Components/PageTransition.jsx";
import { useProjects } from "../Features/Dashboard/Hooks/useProjects.js";
import { projectService } from "../Features/Dashboard/Services/project.api.js";
import { useSandbox } from "../Features/Workspace/Hooks/useSandbox.js";
import { ScrollToTop } from "../Hooks/useScrollToTop.js";
import { useDispatch } from "react-redux";
import { addToast } from "../utils/toast.slice.js";
import { Menu, Sparkles } from "lucide-react";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [preloaderDone, setPreloaderDone] = useState(false);

  const {
    projects,
    loading: projectsLoading,
    activeFilter,
    loadProjects,
    createProject,
    deleteProject,
    changeFilter,
  } = useProjects();
  const { startSandbox } = useSandbox();

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSelectProject = async (projectId, projectTitle) => {
    try {
      const proj = projects.find((p) => (p._id || p.id) === projectId);
      const sandboxRes = await startSandbox(projectId, projectTitle, proj?.sandboxId);
      if (!sandboxRes.success) throw new Error(sandboxRes.error);
      const sandbox = sandboxRes.data;
      if (proj && !proj.sandboxId && sandbox.sandboxId) {
        projectService.updateProjectSandboxId(projectId, sandbox.sandboxId);
      }
      navigate(`/workspace/${sandbox.sandboxId}`, {
        state: { projectId, projectTitle },
      });
    } catch (err) {
      dispatch(
        addToast({
          message: err.message || "Failed to start workspace",
          type: "error",
        })
      );
    }
  };

  const handleCreateNew = async () => {
    const title = prompt("Enter new workspace title:");
    if (title && title.trim()) {
      const cleanTitle = title.trim();
      const projRes = await createProject(cleanTitle);
      if (projRes.success) {
        const pId = projRes.data._id || projRes.data.id || projRes.data.projectId;
        handleSelectProject(pId, cleanTitle);
      } else {
        dispatch(
          addToast({
            message: projRes.error || "Failed to create project",
            type: "error",
          })
        );
      }
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden select-none bg-canvas text-main transition-colors duration-200">
      <Preloader onComplete={() => setPreloaderDone(true)} />
      <ScrollToTop />

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-aside/90 backdrop-blur-md border-b border-subtle flex items-center justify-between px-4 z-40 text-main">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 text-sub hover:text-main rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#ff5a5f] to-[#ff7e40] flex items-center justify-center text-white shadow-sm shadow-[#ff5a5f]/20">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold text-main">Lovable</span>
        </div>
        <div className="w-8" />
      </div>

      <Sidebar
        projects={projects}
        projectsLoading={projectsLoading}
        onSelectProject={handleSelectProject}
        onCreateNew={handleCreateNew}
        onDeleteProject={deleteProject}
        activeFilter={activeFilter}
        setActiveFilter={changeFilter}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <main className="flex-1 h-full overflow-hidden flex flex-col pt-14 md:pt-0 bg-canvas">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}
