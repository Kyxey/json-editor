export const COLOR_SCHEME = {
  string: '#B33A3A',
  number: '#265D8C',
  boolean: '#7B3F8C',
  null: '#808080',
  object: '#4A4A4A',
  array: '#4A4A4A',
  key: '#2E6B3D',
  bracket: '#808080',
  brace: '#808080',
  comma: '#808080',
  colon: '#808080',
  error: '#FF0000',
  valid: '#28A745',
  warning: '#FFC107',
  background: {
    light: '#FFFFFF',
    dark: '#1E1E1E',
  },
  text: {
    light: '#212529',
    dark: '#E1E4E8',
  },
  sidebar: {
    light: '#F8F9FA',
    dark: '#252526',
  },
  editor: {
    light: '#FFFFFF',
    dark: '#1E1E1E',
  },
} as const;

export type ColorScheme = typeof COLOR_SCHEME;
