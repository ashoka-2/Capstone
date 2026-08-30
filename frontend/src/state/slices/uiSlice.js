import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    activeTab: "preview", // 'preview' | 'files'
    isTerminalOpen: true,
    terminalHeight: 220,
    sidebarCollapsed: false,
    deviceView: "desktop", // 'desktop' | 'tablet' | 'mobile'
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    toggleTerminal: (state) => {
      state.isTerminalOpen = !state.isTerminalOpen;
    },
    setTerminalOpen: (state, action) => {
      state.isTerminalOpen = action.payload;
    },
    setTerminalHeight: (state, action) => {
      state.terminalHeight = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setDeviceView: (state, action) => {
      state.deviceView = action.payload;
    },
  },
});

export const {
  setActiveTab,
  toggleTerminal,
  setTerminalOpen,
  setTerminalHeight,
  toggleSidebar,
  setDeviceView,
} = uiSlice.actions;

export default uiSlice.reducer;
