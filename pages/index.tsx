import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/index.module.scss'

export default function Home() {
  return (
    <div className={styles.dashboardContainer}>
      <Head>
        <title>TANC - Página Inicial</title>
        <meta name="description" content="Sistema de gestão de eventos TANC" />
      </Head>

      <header className={styles.barraTanc}>
        <div className={styles.headerContent}>
          <span>TANC</span>
          <div className={styles.authButtons}>
            <Link href="/login" className={styles.loginButton}>Acessar Conta</Link>
            <Link href="/register" className={styles.registerButton}>Criar Conta</Link>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <section className={styles.welcomeSection}>
          <div className={styles.welcomeContent}>
            <h1>Bem-vindo ao Sistema TANC</h1>
            <p>Gestão completa de eventos.</p>
          </div>
        </section>

        {}
        <section className={styles.featuredEvents}>
          <h2>Eventos em Destaque</h2>
          <div className={styles.eventsGrid}>
            <div className={styles.eventCard}>
              <h3>Tech Conference 2025</h3>
              <p>Centro de Convenções</p>
              <p>15/06/2025 às 07:00</p>
            </div>
            <div className={styles.eventCard}>
              <h3>Feira de Tecnologia 2025</h3>
              <p>Centro de Convenções</p>
              <p>30/04/2025 às 21:00</p>
            </div>
          </div>
        </section>

        <section className={styles.statsSection}>
          <div className={styles.statCard}>
            <h3>TOTAL DE EVENTOS</h3>
            <p>9</p>
          </div>
          <div className={styles.statCard}>
            <h3>PRÓXIMOS 7 DIAS</h3>
            <p>1</p>
          </div>
          <div className={styles.statCard}>
            <h3>PARTICIPANTES</h3>
            <p>1,245</p>
          </div>
        </section>
      </main>
    </div>
  )
}