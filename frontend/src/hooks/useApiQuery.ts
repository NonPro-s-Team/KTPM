import { useCallback, useEffect, useState } from "react";
import { normalizeApiError } from "../api/httpClient";

export function useApiQuery<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  const retry = useCallback(() => setRevision((current) => current + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    load(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(normalizeApiError(requestError).detail);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [load, revision]);

  return { data, loading, error, retry };
}
