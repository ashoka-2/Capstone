import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setLoading,
  setStartingProjectId,
  setError,
  setActiveSandbox,
  clearActiveSandbox,
  setActiveFile,
  triggerFileRefresh,
} from "../State/sandbox.slice.js";
import { sandboxService } from "../Services/sandbox.api.js";

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

  const startSandbox = useCallback(
    async (projectId, projectTitle, existingSandboxId = null) => {
      dispatch(setLoading(true));
      dispatch(setStartingProjectId(projectId));
      dispatch(setError(null));
      try {
        const data = await sandboxService.startSandbox(projectId, existingSandboxId);
        const host = window.location.hostname;
        const protocol = window.location.protocol;
        const isLocal = host.includes("localhost") || host === "127.0.0.1";

        const agentBase = isLocal
          ? `http://${data.sandboxId}.agent.localhost`
          : `${protocol}//${data.sandboxId}.agent.${host}`;

        const previewUrl =
          data.previewUrl ||
          (isLocal
            ? `http://${data.sandboxId}.preview.localhost`
            : `${protocol}//${data.sandboxId}.preview.${host}`);

        const sandboxObj = {
          sandboxId: data.sandboxId,
          previewUrl,
          agentBase,
          projectId,
          projectTitle: projectTitle || "Workspace",
        };

        dispatch(setActiveSandbox(sandboxObj));
        return { success: true, data: sandboxObj };
      } catch (err) {
        dispatch(setError(err.message));
        return { success: false, error: err.message };
      } finally {
        dispatch(setLoading(false));
        dispatch(setStartingProjectId(null));
      }
    },
    [dispatch]
  );

  const setSandbox = useCallback(
    (sandbox) => dispatch(setActiveSandbox(sandbox)),
    [dispatch]
  );
  const exitSandbox = useCallback(
    () => dispatch(clearActiveSandbox()),
    [dispatch]
  );
  const selectFile = useCallback(
    (file) => dispatch(setActiveFile(file)),
    [dispatch]
  );
  const refreshFiles = useCallback(
    () => dispatch(triggerFileRefresh()),
    [dispatch]
  );

  return {
    activeSandbox,
    loading,
    startingProjectId,
    error,
    activeFile,
    fileRefreshKey,
    startSandbox,
    setSandbox,
    exitSandbox,
    selectFile,
    refreshFiles,
  };
}
