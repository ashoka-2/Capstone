import { useSelector, useDispatch } from "react-redux";
import {
  startSandboxThunk,
  setActiveSandbox,
  clearActiveSandbox,
  setActiveFile,
  triggerFileRefresh,
} from "../state/slices/sandboxSlice.js";

export function useSandbox() {
  const dispatch = useDispatch();
  const {
    activeSandbox,
    loading,
    startingProjectId,
    error,
    activeFile,
    fileRefreshKey,
  } = useSelector((state) => state.sandbox);

  const startSandbox = (projectId, projectTitle) =>
    dispatch(startSandboxThunk({ projectId, projectTitle }));

  const setSandbox = (sandbox) => dispatch(setActiveSandbox(sandbox));
  const closeSandbox = () => dispatch(clearActiveSandbox());
  const selectFile = (file) => dispatch(setActiveFile(file));
  const refreshFiles = () => dispatch(triggerFileRefresh());

  return {
    activeSandbox,
    loading,
    startingProjectId,
    error,
    activeFile,
    fileRefreshKey,
    startSandbox,
    setSandbox,
    closeSandbox,
    selectFile,
    refreshFiles,
  };
}
