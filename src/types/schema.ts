import type { JsonFieldType } from './json';

export interface SchemaDefinition {
  type: JsonFieldType;
  properties?: Record<string, SchemaDefinition>;
  items?: SchemaDefinition;
  required?: string[];
  enum?: (string | number | boolean | null)[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  description?: string;
  default?: unknown;
}

export interface SchemaFile {
  path: string;
  definition: SchemaDefinition;
  isModified: boolean;
}
