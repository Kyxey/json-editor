import React from 'react';
import { JsonTree } from './JsonTree';
import { WORDINGS } from '../../constants/wordings';
import type { JsonValue, ValidationError } from '../../../types/json';
import './Sidebar.css';

interface SidebarProps {
  content: JsonValue | null;
  isValid: boolean;
  errors: ValidationError[];
  schemaErrors: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({ content, isValid, errors, schemaErrors }) => {
  const hasContent = content !== null && content !== undefined;
  const totalErrors = errors.length + schemaErrors.length;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3 className="sidebar-title">{WORDINGS.sidebar.title}</h3>
        {hasContent && (
          <span className={`sidebar-badge ${totalErrors > 0 ? 'error' : 'success'}`}>
            {totalErrors > 0
              ? `${totalErrors} ${totalErrors === 1 ? 'error' : 'errors'}`
              : WORDINGS.editor.validJson}
          </span>
        )}
      </div>

      <div className="sidebar-content">
        {hasContent ? (
          <JsonTree data={content} name={WORDINGS.sidebar.root} depth={0} path={[]} />
        ) : (
          <div className="sidebar-empty">
            <p>{WORDINGS.sidebar.noContent}</p>
          </div>
        )}
      </div>

      {!isValid && errors.length > 0 && (
        <div className="sidebar-errors">
          <h4 className="errors-title">Syntax Errors</h4>
          <ul className="errors-list">
            {errors.map((error, index) => (
              <li key={index} className="error-item">
                <span className="error-position">
                  Line {error.line}, Col {error.column}
                </span>
                <span className="error-message">{error.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {schemaErrors.length > 0 && (
        <div className="sidebar-errors">
          <h4 className="errors-title">Schema Validation Errors</h4>
          <ul className="errors-list">
            {schemaErrors.map((error, index) => (
              <li key={index} className="error-item schema-error">
                <span className="error-message">{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
