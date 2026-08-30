import { useSelector, useDispatch } from "react-redux";
import {
  fetchProjects,
  createProjectThunk,
  setActiveFilter,
  setSearchQuery,
} from "../state/slices/projectsSlice.js";

export function useProjects() {
  const dispatch = useDispatch();
  const { items, loading, error, activeFilter, searchQuery } = useSelector(
    (state) => state.projects
  );

  const loadProjects = () => dispatch(fetchProjects());
  const createProject = (title) => dispatch(createProjectThunk(title));
  const changeFilter = (filter) => dispatch(setActiveFilter(filter));
  const changeSearch = (query) => dispatch(setSearchQuery(query));

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
    changeFilter,
    changeSearch,
  };
}
