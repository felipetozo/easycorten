import styles from './page.module.css';

export default function AdminPage() {
  return (
    <main className={styles.main}>
      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Posts publicados</span>
          <span className={styles.cardValue}>—</span>
          <span className={styles.cardSub}>Blog</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Produtos ativos</span>
          <span className={styles.cardValue}>—</span>
          <span className={styles.cardSub}>Catálogo</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Novos contatos</span>
          <span className={styles.cardValue}>—</span>
          <span className={styles.cardSub}>Este mês</span>
        </div>
      </div>
    </main>
  );
}
