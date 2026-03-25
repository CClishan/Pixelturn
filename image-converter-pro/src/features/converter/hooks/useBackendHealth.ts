import { useEffect, useState } from 'react';

import { checkBackendHealth } from '../api';
import type { BackendConnectionState } from '../types';

export function useBackendHealth(apiBaseUrl: string): BackendConnectionState {
  const [status, setStatus] = useState<BackendConnectionState>('checking');

  useEffect(() => {
    let isDisposed = false;

    async function probe(): Promise<void> {
      try {
        const isHealthy = await checkBackendHealth(apiBaseUrl);
        if (!isDisposed) {
          setStatus(isHealthy ? 'connected' : 'disconnected');
        }
      } catch {
        if (!isDisposed) {
          setStatus('disconnected');
        }
      }
    }

    setStatus('checking');
    void probe();

    const intervalId = window.setInterval(() => {
      void probe();
    }, 15000);

    return () => {
      isDisposed = true;
      window.clearInterval(intervalId);
    };
  }, [apiBaseUrl]);

  return status;
}
