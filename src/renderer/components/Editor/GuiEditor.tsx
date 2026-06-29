import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { WORDINGS } from '../../constants/wordings';
import { COLOR_SCHEME } from '../../constants/colors';
import { getJsonFieldType } from '../../utils/jsonUtils';
import { type JsonValue, type JsonObject } from '../../../types/json';
import type { SchemaDefinition } from '../../../types/schema';
import { AddEntryDialog } from '../Dialogs/AddEntryDialog';
import './Editor.css';

interface GuiEditorProps {
  content: JsonValue | null;
  schema: SchemaDefinition | null;
  validationErrors: string[];
  onUpdate: (content: JsonValue) => void;
  isDark: boolean;
}

export const GuiEditor: React.FC<GuiEditorProps> = ({
  content,
  schema,
  validationErrors,
  onUpdate,
  isDark,
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleDeleteEntry = useCallback(
    (key: string): void => {
      if (!content || typeof content !== 'object' || Array.isArray(content)) return;

      const newContent = { ...(content as JsonObject) };
      delete newContent[key];
      onUpdate(newContent);
    },
    [content, onUpdate],
  );

  const handleEditValue = useCallback(
    (key: string, value: JsonValue): void => {
      if (!content || typeof content !== 'object' || Array.isArray(content)) return;

      const newContent = { ...(content as JsonObject) };
      let parsedValue: JsonValue = editValue;

      const type = getJsonFieldType(value);
      switch (type) {
        case 'number':
          parsedValue = parseFloat(editValue);
          break;
        case 'boolean':
          parsedValue = editValue === 'true';
          break;
        case 'null':
          parsedValue = null;
          break;
      }

      newContent[key] = parsedValue;
      onUpdate(newContent);
      setEditingKey(null);
    },
    [content, editValue, onUpdate],
  );

  const handleAddEntry = useCallback(
    (key: string, value: JsonValue): void => {
      if (!content) {
        const newContent: JsonObject = { [key]: value };
        onUpdate(newContent);
        return;
      }

      if (typeof content === 'object' && !Array.isArray(content)) {
        const newContent = { ...(content as JsonObject), [key]: value };
        onUpdate(newContent);
      } else if (Array.isArray(content)) {
        const newContent = [...content, value];
        onUpdate(newContent);
      }
    },
    [content, onUpdate],
  );

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'string':
        return COLOR_SCHEME.string;
      case 'number':
        return COLOR_SCHEME.number;
      case 'boolean':
        return COLOR_SCHEME.boolean;
      case 'null':
        return COLOR_SCHEME.null;
      default:
        return COLOR_SCHEME.text.light;
    }
  };

  const getDisplayValue = (value: JsonValue): string => {
    const type = getJsonFieldType(value);
    if (type === 'string') return value as string;
    if (type === 'null') return 'null';
    return String(value);
  };

  const entries =
    content && typeof content === 'object' && !Array.isArray(content)
      ? Object.entries(content as JsonObject)
      : [];

  return (
    <div className="editor-container">
      <div className="editor-header">
        <span className="editor-title">{WORDINGS.editor.gui}</span>
        <button className="add-button" onClick={() => setShowAddDialog(true)}>
          <Plus size={16} />
          {WORDINGS.toolbar.addEntry}
        </button>
      </div>

      <div className="gui-editor-body">
        {content === null ? (
          <div className="gui-empty">
            <p>{WORDINGS.editor.noFile}</p>
            <button className="primary-button" onClick={() => setShowAddDialog(true)}>
              {WORDINGS.toolbar.addEntry}
            </button>
          </div>
        ) : Array.isArray(content) ? (
          <div className="gui-array-view">
            <h3>
              {WORDINGS.sidebar.array} ({content.length} items)
            </h3>
            {content.map((item, index) => (
              <div key={index} className="gui-array-item">
                <span className="array-index">{index}</span>
                <span
                  className="array-value"
                  style={{ color: getTypeColor(getJsonFieldType(item)) }}
                >
                  {getDisplayValue(item)}
                </span>
                <span className="array-type">{getJsonFieldType(item)}</span>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="gui-empty">
            <p>Empty object</p>
          </div>
        ) : (
          <div className="gui-fields">
            {entries.map(([key, value]) => (
              <div key={key} className="gui-field">
                <div className="field-header">
                  <span className="field-key" style={{ color: COLOR_SCHEME.key }}>
                    {key}
                  </span>
                  <span
                    className="field-type"
                    style={{ color: getTypeColor(getJsonFieldType(value)) }}
                  >
                    {getJsonFieldType(value)}
                  </span>
                  <div className="field-actions">
                    <button
                      className="icon-button"
                      onClick={() => {
                        setEditingKey(key);
                        setEditValue(getDisplayValue(value));
                      }}
                      title={WORDINGS.contextMenu.edit}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="icon-button delete"
                      onClick={() => handleDeleteEntry(key)}
                      title={WORDINGS.contextMenu.delete}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {editingKey === key ? (
                  <div className="field-edit">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="field-input"
                      autoFocus
                    />
                    <button className="save-button" onClick={() => handleEditValue(key, value)}>
                      Save
                    </button>
                    <button className="cancel-button" onClick={() => setEditingKey(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div
                    className="field-value"
                    style={{ color: getTypeColor(getJsonFieldType(value)) }}
                  >
                    {getJsonFieldType(value) === 'object' || getJsonFieldType(value) === 'array'
                      ? `${getJsonFieldType(value)} (${JSON.stringify(value).length} chars)`
                      : getDisplayValue(value)}
                  </div>
                )}

                {validationErrors
                  .filter((error) => error.startsWith(`.${key}`) || error.startsWith(key))
                  .map((error, index) => (
                    <div key={index} className="field-error">
                      {error}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddDialog && (
        <AddEntryDialog
          schema={schema}
          onAdd={handleAddEntry}
          onClose={() => setShowAddDialog(false)}
          isDark={isDark}
        />
      )}
    </div>
  );
};
