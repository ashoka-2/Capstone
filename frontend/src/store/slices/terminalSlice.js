import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isConnected: false,
  isConnecting: false,
  error: null,
};

const terminalSlice = createSlice({
  name: 'terminal',
  initialState,
  reducers: {
    setConnecting: (state, action) => {
      state.isConnecting = action.payload;
    },
    setConnected: (state, action) => {
      state.isConnected = action.payload;
      state.isConnecting = false;
      if (action.payload) {
        state.error = null;
      }
    },
    setTerminalError: (state, action) => {
      state.error = action.payload;
      state.isConnecting = false;
      state.isConnected = false;
    },
  },
});

export const { setConnecting, setConnected, setTerminalError } = terminalSlice.actions;

export default terminalSlice.reducer;

