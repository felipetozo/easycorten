import Link from 'next/link';
import Footer from '@/components/site/Footer/Footer';
import styles from './Institucional.module.css';

export default function Institucional() {
  return (
    <>
      <section className={styles.instSection}>
        <picture>
          <source srcSet="/institucional.avif" type="image/avif" />
          <img
            src="/institucional.png"
            alt="EasyCorten institucional"
            className={styles.instImage}
          />
        </picture>
        <div className={styles.instOverlay} />
        <div className={styles.instContent}>
          <div className={styles.instWrapper}>
            <h3 className={styles.instTitle}>
              Acreditamos que arquitetos, designers e entusiastas merecem o melhor: um material robusto, com estética singular e durabilidade incontestável.
            </h3>
            <p className={styles.instText}>
              A missão da EasyCorten é clara e firme: democratizar o acesso ao verdadeiro Aço Corten, rompendo com padrões e elevando cada projeto a um novo patamar.
            </p>
            <Link href="/sobre" className={styles.instButton}>
              Conheça a EasyCorten
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
