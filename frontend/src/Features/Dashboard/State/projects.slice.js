import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  loading: false,
  error: null,
  activeFilter: "all", // 'all' | 'starred' | 'owned'
  searchQuery: "",
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setProjects: (state, action) => {
      state.items = action.payload || [];
    },
    addCreatedProject: (state, action) => {
      state.items.unshift(action.payload);
    },
    removeProject: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((p) => (p.id || p._id) !== id);
    },
    setActiveFilter: (state, action) => {
      state.activeFilter = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setProjects,
  addCreatedProject,
  removeProject,
  setActiveFilter,
  setSearchQuery,
} = projectsSlice.actions;

export default projectsSlice.reducer;
