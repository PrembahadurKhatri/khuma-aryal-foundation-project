import { useState, useEffect } from "react";

/**
 * Calls a contentService fetcher (e.g. getMessages) and tracks loading state.
 * Written against a Promise-returning fetcher so swapping the service layer
 * from local data to a real API later requires no change here.
 */
export function useContent(fetcher) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => {
        if (active) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        // Without this, a failed request (CORS block, wrong API URL, network
        // error, ...) left `loading` stuck at true forever — the page just
        // sat on its skeleton with no way to tell something had gone wrong.
        if (active) {
          console.error("useContent fetch failed:", err);
          setError(err);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error };
}
