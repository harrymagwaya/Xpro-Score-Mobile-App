import { useCallback, useEffect, useRef, useState } from 'react';

export function useAsyncResource(loader, deps = [], { immediate = true, enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate && enabled);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const run = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return null;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const result = await loader();

      if (isMountedRef.current && requestId === requestIdRef.current) {
        setData(result);
      }

      return result;
    } catch (err) {
      if (isMountedRef.current && requestId === requestIdRef.current) {
        setError(err);
      }

      throw err;
    } finally {
      if (isMountedRef.current && requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [enabled, ...deps]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1;
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (immediate && enabled) {
      run().catch(() => {});
    }
  }, [enabled, immediate, run]);

  return { data, loading, error, reload: run, setData };
}
