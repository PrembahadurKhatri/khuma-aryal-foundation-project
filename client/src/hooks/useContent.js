import { useState, useEffect } from "react";

/**
 * Calls a contentService fetcher (e.g. getMessages) and tracks loading state.
 * Written against a Promise-returning fetcher so swapping the service layer
 * from local data to a real API later requires no change here.
 */
export function useContent(fetcher) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetcher().then((result) => {
      if (active) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading };
}
