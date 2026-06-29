export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

export interface JsonField {
  key: string;
  value: JsonValue;
  type: JsonFieldType;
  path: string[];
}

export enum JsonFieldType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  NULL = 'null',
  OBJECT = 'object',
  ARRAY = 'array',
}

export interface JsonFileState {
  path: string | null;
  content: JsonObject | JsonArray | null;
  rawContent: string;
  isModified: boolean;
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
  line: number;
  column: number;
}
