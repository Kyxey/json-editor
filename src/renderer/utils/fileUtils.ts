import { CONFIG } from '../constants/config';

export function getSchemaFileName(jsonFileName: string): string {
  const lastDot = jsonFileName.lastIndexOf('.');
  if (lastDot === -1) {
    return jsonFileName + CONFIG.schemaFileSuffix + CONFIG.schemaFileExtension;
  }
  return (
    jsonFileName.substring(0, lastDot) +
    CONFIG.schemaFileSuffix +
    jsonFileName.substring(lastDot)
  );
}

export function getFileNameFromPath(filePath: string): string {
  const parts = filePath.split(/[/\\]/);
  return parts[parts.length - 1] || filePath;
}

export function getDirectoryFromPath(filePath: string): string {
  const parts = filePath.split(/[/\\]/);
  parts.pop();
  return parts.join('/');
}