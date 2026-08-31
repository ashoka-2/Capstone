import { configureStore } from "@reduxjs/toolkit";
import projectsReducer from "../Features/Dashboard/State/projects.slice.js";
import sandboxReducer from "../Features/Workspace/State/sandbox.slice.js";
import toastReducer from "../utils/toast.slice.js";

export const store = configureStore({
  reducer: {
    projects: projectsReducer,
    sandbox: sandboxReducer,
    toast: toastReducer,
  },
});

export default store;
