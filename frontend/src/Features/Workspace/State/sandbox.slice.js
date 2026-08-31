import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeSandbox: null, // { sandboxId, previewUrl, agentBase, projectId, projectTitle }
  loading: false,
  startingProjectId: null,
  error: null,
  activeFile: null,
  fileRefreshKey: 0,
};

const sandboxSlice = createSlice({
  name: "sandbox",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setStartingProjectId: (state, action) => {
      state.startingProjectId = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setActiveSandbox: (state, action) => {
      state.activeSandbox = action.payload;
    },
    clearActiveSandbox: (state) => {
      state.activeSandbox = null;
      state.activeFile = null;
      state.startingProjectId = null;
    },
    setActiveFile: (state, action) => {
      state.activeFile = action.payload;
    },
    triggerFileRefresh: (state) => {
      state.fileRefreshKey += 1;
    },
  },
});

export const {
  setLoading,
  setStartingProjectId,
  setError,
  setActiveSandbox,
  clearActiveSandbox,
  setActiveFile,
  triggerFileRefresh,
} = sandboxSlice.actions;

export default sandboxSlice.reducer;
