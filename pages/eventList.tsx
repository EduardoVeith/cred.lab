import React from "react";
import { FaUserCircle } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import styles from '../styles/eventList.module.scss';

const events = Array(12).fill({
  name: "Nome do Evento",
  location: "Rua das Flores, 123",
});

const Dashboard = () => {
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.barraTanc}>TANC</div>
      
      <header className={styles.header}>
        <FaUserCircle className={styles.profileIcon} />
      </header>
      
      <main className={styles.mainContent}>
        <div className={styles.topBar}>
          <FiFilter className={styles.filterIcon} />
          <button className={styles.promoteButton}>Promover Evento</button>
        </div>
        
        <div className={styles.eventsGrid}>
          {events.map((event, index) => (
            <div key={index} className={styles.eventCard}>
              <strong>{event.name}</strong>
              <p>{event.location}</p>
            </div>
          ))}
        </div>
        
        <div className={styles.pagination}>
          <button>{"«"}</button>
          <button>{"<"}</button>
          <span>Página 1 de 2</span>
          <button>{">"}</button>
          <button>{"»"}</button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;