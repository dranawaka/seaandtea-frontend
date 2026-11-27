import { useEffect, useState } from 'react';

export function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));
    Promise.resolve()
      .then(() => fn(controller.signal))
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!active || error?.name === 'AbortError') return;
        console.warn('Things to do request failed', error.status || '');
        setState({ data: null, loading: false, error });
      });
    return () => {
      active = false;
      controller.abort();
    };
    // Caller owns the dependency list. fn is read when those values change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken]);

  return {
    ...state,
    reload: () => setReloadToken((value) => value + 1)
  };
}
