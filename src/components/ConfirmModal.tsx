import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import '../styles/components/ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmação',
  message,
  confirmText = 'Excluir',
  cancelText = 'Cancelar',
  type = 'danger'
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const footer = (
    <div className="confirm-modal-footer">
      <button className="btn btn-secondary" onClick={onClose}>
        {cancelText}
      </button>
      <button 
        className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`} 
        onClick={handleConfirm}
      >
        {confirmText}
      </button>
    </div>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      size="sm" 
      footer={footer}
    >
      <div className="confirm-modal-content">
        <div className={`confirm-modal-icon-wrapper confirm-modal-icon-wrapper--${type}`}>
          <AlertTriangle size={24} />
        </div>
        <p className="confirm-modal-message">{message}</p>
      </div>
    </Modal>
  );
}
