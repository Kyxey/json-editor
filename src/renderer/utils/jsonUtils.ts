import type { JsonValue, JsonObject, JsonFieldType, ValidationError } from '../../types/json';
import { JsonFieldType as JFT } from '../../types/json';

export function getJsonFieldType(value: JsonValue): JsonFieldType {
  if (value === null) return JFT.NULL;
  if (Array.isArray(value)) return JFT.ARRAY;
  if (typeof value === 'object') return JFT.OBJECT;
  if (typeof value === 'string') return JFT.STRING;
  if (typeof value === 'number') return JFT.NUMBER;
  if (typeof value === 'boolean') return JFT.BOOLEAN;
  return JFT.STRING;
}

export function validateJsonString(content: string): ValidationError[] {
  try {
    JSON.parse(content);
    return [];
  } catch (error) {
    if (error instanceof SyntaxError) {
      const match = error.message.match(/at position (\d+)/);
      const position = match ? parseInt(match[1], 10) : 0;
      const lines = content.substring(0, position).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;

      return [
        {
          path: '',
          message: error.message,
          line,
          column,
        },
      ];
    }
    return [
      {
        path: '',
        message: 'Unknown JSON parsing error',
        line: 1,
        column: 1,
      },
    ];
  }
}

export function formatJsonString(content: string): string {
  try {
    const parsed = JSON.parse(content);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return content;
  }
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

export function getValueByPath(
  obj: JsonObject | JsonValue[],
  path: string[],
): JsonValue | undefined {
  let current: JsonValue = obj;

  for (const key of path) {
    if (current === null || current === undefined) return undefined;

    if (Array.isArray(current)) {
      const index = parseInt(key, 10);
      if (isNaN(index) || index < 0 || index >= current.length) return undefined;
      current = current[index];
    } else if (typeof current === 'object') {
      if (!(key in (current as JsonObject))) return undefined;
      current = (current as JsonObject)[key];
    } else {
      return undefined;
    }
  }

  return current;
}

export function setValueByPath(
  obj: JsonObject | JsonValue[],
  path: string[],
  value: JsonValue,
): void {
  let current: JsonValue = obj;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];

    if (Array.isArray(current)) {
      const index = parseInt(key, 10);
      if (isNaN(index)) return;
      current = current[index];
    } else if (typeof current === 'object' && current !== null) {
      current = (current as JsonObject)[key];
    } else {
      return;
    }
  }

  const lastKey = path[path.length - 1];

  if (Array.isArray(current)) {
    const index = parseInt(lastKey, 10);
    if (!isNaN(index)) {
      current[index] = value;
    }
  } else if (typeof current === 'object' && current !== null) {
    (current as JsonObject)[lastKey] = value;
  }
}
