import { configureStore } from '@reduxjs/toolkit';
import sandboxReducer from './slices/sandboxSlice';
import chatReducer from './slices/chatSlice';
import filesReducer from './slices/filesSlice';
import terminalReducer from './slices/terminalSlice';

export const store = configureStore({
  reducer: {
    sandbox: sandboxReducer,
    chat: chatReducer,
    files: filesReducer,
    terminal: terminalReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;
