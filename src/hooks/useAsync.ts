import { useEffect, useState } from "react";

interface State<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/** Hook simples para consumir services que retornam Promise. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): State<T> & { reload: () => void } {
  const [state, setState] = useState<State<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    fn()
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error) => alive && setState({ data: null, loading: false, error }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { ...state, reload: () => setNonce((n) => n + 1) };
}
