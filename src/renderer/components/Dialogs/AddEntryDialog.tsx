import React, { useState } from 'react';
import { X } from 'lucide-react';
import { WORDINGS } from '../../constants/wordings';
import { JsonFieldType, type JsonValue } from '../../../types/json';
import type { SchemaDefinition } from '../../../types/schema';
import './Dialogs.css';

interface AddEntryDialogProps {
  schema: SchemaDefinition | null;
  onAdd: (key: string, value: JsonValue, type: JsonFieldType) => void;
  onClose: () => void;
  isDark: boolean;
}

export const AddEntryDialog: React.FC<AddEntryDialogProps> = ({ onAdd, onClose }) => {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState<JsonFieldType>(JsonFieldType.STRING);

  const handleAdd = (): void => {
    if (!key.trim()) return;

    let parsedValue: JsonValue = value;

    switch (type) {
      case JsonFieldType.NUMBER:
        parsedValue = parseFloat(value) || 0;
        break;
      case JsonFieldType.BOOLEAN:
        parsedValue = value.toLowerCase() === 'true';
        break;
      case JsonFieldType.NULL:
        parsedValue = null;
        break;
      case JsonFieldType.OBJECT:
        try {
          parsedValue = JSON.parse(value);
        } catch {
          parsedValue = {};
        }
        break;
      case JsonFieldType.ARRAY:
        try {
          parsedValue = JSON.parse(value);
        } catch {
          parsedValue = [];
        }
        break;
    }

    onAdd(key.trim(), parsedValue, type);
    onClose();
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>{WORDINGS.dialog.addEntry.title}</h2>
          <button className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="dialog-body">
          <div className="form-group">
            <label className="form-label">{WORDINGS.dialog.addEntry.key}</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="form-input"
              placeholder="Enter key name"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">{WORDINGS.dialog.addEntry.type}</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as JsonFieldType)}
              className="form-select"
            >
              {Object.values(JsonFieldType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {type !== JsonFieldType.NULL && (
            <div className="form-group">
              <label className="form-label">{WORDINGS.dialog.addEntry.value}</label>
              {type === JsonFieldType.BOOLEAN ? (
                <select
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="form-select"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : (
                <input
                  type={type === JsonFieldType.NUMBER ? 'number' : 'text'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="form-input"
                  placeholder={
                    type === JsonFieldType.OBJECT || type === JsonFieldType.ARRAY
                      ? '{}'
                      : 'Enter value'
                  }
                />
              )}
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <button className="cancel-button" onClick={onClose}>
            {WORDINGS.dialog.addEntry.cancel}
          </button>
          <button className="primary-button" onClick={handleAdd} disabled={!key.trim()}>
            {WORDINGS.dialog.addEntry.add}
          </button>
        </div>
      </div>
    </div>
  );
};
