import type { ValidationError } from '../../types/json';

export function createValidationError(
  path: string,
  message: string,
  line = 1,
  column = 1,
): ValidationError {
  return { path, message, line, column };
}

export function formatValidationErrors(errors: ValidationError[]): string {
  return errors
    .map((error) => {
      let result = '';
      if (error.path) {
        result += `[${error.path}] `;
      }
      result += error.message;
      if (error.line > 1 || error.column > 1) {
        result += ` (line ${error.line}, column ${error.column})`;
      }
      return result;
    })
    .join('\n');
}
