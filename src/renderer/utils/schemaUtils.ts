import type { SchemaDefinition } from '../types/schema';
import type { JsonValue, JsonFieldType } from '../types/json';

export function createDefaultSchema(type: JsonFieldType): SchemaDefinition {
  const baseSchema: SchemaDefinition = { type };

  switch (type) {
    case 'object':
      baseSchema.properties = {};
      break;
    case 'array':
      baseSchema.items = { type: 'string' };
      break;
  }

  return baseSchema;
}

export function validateValueAgainstSchema(
  value: JsonValue,
  schema: SchemaDefinition,
  path: string,
): string[] {
  const errors: string[] = [];

  if (schema.type === 'null' && value !== null) {
    errors.push(`${path}: Expected null`);
    return errors;
  }

  if (schema.enum && !schema.enum.includes(value as string | number | boolean | null)) {
    errors.push(`${path}: Value not in allowed list`);
  }

  switch (schema.type) {
    case 'string':
      if (typeof value !== 'string') {
        errors.push(`${path}: Expected string`);
      } else {
        if (schema.minLength !== undefined && value.length < schema.minLength) {
          errors.push(`${path}: String too short (min: ${schema.minLength})`);
        }
        if (schema.maxLength !== undefined && value.length > schema.maxLength) {
          errors.push(`${path}: String too long (max: ${schema.maxLength})`);
        }
        if (schema.pattern) {
          try {
            const regex = new RegExp(schema.pattern);
            if (!regex.test(value)) {
              errors.push(`${path}: Pattern mismatch`);
            }
          } catch {
            errors.push(`${path}: Invalid pattern in schema`);
          }
        }
      }
      break;

    case 'number':
      if (typeof value !== 'number') {
        errors.push(`${path}: Expected number`);
      } else {
        if (schema.minimum !== undefined && value < schema.minimum) {
          errors.push(`${path}: Value below minimum (${schema.minimum})`);
        }
        if (schema.maximum !== undefined && value > schema.maximum) {
          errors.push(`${path}: Value exceeds maximum (${schema.maximum})`);
        }
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push(`${path}: Expected boolean`);
      }
      break;

    case 'null':
      if (value !== null) {
        errors.push(`${path}: Expected null`);
      }
      break;

    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        errors.push(`${path}: Expected object`);
      } else if (schema.properties) {
        if (schema.required) {
          for (const requiredProp of schema.required) {
            if (!(requiredProp in value)) {
              errors.push(`${path}.${requiredProp}: Required property missing`);
            }
          }
        }
        
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          if (key in value) {
            const nestedErrors = validateValueAgainstSchema(
              (value as Record<string, JsonValue>)[key],
              propSchema,
              `${path}.${key}`,
            );
            errors.push(...nestedErrors);
          }
        }
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        errors.push(`${path}: Expected array`);
      } else if (schema.items) {
        value.forEach((item, index) => {
          const nestedErrors = validateValueAgainstSchema(
            item,
            schema.items!,
            `${path}[${index}]`,
          );
          errors.push(...nestedErrors);
        });
      }
      break;
  }

  return errors;
}

export function mergeSchemas(
  base: SchemaDefinition,
  override: Partial<SchemaDefinition>,
): SchemaDefinition {
  return { ...base, ...override };
}