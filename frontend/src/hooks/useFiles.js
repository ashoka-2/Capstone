import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setFileList,
  setActiveFile,
  setLoadingList,
  setLoadingContent,
  setFileContent,
  updateLocalContent,
  invalidateFileCache,
  setSaving,
  markSaved,
  setFilesError,
} from '../store/slices/filesSlice';
import {
  listFilesApi,
  readFilesApi,
  updateFilesApi,
  createFilesApi,
} from '../services/api';
import { getFileCategory } from '../utils/fileType';

export function useFiles() {
  const dispatch = useAppDispatch();
  const sandboxId = useAppSelector((state) => state.sandbox.sandboxId);

  const {
    fileList,
    activeFile,
    fileContents,
    isUnsaved,
    isLoadingList,
    isLoadingContent,
    isSaving,
    error,
  } = useAppSelector((state) => state.files);

  const loadFileContent = useCallback(
    async (filePath, forceReload = false) => {
      if (!sandboxId || !filePath) return '';

      // Skip utf-8 reading for binary media files (images, audio, video) except SVG
      const categoryInfo = getFileCategory(filePath);
      if (categoryInfo.isMedia && !categoryInfo.isSvg) {
        dispatch(setFileContent({ file: filePath, content: '' }));
        return '';
      }

      // Return cached content only if not forced and not dirty
      if (!forceReload && fileContents[filePath] !== undefined && !isUnsaved[filePath]) {
        return fileContents[filePath];
      }

      try {
        dispatch(setLoadingContent(true));
        const results = await readFilesApi(sandboxId, [filePath]);
        const content = results[filePath] ?? results[`/${filePath}`] ?? '';
        dispatch(setFileContent({ file: filePath, content }));
        return content;
      } catch (err) {
        dispatch(setFilesError(err.message || `Failed to read ${filePath}`));
        return '';
      }
    },
    [sandboxId, fileContents, isUnsaved, dispatch]
  );

  const refreshFiles = useCallback(
    async (forceReloadActive = false) => {
      if (!sandboxId) return [];
      try {
        dispatch(setLoadingList(true));

        if (forceReloadActive) {
          dispatch(invalidateFileCache());
        }

        const files = await listFilesApi(sandboxId);
        dispatch(setFileList(files));

        // Re-read current active file with latest content from container
        if (activeFile) {
          await loadFileContent(activeFile, true);
        }

        return files;
      } catch (err) {
        dispatch(setFilesError(err.message || 'Failed to list files'));
        return [];
      }
    },
    [sandboxId, activeFile, loadFileContent, dispatch]
  );

  const selectFile = useCallback(
    (filePath, forceReload = false) => {
      dispatch(setActiveFile(filePath));
      if (forceReload || fileContents[filePath] === undefined) {
        loadFileContent(filePath, forceReload);
      }
    },
    [dispatch, fileContents, loadFileContent]
  );

  const reloadActiveFile = useCallback(() => {
    if (activeFile) {
      loadFileContent(activeFile, true);
    }
  }, [activeFile, loadFileContent]);

  const modifyFileLocal = useCallback(
    (filePath, newContent) => {
      dispatch(updateLocalContent({ file: filePath, content: newContent }));
    },
    [dispatch]
  );

  const saveActiveFile = useCallback(async () => {
    if (!sandboxId || !activeFile) return;
    const content = fileContents[activeFile] ?? '';
    try {
      dispatch(setSaving(true));
      await updateFilesApi(sandboxId, [{ file: activeFile, content }]);
      dispatch(markSaved(activeFile));
    } catch (err) {
      dispatch(setFilesError(err.message || 'Failed to save file'));
      throw err;
    }
  }, [sandboxId, activeFile, fileContents, dispatch]);

  const createNewFile = useCallback(
    async (filePath, initialContent = '') => {
      if (!sandboxId || !filePath) return;
      try {
        dispatch(setSaving(true));
        await createFilesApi(sandboxId, [{ file: filePath, content: initialContent }]);
        await refreshFiles(true);
        dispatch(setFileContent({ file: filePath, content: initialContent }));
        dispatch(setActiveFile(filePath));
      } catch (err) {
        dispatch(setFilesError(err.message || 'Failed to create file'));
        throw err;
      }
    },
    [sandboxId, refreshFiles, dispatch]
  );

  return {
    fileList,
    activeFile,
    fileContents,
    isUnsaved,
    isLoadingList,
    isLoadingContent,
    isSaving,
    error,
    refreshFiles,
    selectFile,
    loadFileContent,
    reloadActiveFile,
    modifyFileLocal,
    saveActiveFile,
    createNewFile,
  };
}
