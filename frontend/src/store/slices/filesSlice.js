import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fileList: [],
  activeFile: 'src/App.jsx',
  fileContents: {}, // { [filePath: string]: string }
  isUnsaved: {},    // { [filePath: string]: boolean }
  isLoadingList: false,
  isLoadingContent: false,
  isSaving: false,
  error: null,
};

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setLoadingList: (state, action) => {
      state.isLoadingList = action.payload;
    },
    setFileList: (state, action) => {
      state.fileList = action.payload;
      state.isLoadingList = false;
      // Default to src/App.jsx or first file if activeFile is not present
      if (!state.activeFile && action.payload.length > 0) {
        state.activeFile = action.payload.find((f) => f.includes('App.jsx')) || action.payload[0];
      }
    },
    setActiveFile: (state, action) => {
      state.activeFile = action.payload;
    },
    setLoadingContent: (state, action) => {
      state.isLoadingContent = action.payload;
    },
    setFileContent: (state, action) => {
      const { file, content } = action.payload;
      state.fileContents[file] = content;
      state.isUnsaved[file] = false;
      state.isLoadingContent = false;
    },
    updateLocalContent: (state, action) => {
      const { file, content } = action.payload;
      state.fileContents[file] = content;
      state.isUnsaved[file] = true;
    },
    invalidateFileCache: (state) => {
      // Clear cached contents for clean files so fresh content is fetched from container
      Object.keys(state.fileContents).forEach((file) => {
        if (!state.isUnsaved[file]) {
          delete state.fileContents[file];
        }
      });
    },
    setSaving: (state, action) => {
      state.isSaving = action.payload;
    },
    markSaved: (state, action) => {
      const file = action.payload;
      state.isUnsaved[file] = false;
      state.isSaving = false;
    },
    setFilesError: (state, action) => {
      state.error = action.payload;
      state.isLoadingList = false;
      state.isLoadingContent = false;
      state.isSaving = false;
    },
  },
});

export const {
  setLoadingList,
  setFileList,
  setActiveFile,
  setLoadingContent,
  setFileContent,
  updateLocalContent,
  invalidateFileCache,
  setSaving,
  markSaved,
  setFilesError,
} = filesSlice.actions;

export default filesSlice.reducer;
