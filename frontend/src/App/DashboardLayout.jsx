import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Sidebar from "../Shared/Sidebar.jsx";
import { useProjects } from "../Features/Dashboard/Hooks/useProjects.js";
import { projectService } from "../Features/Dashboard/Services/project.api.js";
import { useSandbox } from "../Features/Workspace/Hooks/useSandbox.js";
import { ScrollToTop } from "../Hooks/useScrollToTop.js";
import { useDispatch } from "react-redux";
import { addToast } from "../utils/toast.slice.js";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
    <div
      className="flex h-screen w-screen overflow-hidden select-none transition-colors"
      style={{
        backgroundColor: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
      }}
    >
      <ScrollToTop />
      <Sidebar
        projects={projects}
        projectsLoading={projectsLoading}
        onSelectProject={handleSelectProject}
        onCreateNew={handleCreateNew}
        onDeleteProject={deleteProject}
        activeFilter={activeFilter}
        setActiveFilter={changeFilter}
      />
      <main className="flex-1 h-full overflow-hidden flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
