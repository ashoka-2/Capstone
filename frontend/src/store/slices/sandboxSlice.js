import { createSlice } from '@reduxjs/toolkit';

// Retrieve cached sandbox info from localStorage if available
const cachedSandboxId = localStorage.getItem('capstone_sandbox_id') || null;
const cachedPreviewUrl = localStorage.getItem('capstone_preview_url') || null;

const initialState = {
  sandboxId: cachedSandboxId,
  previewUrl: cachedPreviewUrl || (cachedSandboxId ? `http://${cachedSandboxId}.preview.localhost` : null),
  status: cachedSandboxId ? 'ready' : 'idle', // 'idle' | 'creating' | 'ready' | 'error'
  error: null,
  activeTab: 'preview', // 'preview' | 'code' | 'terminal'
};

const sandboxSlice = createSlice({
  name: 'sandbox',
  initialState,
  reducers: {
    setCreating: (state) => {
      state.status = 'creating';
      state.error = null;
    },
    setSandboxSuccess: (state, action) => {
      const { sandboxId, previewUrl } = action.payload;
      state.sandboxId = sandboxId;
      state.previewUrl = previewUrl || `http://${sandboxId}.preview.localhost`;
      state.status = 'ready';
      state.error = null;
      localStorage.setItem('capstone_sandbox_id', sandboxId);
      if (previewUrl) {
        localStorage.setItem('capstone_preview_url', previewUrl);
      }
    },
    setSandboxError: (state, action) => {
      state.status = 'error';
      state.error = action.payload || 'Failed to initialize sandbox';
    },
    clearSandbox: (state) => {
      state.sandboxId = null;
      state.previewUrl = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('capstone_sandbox_id');
      localStorage.removeItem('capstone_preview_url');
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

export const {
  setCreating,
  setSandboxSuccess,
  setSandboxError,
  clearSandbox,
  setActiveTab,
} = sandboxSlice.actions;

export default sandboxSlice.reducer;
