import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { WORDINGS } from '../../constants/wordings';
import { JsonFieldType } from '../../../types/json';
import type { SchemaDefinition } from '../../../types/schema';
import './SchemaEditor.css';

interface SchemaEditorProps {
  schema: SchemaDefinition | null;
  onUpdate: (schema: SchemaDefinition) => void;
  onClose: () => void;
  isDark: boolean;
}

interface PropertyEditor {
  key: string;
  type: JsonFieldType;
  required: boolean;
  description: string;
}

export const SchemaEditor: React.FC<SchemaEditorProps> = ({ schema, onUpdate, onClose }) => {
  const [rootType, setRootType] = useState<JsonFieldType>(schema?.type || JsonFieldType.OBJECT);
  const [properties, setProperties] = useState<PropertyEditor[]>([]);
  const [requiredFields, setRequiredFields] = useState<Set<string>>(new Set());
  const [description, setDescription] = useState(schema?.description || '');

  useEffect(() => {
    if (schema?.properties) {
      const props = Object.entries(schema.properties).map(([key, def]) => ({
        key,
        type: def.type as JsonFieldType,
        required: schema.required?.includes(key) || false,
        description: def.description || '',
      }));
      setProperties(props);
      setRequiredFields(new Set(schema.required || []));
    }
  }, [schema]);

  const handleAddProperty = (): void => {
    setProperties([
      ...properties,
      {
        key: '',
        type: JsonFieldType.STRING,
        required: false,
        description: '',
      },
    ]);
  };

  const handleRemoveProperty = (index: number): void => {
    const newProperties = properties.filter((_, i) => i !== index);
    setProperties(newProperties);
  };

  const handlePropertyChange = (
    index: number,
    field: keyof PropertyEditor,
    value: string | boolean | JsonFieldType,
  ): void => {
    const newProperties = [...properties];
    newProperties[index] = { ...newProperties[index], [field]: value };

    if (field === 'required') {
      const newRequired = new Set(requiredFields);
      if (value) {
        newRequired.add(newProperties[index].key);
      } else {
        newRequired.delete(newProperties[index].key);
      }
      setRequiredFields(newRequired);
    }

    setProperties(newProperties);
  };

  const handleApply = (): void => {
    const schemaDef: SchemaDefinition = {
      type: rootType,
      description: description || undefined,
    };

    if (rootType === JsonFieldType.OBJECT && properties.length > 0) {
      schemaDef.properties = {};
      properties.forEach((prop) => {
        if (prop.key && schemaDef.properties) {
          schemaDef.properties[prop.key] = {
            type: prop.type,
            description: prop.description || undefined,
          };
        }
      });

      if (requiredFields.size > 0) {
        schemaDef.required = Array.from(requiredFields);
      }
    }

    onUpdate(schemaDef);
    onClose();
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog schema-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>{schema ? WORDINGS.schema.edit : WORDINGS.schema.define}</h2>
          <button className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="dialog-body">
          <div className="schema-section">
            <label className="schema-label">{WORDINGS.schema.type}</label>
            <select
              value={rootType}
              onChange={(e) => setRootType(e.target.value as JsonFieldType)}
              className="schema-select"
            >
              {Object.values(JsonFieldType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="schema-section">
            <label className="schema-label">{WORDINGS.schema.description}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="schema-textarea"
              rows={3}
              placeholder="Optional description"
            />
          </div>

          {rootType === JsonFieldType.OBJECT && (
            <div className="schema-section">
              <div className="schema-section-header">
                <label className="schema-label">Properties</label>
                <button className="add-button-small" onClick={handleAddProperty}>
                  <Plus size={14} />
                  {WORDINGS.schema.addProperty}
                </button>
              </div>

              <div className="schema-properties">
                {properties.map((prop, index) => (
                  <div key={index} className="schema-property">
                    <input
                      type="text"
                      value={prop.key}
                      onChange={(e) => handlePropertyChange(index, 'key', e.target.value)}
                      className="property-input"
                      placeholder={WORDINGS.schema.key}
                    />

                    <select
                      value={prop.type}
                      onChange={(e) =>
                        handlePropertyChange(index, 'type', e.target.value as JsonFieldType)
                      }
                      className="property-type"
                    >
                      {Object.values(JsonFieldType).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>

                    <label className="property-required">
                      <input
                        type="checkbox"
                        checked={prop.required}
                        onChange={(e) => handlePropertyChange(index, 'required', e.target.checked)}
                      />
                      {WORDINGS.schema.required}
                    </label>

                    <button
                      className="icon-button delete"
                      onClick={() => handleRemoveProperty(index)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <button className="cancel-button" onClick={onClose}>
            {WORDINGS.dialog.schema.cancel}
          </button>
          <button className="primary-button" onClick={handleApply}>
            {WORDINGS.dialog.schema.apply}
          </button>
        </div>
      </div>
    </div>
  );
};
