import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { getJsonFieldType } from '../../utils/jsonUtils';
import { COLOR_SCHEME } from '../../constants/colors';
import type { JsonValue } from '../../../types/json';
import './JsonTree.css';

interface JsonTreeProps {
  data: JsonValue;
  name: string;
  depth: number;
  path: string[];
}

export const JsonTree: React.FC<JsonTreeProps> = ({ data, name, depth, path }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const type = getJsonFieldType(data);

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

  const getDisplayValue = (value: JsonValue, fieldType: string): string => {
    if (fieldType === 'string') return `"${value}"`;
    if (fieldType === 'null') return 'null';
    return String(value);
  };

  const isExpandable = type === 'object' || type === 'array';

  const toggleExpand = (): void => {
    setIsExpanded(!isExpanded);
  };

  const entries = isExpandable
    ? type === 'object'
      ? Object.entries(data as Record<string, JsonValue>)
      : (data as JsonValue[]).map((value, index) => [String(index), value] as [string, JsonValue])
    : [];

  return (
    <div className="json-tree" style={{ paddingLeft: depth * 20 }}>
      <div className="json-tree-item" onClick={toggleExpand}>
        {isExpandable && (
          <span className="tree-toggle">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
        <span className="tree-key" style={{ color: COLOR_SCHEME.key }}>
          {name}
        </span>
        {!isExpandable && (
          <span className="tree-value" style={{ color: getTypeColor(type) }}>
            {getDisplayValue(data, type)}
          </span>
        )}
        <span className="tree-type">{type}</span>
      </div>

      {isExpandable && isExpanded && (
        <div className="tree-children">
          {entries.length > 0 ? (
            entries.map(([key, value]) => (
              <JsonTree key={key} data={value} name={key} depth={depth + 1} path={[...path, key]} />
            ))
          ) : (
            <div className="tree-empty" style={{ paddingLeft: (depth + 1) * 20 }}>
              {type === 'object' ? 'Empty object' : 'Empty array'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
