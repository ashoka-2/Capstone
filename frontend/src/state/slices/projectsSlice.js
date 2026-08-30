import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { projectService } from "../../services/projectService.js";

export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (_, { rejectWithValue }) => {
    try {
      return await projectService.getProjects();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createProjectThunk = createAsyncThunk(
  "projects/createProject",
  async (title, { rejectWithValue }) => {
    try {
      return await projectService.createProject(title);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const projectsSlice = createSlice({
  name: "projects",
  initialState: {
    items: [],
    loading: false,
    error: null,
    activeFilter: "all", // 'all' | 'starred' | 'owned'
    searchQuery: "",
  },
  reducers: {
    setActiveFilter: (state, action) => {
      state.activeFilter = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProjects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createProjectThunk
      .addCase(createProjectThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export const { setActiveFilter, setSearchQuery } = projectsSlice.actions;
export default projectsSlice.reducer;
