import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setLoading,
  setError,
  setProjects,
  addCreatedProject,
  removeProject,
  setActiveFilter,
  setSearchQuery,
} from "../State/projects.slice.js";
import { projectService } from "../Services/project.api.js";

export function useProjects() {
  const dispatch = useDispatch();
  const { items, loading, error, activeFilter, searchQuery } = useSelector(
    (state) => state.projects
  );

  const loadProjects = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const data = await projectService.getProjects();
      dispatch(setProjects(data));
      return { success: true, data };
    } catch (err) {
      dispatch(setError(err.message));
      return { success: false, error: err.message };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const createProject = useCallback(
    async (title) => {
      dispatch(setLoading(true));
      dispatch(setError(null));
      try {
        const newProject = await projectService.createProject(title);
        dispatch(addCreatedProject(newProject));
        return { success: true, data: newProject };
      } catch (err) {
        dispatch(setError(err.message));
        return { success: false, error: err.message };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const deleteProject = useCallback(
    async (id) => {
      try {
        await projectService.deleteProject(id);
        dispatch(removeProject(id));
        return { success: true };
      } catch (err) {
        dispatch(setError(err.message));
        return { success: false, error: err.message };
      }
    },
    [dispatch]
  );

  const changeFilter = useCallback(
    (filter) => {
      dispatch(setActiveFilter(filter));
    },
    [dispatch]
  );

  const changeSearch = useCallback(
    (query) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch]
  );

  const filteredProjects = items.filter((p) =>
    (p.title || p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    projects: items,
    filteredProjects,
    loading,
    error,
    activeFilter,
    searchQuery,
    loadProjects,
    createProject,
    deleteProject,
    changeFilter,
    changeSearch,
  };
}
