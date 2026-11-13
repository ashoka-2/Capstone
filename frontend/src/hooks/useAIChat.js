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
import { invokeAIAgent } from '../services/aiStream';

export function useAIChat({ onGenerationComplete } = {}) {
  const dispatch = useAppDispatch();
  const { messages, isStreaming, currentStreamText, streamLogs, error } = useAppSelector(
    (state) => state.chat
  );
  const sandboxId = useAppSelector((state) => state.sandbox.sandboxId);
  const abortControllerRef = useRef(null);

  const sendMessage = useCallback(
    async (messageText) => {
      const trimmed = messageText.trim();
      if (!trimmed || isStreaming) return;

      if (!sandboxId) {
        dispatch(setChatError('Please start a sandbox environment first.'));
        return;
      }

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
            dispatch(finishStreaming(finalText));
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
    [isStreaming, sandboxId, dispatch, onGenerationComplete]
  );

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      dispatch(finishStreaming());
    }
  }, [dispatch]);

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
    clearChatHistory,
  };
}

