import { useEffect } from 'react';

/** Calls onDismiss when the user clicks outside `ref` or presses Escape. */
export function useDismiss(ref, active, onDismiss) {
  useEffect(() => {
    if (!active) return undefined;
    const onPointer = (e) => { if (ref.current && !ref.current.contains(e.target)) onDismiss(); };
    const onKey = (e) => { if (e.key === 'Escape') onDismiss(); };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, active, onDismiss]);
}
