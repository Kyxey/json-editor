import React from 'react';
import {
  FileText,
  FolderOpen,
  Save,
  SaveAll,
  Sun,
  Moon,
  Sidebar,
  Code,
  FormInput,
  Database,
} from 'lucide-react';
import { WORDINGS } from '../../constants/wordings';
import './Toolbar.css';

interface ToolbarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onToggleView: () => void;
  onSchemaEdit: () => void;
  isModified: boolean;
  hasFile: boolean;
  activeView: 'raw' | 'gui';
  showSidebar: boolean;
  isDark: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onToggleTheme,
  onToggleSidebar,
  onToggleView,
  onSchemaEdit,
  isModified,
  activeView,
  showSidebar,
  isDark,
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={onNew}
          title={`${WORDINGS.toolbar.newFile} (${window.electron.isMac ? 'Cmd+N' : 'Ctrl+N'})`}
        >
          <FileText size={18} />
          <span className="toolbar-label">{WORDINGS.toolbar.newFile}</span>
        </button>

        <button
          className="toolbar-button"
          onClick={onOpen}
          title={`${WORDINGS.toolbar.openFile} (${window.electron.isMac ? 'Cmd+O' : 'Ctrl+O'})`}
        >
          <FolderOpen size={18} />
          <span className="toolbar-label">{WORDINGS.toolbar.openFile}</span>
        </button>

        <button
          className="toolbar-button"
          onClick={onSave}
          disabled={!isModified}
          title={`${WORDINGS.toolbar.saveFile} (${window.electron.isMac ? 'Cmd+S' : 'Ctrl+S'})`}
        >
          <Save size={18} />
          <span className="toolbar-label">{WORDINGS.toolbar.saveFile}</span>
        </button>

        <button
          className="toolbar-button"
          onClick={onSaveAs}
          title={`${WORDINGS.toolbar.saveAsFile} (${window.electron.isMac ? 'Cmd+Shift+S' : 'Ctrl+Shift+S'})`}
        >
          <SaveAll size={18} />
          <span className="toolbar-label">{WORDINGS.toolbar.saveAsFile}</span>
        </button>
      </div>

      <div className="toolbar-group">
        <button className="toolbar-button" onClick={onSchemaEdit} title={WORDINGS.toolbar.schema}>
          <Database size={18} />
          <span className="toolbar-label">{WORDINGS.toolbar.schema}</span>
        </button>

        <button
          className={`toolbar-button ${activeView === 'raw' ? 'active' : ''}`}
          onClick={onToggleView}
          title={activeView === 'raw' ? WORDINGS.editor.gui : WORDINGS.editor.raw}
        >
          {activeView === 'raw' ? <FormInput size={18} /> : <Code size={18} />}
          <span className="toolbar-label">
            {activeView === 'raw' ? WORDINGS.editor.gui : WORDINGS.editor.raw}
          </span>
        </button>
      </div>

      <div className="toolbar-group toolbar-right">
        <button
          className={`toolbar-button ${showSidebar ? 'active' : ''}`}
          onClick={onToggleSidebar}
          title={WORDINGS.menu.toggleSidebar}
        >
          <Sidebar size={18} />
        </button>

        <button
          className="toolbar-button"
          onClick={onToggleTheme}
          title={WORDINGS.menu.toggleTheme}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
};
