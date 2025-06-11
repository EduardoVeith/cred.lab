import { FiMapPin, FiClock } from 'react-icons/fi';
import styles from './CardEvento.module.scss';

interface CardEventoProps {
  nome: string;
  endereco: string;
  dataHora: string;
  isPast: boolean;
}

export default function CardEvento({ nome, endereco, dataHora }: CardEventoProps) {
  const data = new Date(dataHora);
  const dataFormatada = data.toLocaleDateString('pt-BR');
  const horaFormatada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={styles.card}>
      <p className={styles.nome}>{nome}</p>

      <p className={styles.info}>
        <FiMapPin className={styles.icon} />
        <span>{endereco}</span>
      </p>

      <p className={styles.info}>
        <FiClock className={styles.icon} />
        <span>{`${dataFormatada} às ${horaFormatada}`}</span>
      </p>
    </div>
  );
}
