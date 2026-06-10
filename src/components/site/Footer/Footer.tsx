import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.wrapper}>
        <div className={styles.top}>
          <Link href="/" className={styles.logoLink}>
            <Image
              src="/easycorten-Ago2023-LogotipoHorizontal_Color.svg"
              alt="EasyCorten"
              width={160}
              height={40}
              style={{ width: '10rem', height: 'auto' }}
            />
          </Link>
          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>Início</Link>
            <Link href="/blog" className={styles.navLink}>Blog</Link>
            <Link href="/sobre" className={styles.navLink}>Sobre</Link>
            <Link href="/construcao-civil" className={styles.navLink}>Construção Civil</Link>
            <Link href="/personalizados" className={styles.navLink}>Personalizados</Link>
          </nav>
        </div>
        <div className={styles.bottom}>
          <p className={styles.copy}>© 2025 EasyCorten. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
