import { useEffect } from 'react';

interface ShortcutHandlers {
  onSave?: () => void;
  onSaveAs?: () => void;
  onOpen?: () => void;
  onNew?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onFind?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers): void {
  useEffect(() => {
    const isMac = window.electron.isMac;

    const handleKeyDown = (event: KeyboardEvent): void => {
      const mod = isMac ? event.metaKey : event.ctrlKey;

      if (mod && event.key === 's') {
        event.preventDefault();
        if (event.shiftKey) {
          handlers.onSaveAs?.();
        } else {
          handlers.onSave?.();
        }
      }

      if (mod && event.key === 'o') {
        event.preventDefault();
        handlers.onOpen?.();
      }

      if (mod && event.key === 'n') {
        event.preventDefault();
        handlers.onNew?.();
      }

      if (mod && event.key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          handlers.onRedo?.();
        } else {
          handlers.onUndo?.();
        }
      }

      if (mod && event.key === 'f') {
        event.preventDefault();
        handlers.onFind?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}