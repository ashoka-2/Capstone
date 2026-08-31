import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  FolderCode,
  Sparkles,
  Play,
  Layers,
  Plus,
  Search,
  Cpu,
  Terminal as TermIcon,
  Globe,
  Loader2,
  ArrowRight,
  Zap,
  Box,
  Compass,
  Command,
} from "lucide-react";

export default function SplashScreen({ onSandboxCreated }) {
  const [loading, setLoading] = useState(false);
  const [loadingProjectId, setLoadingProjectId] = useState(null);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [loadingStep, setLoadingStep] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/sandbox/project", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects || []);
        }
      } catch {
        // Silently ignore
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleOpenProject = async (projectId, projectTitle) => {
    setLoadingProjectId(projectId);
    setError(null);
    try {
      const res = await fetch("/api/sandbox/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) throw new Error(`Failed to start sandbox (${res.status})`);
      const data = await res.json();
      onSandboxCreated({ ...data, projectId, projectTitle });
    } catch (err) {
      setError(err.message || "Failed to start sandbox");
      setLoadingProjectId(null);
    }
  };

  const handleCreate = async (customTitle) => {
    const projectTitle = (customTitle || title).trim();
    if (!projectTitle) {
      setError("Please provide a project name");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setLoadingStep("project");
      const projectRes = await fetch("/api/sandbox/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: projectTitle }),
      });
      if (!projectRes.ok)
        throw new Error(`Failed to create project (${projectRes.status})`);
      const projectData = await projectRes.json();
      const projectId =
        projectData.project?._id ||
        projectData.project?.id ||
        projectData.projectId;

      setLoadingStep("sandbox");
      const sandboxRes = await fetch("/api/sandbox/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectId }),
      });
      if (!sandboxRes.ok)
        throw new Error(`Failed to start sandbox (${sandboxRes.status})`);
      const sandboxData = await sandboxRes.json();
      onSandboxCreated({ ...sandboxData, projectId, projectTitle });
    } catch (err) {
      setError(err.message || "Failed to create sandbox");
      setLoading(false);
      setLoadingStep("");
    }
  };

  const filteredProjects = projects.filter((p) =>
    (p.title || p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-[#040508] text-slate-100 p-6 overflow-x-hidden overflow-y-auto select-none">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-white mb-2">Cloud Sandbox</h1>
        <p className="text-slate-400 text-sm">Kubernetes IDE Container Environment</p>
      </div>
    </div>
  );
}
