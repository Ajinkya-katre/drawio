import { useEffect } from 'react';

export function useKeyboardShortcuts(
  undo: () => void,
  redo: () => void
) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }

      if (e.ctrlKey && (e.key === 'y' || e.key === 'Z')) {
        e.preventDefault();
        redo();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);
}
