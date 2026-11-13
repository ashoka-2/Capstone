import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setCreating,
  setSandboxSuccess,
  setSandboxError,
  clearSandbox,
  setActiveTab,
} from '../store/slices/sandboxSlice';
import { startSandboxApi } from '../services/api';

export function useSandbox() {
  const dispatch = useAppDispatch();
  const { sandboxId, previewUrl, status, error, activeTab } = useAppSelector(
    (state) => state.sandbox
  );

  const startSandbox = async () => {
    try {
      dispatch(setCreating());
      const data = await startSandboxApi();
      dispatch(
        setSandboxSuccess({
          sandboxId: data.sandboxId,
          previewUrl: data.previewUrl,
        })
      );
      return data;
    } catch (err) {
      dispatch(setSandboxError(err.message || 'Failed to start sandbox'));
      throw err;
    }
  };

  const resetSandbox = () => {
    dispatch(clearSandbox());
  };

  const switchTab = (tab) => {
    dispatch(setActiveTab(tab));
  };

  return {
    sandboxId,
    previewUrl,
    status,
    error,
    activeTab,
    isReady: status === 'ready' && !!sandboxId,
    isCreating: status === 'creating',
    startSandbox,
    resetSandbox,
    switchTab,
  };
}
