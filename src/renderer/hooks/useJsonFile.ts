import { useState, useCallback, useRef, useEffect } from 'react';
import type { JsonArray, JsonFileState, JsonObject, JsonValue } from '../../types/json';
import { validateJsonString, formatJsonString } from '../utils/jsonUtils';
import { CONFIG } from '../constants/config';

interface UseJsonFileReturn {
  fileState: JsonFileState;
  openFile: (filePath: string) => Promise<void>;
  saveFile: () => Promise<void>;
  saveFileAs: (filePath: string) => Promise<void>;
  newFile: () => void;
  updateContent: (newContent: string) => void;
  updateParsedContent: (newParsed: JsonValue) => void;
  markAsSaved: () => void;
}

export function useJsonFile(): UseJsonFileReturn {
  const [fileState, setFileState] = useState<JsonFileState>({
    path: null,
    content: null,
    rawContent: '',
    isModified: false,
    isValid: true,
    errors: [],
  });

  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);

  const validateContent = useCallback(
    (content: string): Pick<JsonFileState, 'isValid' | 'errors' | 'content'> => {
      const errors = validateJsonString(content);
      if (errors.length > 0) {
        return {
          isValid: false,
          errors,
          content: null,
        };
      }

      try {
        const parsed = JSON.parse(content) as JsonValue;
        return {
          isValid: true,
          errors: [],
          content: parsed as JsonObject | JsonArray | null,
        };
      } catch {
        return {
          isValid: false,
          errors: [{ path: '', message: 'Failed to parse JSON', line: 1, column: 1 }],
          content: null,
        };
      }
    },
    [],
  );

  const openFile = useCallback(
    async (filePath: string): Promise<void> => {
      const result = (await window.electron.ipcRenderer.invoke('file:read', filePath)) as {
        success: boolean;
        content?: string;
        error?: string;
      };

      if (!result.success) {
        throw new Error(result.error || 'Failed to read file');
      }

      if (result.content === undefined) {
        result.content = '';
      }

      const validation = validateContent(result.content);

      setFileState({
        path: filePath,
        ...validation,
        rawContent: result.content,
        isModified: false,
      });

      undoStack.current = [result.content];
      redoStack.current = [];
    },
    [validateContent],
  );

  const saveFile = useCallback(async (): Promise<void> => {
    if (!fileState.path) {
      throw new Error('No file path set');
    }

    await window.electron.ipcRenderer.invoke('file:write', fileState.path, fileState.rawContent);

    setFileState((prev) => ({
      ...prev,
      isModified: false,
    }));
  }, [fileState.path, fileState.rawContent]);

  const saveFileAs = useCallback(
    async (filePath: string): Promise<void> => {
      await window.electron.ipcRenderer.invoke('file:write', filePath, fileState.rawContent);

      setFileState((prev) => ({
        ...prev,
        path: filePath,
        isModified: false,
      }));
    },
    [fileState.rawContent],
  );

  const newFile = useCallback((): void => {
    setFileState({
      path: null,
      content: null,
      rawContent: '',
      isModified: false,
      isValid: true,
      errors: [],
    });

    undoStack.current = [''];
    redoStack.current = [];
  }, []);

  const updateContent = useCallback(
    (newContent: string): void => {
      const formatted = formatJsonString(newContent);
      const validation = validateContent(formatted);

      setFileState((prev) => {
        if (prev.rawContent === formatted) {
          return prev;
        }

        if (undoStack.current.length >= CONFIG.maxUndoHistory) {
          undoStack.current.shift();
        }
        undoStack.current.push(formatted);
        redoStack.current = [];

        return {
          ...prev,
          ...validation,
          rawContent: formatted,
          isModified: true,
        };
      });
    },
    [validateContent],
  );

  const updateParsedContent = useCallback(
    (newParsed: JsonValue): void => {
      const formatted = JSON.stringify(newParsed, null, 2);
      updateContent(formatted);
    },
    [updateContent],
  );

  const markAsSaved = useCallback((): void => {
    setFileState((prev) => ({
      ...prev,
      isModified: false,
    }));
  }, []);

  return {
    fileState,
    openFile,
    saveFile,
    saveFileAs,
    newFile,
    updateContent,
    updateParsedContent,
    markAsSaved,
  };
}
