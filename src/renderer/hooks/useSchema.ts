import { useState, useCallback } from 'react';
import type { SchemaDefinition } from '../types/schema';
import type { JsonValue } from '../types/json';
import { validateValueAgainstSchema } from '../utils/schemaUtils';
import { getSchemaFileName } from '../utils/fileUtils';

interface UseSchemaReturn {
  schema: SchemaDefinition | null;
  schemaPath: string | null;
  validationErrors: string[];
  loadSchema: (jsonFilePath: string) => Promise<void>;
  updateSchema: (definition: SchemaDefinition) => void;
  validateContent: (content: JsonValue) => string[];
  clearSchema: () => void;
}

export function useSchema(): UseSchemaReturn {
  const [schema, setSchema] = useState<SchemaDefinition | null>(null);
  const [schemaPath, setSchemaPath] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const loadSchema = useCallback(async (jsonFilePath: string): Promise<void> => {
    const schemaFileName = getSchemaFileName(jsonFilePath);
    const exists = await window.electron.ipcRenderer.invoke('file:exists', schemaFileName) as boolean;

    if (!exists) {
      setSchema(null);
      setSchemaPath(null);
      return;
    }

    const result = await window.electron.ipcRenderer.invoke('file:read', schemaFileName) as {
      success: boolean;
      content?: string;
    };

    if (result.success && result.content) {
      try {
        const definition = JSON.parse(result.content) as SchemaDefinition;
        setSchema(definition);
        setSchemaPath(schemaFileName);
      } catch {
        setSchema(null);
        setSchemaPath(null);
      }
    }
  }, []);

  const updateSchema = useCallback((definition: SchemaDefinition): void => {
    setSchema(definition);
  }, []);

  const validateContent = useCallback((content: JsonValue): string[] => {
    if (!schema) {
      setValidationErrors([]);
      return [];
    }

    const errors = validateValueAgainstSchema(content, schema, '');
    setValidationErrors(errors);
    return errors;
  }, [schema]);

  const clearSchema = useCallback((): void => {
    setSchema(null);
    setSchemaPath(null);
    setValidationErrors([]);
  }, []);

  return {
    schema,
    schemaPath,
    validationErrors,
    loadSchema,
    updateSchema,
    validateContent,
    clearSchema,
  };
}