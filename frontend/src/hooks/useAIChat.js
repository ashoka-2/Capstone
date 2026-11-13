import { useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addUserMessage,
  startStreaming,
  appendStreamChunk,
  addStreamLog,
  finishStreaming,
  setChatError,
  clearMessages,
} from '../store/slices/chatSlice';
import { setDiffOriginals, setFileContent } from '../store/slices/filesSlice';
import { invokeAIAgent } from '../services/aiStream';
import { updateFilesApi } from '../services/api';

export function useAIChat({ onGenerationComplete } = {}) {
  const dispatch = useAppDispatch();
  const { messages, isStreaming, currentStreamText, streamLogs, error } = useAppSelector(
    (state) => state.chat
  );
  const sandboxId = useAppSelector((state) => state.sandbox.sandboxId);
  const fileContents = useAppSelector((state) => state.files.fileContents);
  const abortControllerRef = useRef(null);

  const sendMessage = useCallback(
    async (messageText) => {
      const trimmed = messageText.trim();
      if (!trimmed || isStreaming) return;

      if (!sandboxId) {
        dispatch(setChatError('Please start a sandbox environment first.'));
        return;
      }

      // Snapshot existing files before AI modifies them
      const preAiSnapshot = { ...fileContents };

      dispatch(addUserMessage(trimmed));
      dispatch(startStreaming());

      abortControllerRef.current = new AbortController();

      try {
        await invokeAIAgent({
          projectId: sandboxId,
          message: trimmed,
          onLog: (log) => {
            dispatch(addStreamLog(log));
          },
          onChunk: (chunk) => {
            dispatch(appendStreamChunk(chunk));
          },
          onDone: (finalText) => {
            if (Object.keys(preAiSnapshot).length > 0) {
              dispatch(setDiffOriginals(preAiSnapshot));
            }
            dispatch(
              finishStreaming({
                content: finalText,
                snapshot: preAiSnapshot,
              })
            );
            onGenerationComplete?.();
          },
          onError: (errMsg) => {
            dispatch(setChatError(errMsg));
          },
          signal: abortControllerRef.current.signal,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          dispatch(setChatError(err.message || 'Failed to generate code with AI'));
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [isStreaming, sandboxId, fileContents, dispatch, onGenerationComplete]
  );

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      dispatch(finishStreaming());
    }
  }, [dispatch]);

  const undoAiChanges = useCallback(
    async (snapshot) => {
      if (!sandboxId || !snapshot || Object.keys(snapshot).length === 0) return;
      try {
        const updates = Object.entries(snapshot)
          .filter(([, content]) => typeof content === 'string')
          .map(([file, content]) => ({ file, content }));

        if (updates.length > 0) {
          await updateFilesApi(sandboxId, updates);
          updates.forEach(({ file, content }) => {
            dispatch(setFileContent({ file, content }));
          });
          onGenerationComplete?.();
        }
      } catch (err) {
        dispatch(setChatError(err.message || 'Failed to undo AI changes'));
      }
    },
    [sandboxId, dispatch, onGenerationComplete]
  );

  const clearChatHistory = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  return {
    messages,
    isStreaming,
    currentStreamText,
    streamLogs,
    error,
    sendMessage,
    stopGeneration,
    undoAiChanges,
    clearChatHistory,
  };
}

export default useAIChat;
