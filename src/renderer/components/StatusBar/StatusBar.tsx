import React from 'react';
import { Circle, AlertCircle, CheckCircle, FileJson } from 'lucide-react';
import { WORDINGS } from '../../constants/wordings';
import type { ValidationError } from '../../../types/json';
import './StatusBar.css';

interface StatusBarProps {
  filePath: string | null;
  isModified: boolean;
  isValid: boolean;
  errors: ValidationError[];
  schemaErrors: string[];
  hasSchema: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  filePath,
  isModified,
  isValid,
  errors,
  schemaErrors,
  hasSchema,
}) => {
  const totalErrors = errors.length + schemaErrors.length;

  return (
    <div className="status-bar">
      <div className="status-left">
        <FileJson size={14} />
        <span className="status-file">{filePath || WORDINGS.editor.noFile}</span>
        {isModified && <span className="status-modified">{WORDINGS.editor.modified}</span>}
      </div>

      <div className="status-right">
        <span className="status-item">
          <Circle
            size={8}
            className={`status-dot ${isValid ? 'valid' : 'invalid'}`}
            fill="currentColor"
          />
          {totalErrors > 0 ? (
            <span className="status-error-count">
              <AlertCircle size={12} />
              {totalErrors} {totalErrors === 1 ? 'error' : 'errors'}
            </span>
          ) : (
            <span className="status-valid">
              <CheckCircle size={12} />
              {WORDINGS.status.ready}
            </span>
          )}
        </span>

        {hasSchema && <span className="status-item schema-indicator">Schema Active</span>}
      </div>
    </div>
  );
};
