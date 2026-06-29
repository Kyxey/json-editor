import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import { WORDINGS } from '../../constants/wordings';
import { COLOR_SCHEME } from '../../constants/colors';
import { getJsonFieldType } from '../../utils/jsonUtils';
import { JsonFieldType, type JsonValue, type JsonObject } from '../../../types/json';
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

interface FieldEditorProps {
  keyName: string;
  value: JsonValue;
  path: string;
  validationErrors: string[];
  onUpdateValue: (path: string, newValue: JsonValue) => void;
  onDelete: (path: string) => void;
  depth: number;
}

const FieldEditor: React.FC<FieldEditorProps> = ({
  keyName,
  value,
  path,
  validationErrors,
  onUpdateValue,
  onDelete,
  depth,
}) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const type = getJsonFieldType(value);

  const getTypeColor = (fieldType: string): string => {
    switch (fieldType) {
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

  const getDisplayValue = (val: JsonValue): string => {
    const valType = getJsonFieldType(val);
    if (valType === 'string') return `"${val as string}"`;
    if (valType === 'null') return 'null';
    if (valType === 'boolean') return String(val);
    if (valType === 'number') return String(val);
    return '';
  };

  const handleStartEdit = (): void => {
    if (type === 'object' || type === 'array') return;
    setEditValue(type === 'string' ? (value as string) : getDisplayValue(value));
    setIsEditing(true);
  };

  const handleSaveEdit = (): void => {
    let parsedValue: JsonValue = editValue;

    switch (type) {
      case 'number':
        parsedValue = parseFloat(editValue) || 0;
        break;
      case 'boolean':
        parsedValue = editValue === 'true';
        break;
      case 'null':
        parsedValue = null;
        break;
    }

    onUpdateValue(path, parsedValue);
    setIsEditing(false);
  };

  const handleDeleteChild = useCallback(
    (childPath: string): void => {
      const pathParts = childPath.split('.');
      const childKey = pathParts[pathParts.length - 1];

      if (type === 'object') {
        const newObj = { ...(value as JsonObject) };
        delete newObj[childKey];
        onUpdateValue(path, newObj);
      } else if (type === 'array') {
        const index = parseInt(childKey, 10);
        if (!isNaN(index)) {
          const newArr = [...(value as JsonValue[])];
          newArr.splice(index, 1);
          onUpdateValue(path, newArr);
        }
      }
    },
    [type, value, path, onUpdateValue],
  );

  const handleUpdateChild = useCallback(
    (childPath: string, newValue: JsonValue): void => {
      const pathParts = childPath.split('.');
      const childKey = pathParts[pathParts.length - 1];

      if (type === 'object') {
        const newObj = { ...(value as JsonObject), [childKey]: newValue };
        onUpdateValue(path, newObj);
      } else if (type === 'array') {
        const index = parseInt(childKey, 10);
        if (!isNaN(index)) {
          const newArr = [...(value as JsonValue[])];
          newArr[index] = newValue;
          onUpdateValue(path, newArr);
        }
      }
    },
    [type, value, path, onUpdateValue],
  );

  const isExpandable = type === 'object' || type === 'array';
  const childEntries: [string, JsonValue][] = [];

  if (type === 'object') {
    childEntries.push(...Object.entries(value as JsonObject));
  } else if (type === 'array') {
    childEntries.push(
      ...(value as JsonValue[]).map((item, index) => [String(index), item] as [string, JsonValue]),
    );
  }

  const relatedErrors = validationErrors.filter(
    (error) => error.startsWith(path) || error.includes(path),
  );

  const headerText =
    type === 'object'
      ? `Object {${Object.keys(value as JsonObject).length}}`
      : type === 'array'
        ? `Array [${(value as JsonValue[]).length}]`
        : '';

  return (
    <div className="gui-field" style={{ marginLeft: depth > 0 ? 20 : 0 }}>
      <div className="field-header">
        {isExpandable && (
          <button className="tree-toggle-btn" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
        <span className="field-key" style={{ color: COLOR_SCHEME.key }}>
          {keyName}
        </span>
        {isExpandable && <span className="field-summary">{headerText}</span>}
        {!isExpandable && (
          <>
            <span className="field-type-badge" style={{ color: getTypeColor(type) }}>
              {type}
            </span>
            {isEditing ? (
              <div className="field-edit-inline">
                <input
                  type={type === 'number' ? 'number' : 'text'}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="field-input-inline"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                />
                <button className="save-btn-small" onClick={handleSaveEdit}>
                  Save
                </button>
                <button className="cancel-btn-small" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <span
                className="field-value-display"
                style={{ color: getTypeColor(type) }}
                onDoubleClick={handleStartEdit}
              >
                {getDisplayValue(value)}
              </span>
            )}
          </>
        )}
        <div className="field-actions">
          {!isExpandable && (
            <button
              className="icon-button"
              onClick={handleStartEdit}
              title={WORDINGS.contextMenu.edit}
            >
              <Edit2 size={14} />
            </button>
          )}
          <button
            className="icon-button delete"
            onClick={() => onDelete(path)}
            title={WORDINGS.contextMenu.delete}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isExpandable && isExpanded && (
        <div className="field-children">
          {childEntries.length > 0 ? (
            childEntries.map(([childKey, childValue]) => (
              <FieldEditor
                key={childKey}
                keyName={childKey}
                value={childValue}
                path={path ? `${path}.${childKey}` : childKey}
                validationErrors={validationErrors}
                onUpdateValue={handleUpdateChild}
                onDelete={handleDeleteChild}
                depth={depth + 1}
              />
            ))
          ) : (
            <div className="field-empty">{type === 'object' ? 'Empty object' : 'Empty array'}</div>
          )}
          <button
            className="add-child-btn"
            onClick={() => {
              const dialog = document.createElement('div');
              dialog.className = 'temp-dialog';
              document.body.appendChild(dialog);
            }}
          >
            <Plus size={14} />
            {type === 'object' ? 'Add property' : 'Add item'}
          </button>
        </div>
      )}

      {relatedErrors.length > 0 && (
        <div className="field-errors">
          {relatedErrors.map((error, index) => (
            <div key={index} className="field-error-item">
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const GuiEditor: React.FC<GuiEditorProps> = ({
  content,
  schema,
  validationErrors,
  onUpdate,
  isDark,
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRootAddDialog, setShowRootAddDialog] = useState(false);

  const handleDeleteRoot = useCallback(
    (path: string): void => {
      if (!content) return;

      if (typeof content === 'object' && !Array.isArray(content)) {
        const newContent = { ...(content as JsonObject) };
        delete newContent[path];
        onUpdate(newContent);
      } else if (Array.isArray(content)) {
        const index = parseInt(path, 10);
        if (!isNaN(index)) {
          const newArr = [...content];
          newArr.splice(index, 1);
          onUpdate(newArr);
        }
      }
    },
    [content, onUpdate],
  );

  const handleUpdateRoot = useCallback(
    (path: string, newValue: JsonValue): void => {
      if (!content) return;

      if (typeof content === 'object' && !Array.isArray(content)) {
        const newContent = { ...(content as JsonObject), [path]: newValue };
        onUpdate(newContent);
      } else if (Array.isArray(content)) {
        const index = parseInt(path, 10);
        if (!isNaN(index)) {
          const newArr = [...content];
          newArr[index] = newValue;
          onUpdate(newArr);
        }
      }
    },
    [content, onUpdate],
  );

  const handleAddEntry = useCallback(
    (key: string, value: JsonValue, type: JsonFieldType): void => {
      if (!content) {
        if (type === JsonFieldType.ARRAY) {
          onUpdate([value]);
        } else {
          const newContent: JsonObject = { [key]: value };
          onUpdate(newContent);
        }
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

  const rootType = content === null ? null : getJsonFieldType(content);
  const isRootExpandable = rootType === 'object' || rootType === 'array';
  const rootEntries: [string, JsonValue][] = [];

  if (rootType === 'object') {
    rootEntries.push(...Object.entries(content as JsonObject));
  } else if (rootType === 'array') {
    rootEntries.push(
      ...(content as JsonValue[]).map(
        (item, index) => [String(index), item] as [string, JsonValue],
      ),
    );
  }

  return (
    <div className="editor-container">
      <div className="editor-header">
        <span className="editor-title">{WORDINGS.editor.gui}</span>
        <button className="add-button" onClick={() => setShowRootAddDialog(true)}>
          <Plus size={16} />
          {rootType === 'array' ? 'Add Item' : WORDINGS.toolbar.addEntry}
        </button>
      </div>

      <div className="gui-editor-body">
        {content === null ? (
          <div className="gui-empty">
            <p>{WORDINGS.editor.noFile}</p>
            <button className="primary-button" onClick={() => setShowRootAddDialog(true)}>
              {WORDINGS.toolbar.addEntry}
            </button>
          </div>
        ) : rootType === null ? (
          <div className="gui-empty">
            <p>Invalid content</p>
          </div>
        ) : (
          <div className="gui-fields">
            {rootEntries.length === 0 && isRootExpandable ? (
              <div className="gui-empty">
                <p>{rootType === 'object' ? 'Empty object' : 'Empty array'}</p>
                <button className="primary-button" onClick={() => setShowRootAddDialog(true)}>
                  {rootType === 'object' ? 'Add property' : 'Add item'}
                </button>
              </div>
            ) : (
              rootEntries.map(([key, value]) => (
                <FieldEditor
                  key={key}
                  keyName={key}
                  value={value}
                  path={key}
                  validationErrors={validationErrors}
                  onUpdateValue={handleUpdateRoot}
                  onDelete={handleDeleteRoot}
                  depth={0}
                />
              ))
            )}
          </div>
        )}
      </div>

      {showRootAddDialog && (
        <AddEntryDialog
          schema={schema}
          onAdd={handleAddEntry}
          onClose={() => setShowRootAddDialog(false)}
          isDark={isDark}
        />
      )}

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
