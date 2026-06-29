export const CONFIG = {
  maxFileSize: 10 * 1024 * 1024,
  supportedEncodings: ['utf-8', 'utf8', 'ascii'],
  maxUndoHistory: 50,
  schemaFileSuffix: '_SCHEMA',
  schemaFileExtension: '.json',
  debounceDelay: 300,
  animationDuration: 150,
  sidebarMinWidth: 250,
  sidebarMaxWidth: 500,
  editorFontSize: 14,
  maxVisibleEntries: 1000,
} as const;

export type Config = typeof CONFIG;