import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { sandboxService } from "../../services/sandboxService.js";

export const startSandboxThunk = createAsyncThunk(
  "sandbox/startSandbox",
  async ({ projectId, projectTitle }, { rejectWithValue }) => {
    try {
      const data = await sandboxService.startSandbox(projectId);
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

      return {
        sandboxId: data.sandboxId,
        previewUrl,
        agentBase,
        projectId,
        projectTitle: projectTitle || "Workspace",
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const sandboxSlice = createSlice({
  name: "sandbox",
  initialState: {
    activeSandbox: null, // { sandboxId, previewUrl, agentBase, projectId, projectTitle }
    loading: false,
    startingProjectId: null,
    error: null,
    activeFile: null,
    fileRefreshKey: 0,
  },
  reducers: {
    setActiveSandbox: (state, action) => {
      state.activeSandbox = action.payload;
    },
    clearActiveSandbox: (state) => {
      state.activeSandbox = null;
      state.activeFile = null;
    },
    setActiveFile: (state, action) => {
      state.activeFile = action.payload;
    },
    triggerFileRefresh: (state) => {
      state.fileRefreshKey += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startSandboxThunk.pending, (state, action) => {
        state.loading = true;
        state.startingProjectId = action.meta.arg.projectId;
        state.error = null;
      })
      .addCase(startSandboxThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.startingProjectId = null;
        state.activeSandbox = action.payload;
      })
      .addCase(startSandboxThunk.rejected, (state, action) => {
        state.loading = false;
        state.startingProjectId = null;
        state.error = action.payload;
      });
  },
});

export const {
  setActiveSandbox,
  clearActiveSandbox,
  setActiveFile,
  triggerFileRefresh,
} = sandboxSlice.actions;

export default sandboxSlice.reducer;
