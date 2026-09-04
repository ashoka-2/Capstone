import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeSandbox: null, // { sandboxId, previewUrl, agentBase, projectId, projectTitle }
  loading: false,
  startingProjectId: null,
  error: null,
  activeFile: null,
  fileRefreshKey: 0,
  // Rollback and snapshot tracking
  pendingChanges: {}, // { [filePath]: { previousContent, messageId, status: 'pending' } }
  fileSnapshots: {},  // { [messageId]: { [filePath]: content } }
  activeAiReadingFiles: [], // array of files currently being read by AI
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
      state.pendingChanges = {};
      state.fileSnapshots = {};
      state.activeAiReadingFiles = [];
    },
    setActiveFile: (state, action) => {
      state.activeFile = action.payload;
    },
    triggerFileRefresh: (state) => {
      state.fileRefreshKey += 1;
    },
    saveSnapshot: (state, action) => {
      const { messageId, filesMap } = action.payload;
      state.fileSnapshots[messageId] = filesMap;
    },
    setPendingChanges: (state, action) => {
      const { messageId, changes } = action.payload;
      // changes is an array of { filePath, previousContent }
      changes.forEach(({ filePath, previousContent }) => {
        state.pendingChanges[filePath] = {
          messageId,
          previousContent,
          status: "pending",
        };
      });
    },
    acceptFileChange: (state, action) => {
      const { filePath } = action.payload;
      delete state.pendingChanges[filePath];
    },
    rejectFileChange: (state, action) => {
      const { filePath } = action.payload;
      delete state.pendingChanges[filePath];
    },
    clearAllPendingChangesForMessage: (state, action) => {
      const { messageId } = action.payload;
      Object.keys(state.pendingChanges).forEach((path) => {
        if (state.pendingChanges[path]?.messageId === messageId) {
          delete state.pendingChanges[path];
        }
      });
    },
    setActiveAiReadingFiles: (state, action) => {
      state.activeAiReadingFiles = action.payload;
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
  saveSnapshot,
  setPendingChanges,
  acceptFileChange,
  rejectFileChange,
  clearAllPendingChangesForMessage,
  setActiveAiReadingFiles,
} = sandboxSlice.actions;

export default sandboxSlice.reducer;
