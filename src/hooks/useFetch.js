import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Loads data with loading and error state.
 * `reload({ silent: true })` refreshes without flashing the loading state.
 */
export function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const fetcherRef = useRef(fetcher);
  const requestId = useRef(0);

  useEffect(() => { fetcherRef.current = fetcher; });

  const run = useCallback(async ({ silent = false } = {}) => {
    requestId.current += 1;
    const id = requestId.current;
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      if (id === requestId.current) setState({ data, loading: false, error: null });
    } catch (error) {
      if (id === requestId.current) setState((s) => ({ ...s, loading: false, error }));
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { run(); }, deps);

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }));
  }, []);

  return { ...state, reload: run, setData };
}
