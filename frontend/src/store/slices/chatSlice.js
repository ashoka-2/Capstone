import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        'Welcome to your Sandbox AI Assistant! Once your sandbox is started, you can tell me what you want to build or change (e.g. "Create a modern landing page", "Add a counter widget", "Fix layout in App.jsx"). I will directly inspect, create, and update the files in your project.',
      timestamp: new Date().toISOString(),
    },
  ],
  isStreaming: false,
  currentStreamText: '',
  streamLogs: [], // Array of tool status strings: e.g. "Listing files...", "Updating files..."
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({
        id: `user-${Date.now()}`,
        role: 'user',
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
      state.error = null;
    },
    startStreaming: (state) => {
      state.isStreaming = true;
      state.currentStreamText = '';
      state.streamLogs = [];
      state.error = null;
    },
    appendStreamChunk: (state, action) => {
      state.currentStreamText += action.payload;
    },
    addStreamLog: (state, action) => {
      state.streamLogs.push(action.payload);
    },
    finishStreaming: (state, action) => {
      state.isStreaming = false;
      const finalContent = action.payload || state.currentStreamText;
      if (finalContent.trim()) {
        state.messages.push({
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: finalContent,
          logs: [...state.streamLogs],
          timestamp: new Date().toISOString(),
        });
      }
      state.currentStreamText = '';
      state.streamLogs = [];
    },
    setChatError: (state, action) => {
      state.isStreaming = false;
      state.error = action.payload;
      state.messages.push({
        id: `error-${Date.now()}`,
        role: 'system',
        content: `Error: ${action.payload}`,
        timestamp: new Date().toISOString(),
      });
    },
    clearMessages: (state) => {
      state.messages = [initialState.messages[0]];
      state.currentStreamText = '';
      state.streamLogs = [];
      state.error = null;
    },
  },
});

export const {
  addUserMessage,
  startStreaming,
  appendStreamChunk,
  addStreamLog,
  finishStreaming,
  setChatError,
  clearMessages,
} = chatSlice.actions;

export default chatSlice.reducer;

