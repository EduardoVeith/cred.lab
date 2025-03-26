import React from 'react';
import styles from '../styles/afterEvent.module.scss';

const AfterEvent = () => {
  return (
    <div>
      {/* Barra Superior TANC Fixa */}
      <header className={styles.barraTanc}>
        <h1>TANC</h1>
      </header>

      {/* Container Principal (com padding-top para compensar a barra fixa) */}
      <div className={styles.container}>
        {/* Informações do Evento */}
        <section className={styles.eventInfo}>
          <h2>Meu Evento</h2>
          <p className={styles.eventName}>*nome do evento*</p>
          <div className={styles.eventDetails}>
            <p>Data: 00/00/0000 - 00:00</p>
            <p>Local: Rua das Flores, 123</p>
            <p>Descrição: Teste</p>
          </div>
        </section>

        {/* Botões */}
        <div className={styles.buttonGroup}>
          <button className={styles.button}>Adicionar novo usuário</button>
          <button className={styles.button}>Imprimir lista</button>
          <button className={styles.button}>Voltar</button>
        </div>

        {/* Tabela */}
        <section className={styles.credenciados}>
          <h3>Total de Credenciados: 150</h3>
          <div className={styles.tableHeader}>
            <span>Nome</span>
            <span>E-mail</span>
            <span>Data do Credenciamento</span>
          </div>
          
          {[...Array(7)].map((_, i) => (
            <div key={i} className={styles.tableRow}>
              <span>João Silva</span>
              <span>joao.silva@gmail.com</span>
              <span>24/10/2023 - 18:30</span>
            </div>
          ))}
        </section>

        {/* Rodapé */}
        <footer className={styles.footer}>
          <p>Página 1 de 2</p>
        </footer>
      </div>
    </div>
  );
};

export default AfterEvent;