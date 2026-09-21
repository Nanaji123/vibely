import { useCallback, useState } from 'react';

// Convex queries are live, so a pull-to-refresh has nothing to re-fetch; run the optional
// action (e.g. re-analyze) and keep the spinner visible long enough to read as a refresh.
export const usePullRefresh = (action?: () => Promise<unknown>) => {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([action?.(), new Promise((r) => setTimeout(r, 700))]);
    } catch {
      // the screen surfaces its own errors
    } finally {
      setRefreshing(false);
    }
  }, [action]);
  return { refreshing, onRefresh };
};
