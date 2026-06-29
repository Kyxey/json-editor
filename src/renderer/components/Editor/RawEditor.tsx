import React, { useRef, useEffect, useCallback } from 'react';
import type { ValidationError } from '../../../types/json';
import { COLOR_SCHEME } from '../../constants/colors';
import { WORDINGS } from '../../constants/wordings';
import './Editor.css';

interface RawEditorProps {
  content: string;
  isValid: boolean;
  errors: ValidationError[];
  onChange: (content: string) => void;
  isDark: boolean;
}

export const RawEditor: React.FC<RawEditorProps> = ({ content, isValid, errors, onChange }) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const highlightSyntax = useCallback((code: string): string => {
    return code
      .replace(/("(?:[^"\\]|\\.)*")/g, `<span style="color: ${COLOR_SCHEME.string}">$1</span>`)
      .replace(/\b(-?\d+\.?\d*)\b/g, `<span style="color: ${COLOR_SCHEME.number}">$1</span>`)
      .replace(/\b(true|false)\b/g, `<span style="color: ${COLOR_SCHEME.boolean}">$1</span>`)
      .replace(/\bnull\b/g, `<span style="color: ${COLOR_SCHEME.null}">null</span>`)
      .replace(/([{}[\]])/g, `<span style="color: ${COLOR_SCHEME.brace}">$1</span>`)
      .replace(/([:,])/g, `<span style="color: ${COLOR_SCHEME.colon}">$1</span>`);
  }, []);

  const handleScroll = (): void => {
    if (highlightRef.current && editorRef.current) {
      highlightRef.current.scrollTop = editorRef.current.scrollTop;
      highlightRef.current.scrollLeft = editorRef.current.scrollLeft;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = content.substring(0, start) + '  ' + content.substring(end);
      onChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  return (
    <div className="editor-container">
      <div className="editor-header">
        <span className="editor-title">{WORDINGS.editor.raw}</span>
        <span className={`editor-status ${isValid ? 'valid' : 'invalid'}`}>
          {isValid ? WORDINGS.editor.validJson : WORDINGS.editor.invalidJson}
        </span>
      </div>

      <div className="editor-body">
        <div
          ref={highlightRef}
          className="editor-highlight"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: highlightSyntax(content) + '<br>' }}
        />
        <textarea
          ref={editorRef}
          className="editor-textarea"
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          placeholder={WORDINGS.editor.placeholder}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>

      {errors.length > 0 && (
        <div className="editor-errors">
          {errors.map((error, index) => (
            <div key={index} className="editor-error-item">
              Line {error.line}, Column {error.column}: {error.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
