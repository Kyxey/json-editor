import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useJsonFile } from '../hooks/useJsonFile';
import { useSchema } from '../hooks/useSchema';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { Toolbar } from './Toolbar/Toolbar';
import { Sidebar } from './Sidebar/Sidebar';
import { RawEditor } from './Editor/RawEditor';
import { GuiEditor } from './Editor/GuiEditor';
import { SchemaEditor } from './Schema/SchemaEditor';
import { StatusBar } from './StatusBar/StatusBar';
import { SaveDialog } from './Dialogs/SaveDialog';
import { WORDINGS } from '../constants/wordings';
import type { JsonValue } from '../types/json';
import type { SchemaDefinition } from '../types/schema';

export const App: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const {
    fileState,
    openFile,
    saveFile,
    saveFileAs,
    newFile,
    updateContent,
    updateParsedContent,
  } = useJsonFile();
  const {
    schema,
    validationErrors,
    loadSchema,
    updateSchema,
    validateContent,
  } = useSchema();

  const [activeView, setActiveView] = useState<'raw' | 'gui'>('gui');
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleOpenFile = useCallback(async (): Promise<void> => {
    if (fileState.isModified) {
      setPendingAction(() => async () => {
        const filePath = await window.electron.ipcRenderer.invoke('dialog:open') as string | null;
        if (filePath) {
          await openFile(filePath);
          await loadSchema(filePath);
        }
      });
      setShowSaveDialog(true);
      return;
    }

    const filePath = await window.electron.ipcRenderer.invoke('dialog:open') as string | null;
    if (filePath) {
      await openFile(filePath);
      await loadSchema(filePath);
    }
  }, [fileState.isModified, openFile, loadSchema]);

  const handleSave = useCallback(async (): Promise<void> => {
    if (fileState.path) {
      await saveFile();
    } else {
      await handleSaveAs();
    }
  }, [fileState.path, saveFile]);

  const handleSaveAs = useCallback(async (): Promise<void> => {
    const filePath = await window.electron.ipcRenderer.invoke('dialog:save') as string | null;
    if (filePath) {
      await saveFileAs(filePath);
    }
  }, [saveFileAs]);

  const handleNewFile = useCallback((): void => {
    if (fileState.isModified) {
      setPendingAction(() => async () => {
        newFile();
      });
      setShowSaveDialog(true);
      return;
    }
    newFile();
  }, [fileState.isModified, newFile]);

  const handleSaveDialogSave = useCallback(async (): Promise<void> => {
    await handleSave();
    setShowSaveDialog(false);
    if (pendingAction) {
      await pendingAction();
      setPendingAction(null);
    }
  }, [handleSave, pendingAction]);

  const handleSaveDialogDiscard = useCallback(async (): Promise<void> => {
    setShowSaveDialog(false);
    if (pendingAction) {
      await pendingAction();
      setPendingAction(null);
    }
  }, [pendingAction]);

  const handleSaveDialogCancel = useCallback((): void => {
    setShowSaveDialog(false);
    setPendingAction(null);
  }, []);

  const handleSchemaUpdate = useCallback((definition: SchemaDefinition): void => {
    updateSchema(definition);
    if (fileState.content) {
      validateContent(fileState.content);
    }
  }, [updateSchema, fileState.content, validateContent]);

  useEffect(() => {
    window.electron.ipcRenderer.on('menu:new', () => handleNewFile());
    window.electron.ipcRenderer.on('menu:open', () => { void handleOpenFile(); });
    window.electron.ipcRenderer.on('menu:save', () => { void handleSave(); });
    window.electron.ipcRenderer.on('menu:save-as', () => { void handleSaveAs(); });
    
    window.electron.ipcRenderer.on('app:before-close', () => {
      if (fileState.isModified) {
        setPendingAction(() => async () => {
          await window.electron.ipcRenderer.invoke('app:close');
        });
        setShowSaveDialog(true);
      } else {
        void window.electron.ipcRenderer.invoke('app:close');
      }
    });

    return () => {
      window.electron.ipcRenderer.removeListener('menu:new', handleNewFile);
      window.electron.ipcRenderer.removeListener('menu:open', () => { void handleOpenFile(); });
      window.electron.ipcRenderer.removeListener('menu:save', () => { void handleSave(); });
      window.electron.ipcRenderer.removeListener('menu:save-as', () => { void handleSaveAs(); });
    };
  }, [handleNewFile, handleOpenFile, handleSave, handleSaveAs, fileState.isModified]);

  useKeyboardShortcuts({
    onSave: () => { void handleSave(); },
    onSaveAs: () => { void handleSaveAs(); },
    onOpen: () => { void handleOpenFile(); },
    onNew: handleNewFile,
  });

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`}>
      <Toolbar
        onNew={handleNewFile}
        onOpen={() => { void handleOpenFile(); }}
        onSave={() => { void handleSave(); }}
        onSaveAs={() => { void handleSaveAs(); }}
        onToggleTheme={toggleTheme}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onToggleView={() => setActiveView(activeView === 'raw' ? 'gui' : 'raw')}
        onSchemaEdit={() => setShowSchemaEditor(true)}
        isModified={fileState.isModified}
        hasFile={!!fileState.path}
        activeView={activeView}
        showSidebar={showSidebar}
        isDark={isDark}
      />
      
      <div className="main-content">
        {showSidebar && (
          <Sidebar
            content={fileState.content}
            isValid={fileState.isValid}
            errors={fileState.errors}
            schemaErrors={validationErrors}
          />
        )}
        
        <div className="editor-area">
          {activeView === 'raw' ? (
            <RawEditor
              content={fileState.rawContent}
              isValid={fileState.isValid}
              errors={fileState.errors}
              onChange={updateContent}
              isDark={isDark}
            />
          ) : (
            <GuiEditor
              content={fileState.content}
              schema={schema}
              validationErrors={validationErrors}
              onUpdate={updateParsedContent}
              isDark={isDark}
            />
          )}
        </div>
      </div>

      <StatusBar
        filePath={fileState.path}
        isModified={fileState.isModified}
        isValid={fileState.isValid}
        errors={fileState.errors}
        schemaErrors={validationErrors}
        hasSchema={!!schema}
      />

      {showSchemaEditor && (
        <SchemaEditor
          schema={schema}
          onUpdate={handleSchemaUpdate}
          onClose={() => setShowSchemaEditor(false)}
          isDark={isDark}
        />
      )}

      {showSaveDialog && (
        <SaveDialog
          onSave={() => { void handleSaveDialogSave(); }}
          onDiscard={() => { void handleSaveDialogDiscard(); }}
          onCancel={handleSaveDialogCancel}
          isDark={isDark}
        />
      )}
    </div>
  );
};