import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import WorkspacePage from "./pages/WorkspacePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import { ScrollToTop } from "./hooks/useScrollToTop.js";
import { useProjects } from "./hooks/useProjects.js";
import { useSandbox } from "./hooks/useSandbox.js";

function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const {
    projects,
    activeFilter,
    loadProjects,
    createProject,
    changeFilter,
  } = useProjects();
  const { startSandbox } = useSandbox();

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSelectProject = async (projectId, projectTitle) => {
    try {
      const sandbox = await startSandbox(projectId, projectTitle).unwrap();
      navigate(`/workspace/${sandbox.sandboxId}`);
    } catch (err) {
      alert(err.message || "Failed to start workspace");
    }
  };

  const handleCreateNew = () => {
    const title = prompt("Enter new workspace title:");
    if (title && title.trim()) {
      createProject(title.trim())
        .unwrap()
        .then((newP) => {
          const pId = newP._id || newP.id || newP.projectId;
          handleSelectProject(pId, title.trim());
        });
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0c0a09] text-stone-100 overflow-hidden select-none">
      <Sidebar
        projects={projects}
        onSelectProject={handleSelectProject}
        onCreateNew={handleCreateNew}
        activeFilter={activeFilter}
        setActiveFilter={changeFilter}
      />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Dashboard Home */}
        <Route
          path="/"
          element={
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          }
        />

        {/* Workspace IDE */}
        <Route path="/workspace/:id" element={<WorkspacePage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
