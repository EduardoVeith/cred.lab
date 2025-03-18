
import React, { useState } from 'react';
import styles from './UserModal.module.scss';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: { name: string; email: string }) => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSave = () => {
    onSave({ name, email });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Novo usuário</h2>
        <div className={styles.inputGroup}>
          <label htmlFor="name">Nome do usuário</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={styles.buttons}>
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleSave}>Cadastrar</button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;