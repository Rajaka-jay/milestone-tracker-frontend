import { useCallback, useEffect, useState } from 'react';
import { notificationsApi } from '../services/api';

export function useNotifications(enabled = true) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setItems(await notificationsApi.list());
    } catch {
      /* the bell simply keeps its last known state */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [enabled, load]);

  const markRead = useCallback(async (id) => {
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try { await notificationsApi.markRead(id); } catch { load(); }
  }, [load]);

  const markAllRead = useCallback(async () => {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    try { await notificationsApi.markAllRead(); } catch { load(); }
  }, [load]);

  const respond = useCallback(async (id, accept) => {
    const result = await notificationsApi.respond(id, accept);
    await load();
    return result;
  }, [load]);

  return {
    items,
    loading,
    unreadCount: items.filter((n) => !n.read).length,
    markRead,
    markAllRead,
    respond,
    reload: load,
  };
}
