import styles from './SuccessToast.module.scss';

interface Props {
  message: string;
  onClose: () => void;
}

export default function SuccessToast({ message, onClose }: Props) {
  return (
    <div className={styles.toast}>
      <p>{message}</p>
      <button onClick={onClose}>×</button>
    </div>
  );
}
