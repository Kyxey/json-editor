import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { WORDINGS } from '../../constants/wordings';
import './Dialogs.css';

interface SaveDialogProps {
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
  isDark: boolean;
}

export const SaveDialog: React.FC<SaveDialogProps> = ({
  onSave,
  onDiscard,
  onCancel,
}) => {
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <div className="dialog-icon warning">
            <AlertTriangle size={24} />
          </div>
          <h2>{WORDINGS.dialog.save.title}</h2>
          <button className="icon-button" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <div className="dialog-body">
          <p className="dialog-message">{WORDINGS.dialog.save.message}</p>
        </div>

        <div className="dialog-footer">
          <button className="cancel-button" onClick={onCancel}>
            {WORDINGS.dialog.save.cancel}
          </button>
          <button className="secondary-button" onClick={onDiscard}>
            {WORDINGS.dialog.save.discard}
          </button>
          <button className="primary-button" onClick={onSave}>
            {WORDINGS.dialog.save.save}
          </button>
        </div>
      </div>
    </div>
  );
};