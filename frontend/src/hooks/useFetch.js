import { useState, useEffect, useCallback } from 'react';
import { errMsg } from '../services/api.js';

export function useFetch(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try { const r = await fn(); setState({ data: r.data, loading: false, error: null }); }
    catch (e) { setState({ data: null, loading: false, error: errMsg(e) }); }
  }, deps);
  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}
