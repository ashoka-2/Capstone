import { configureStore } from "@reduxjs/toolkit";
import projectsReducer from "./slices/projectsSlice.js";
import sandboxReducer from "./slices/sandboxSlice.js";
import uiReducer from "./slices/uiSlice.js";

export const store = configureStore({
  reducer: {
    projects: projectsReducer,
    sandbox: sandboxReducer,
    ui: uiReducer,
  },
});

export default store;
