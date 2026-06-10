import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>

      <div className={styles.brand}>
        <Image
          src="/cortenmadeeasy_Prancheta_1.avif"
          alt="Corten Made Easy"
          width={1200}
          height={300}
          className={styles.brandImage}
        />
      </div>

      <div className={styles.wrapper}>

        <p className={styles.helpText}>
          Precisa de ajuda? Ligue para{' '}
          <a href="tel:+5545991077599" className={styles.helpLink}>
            45 99107 7599
          </a>{' '}
          ou pelo{' '}
          <a
            href="https://wa.me/5545991077599"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.helpLink}
          >
            WhatsApp
          </a>
        </p>

        <div className={styles.links}>
          <a
            href="https://instagram.com/easycorten"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.instagramLink}
            aria-label="Instagram EasyCorten"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="6" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="4" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" />
              <circle cx="17.5" cy="6.5" r="1" fill="white" fillOpacity="0.5" />
            </svg>
          </a>

          <div className={styles.navColumn}>
            <span className={styles.columnTitle}>Navegue</span>
            <Link href="/construcao-civil" className={styles.navLink}>Construção Civil</Link>
            <Link href="/personalizados" className={styles.navLink}>Personalizados</Link>
            <Link href="/projetos" className={styles.navLink}>Projetos</Link>
            <Link href="/sobre" className={styles.navLink}>Sobre nós</Link>
          </div>

          <div className={styles.orcamentoColumn}>
            <span className={styles.columnTitle}>Orçamento</span>
            <p className={styles.orcamentoText}>
              Possui um projeto específico e precisa de um orçamento mais detalhado?{' '}
              <a
                href="https://wa.me/5545991077599"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.orcamentoLink}
              >
                Entre em contato
              </a>
            </p>
          </div>

          <div className={styles.spacer} />

          <div className={styles.logoColumn}>
            <Image
              src="/easycorten-Ago2023-LogotipoHorizontal_White.svg"
              alt="EasyCorten"
              width={200}
              height={50}
              className={styles.logoImage}
            />
            <p className={styles.logoMeta}>EasyCorten Materiais e Decorações LTDA</p>
            <p className={styles.logoMeta}>CNPJ: 41.072.400/0001-90</p>
          </div>
        </div>

        <div className={styles.bottom}>
          <Link href="/termos" className={styles.bottomLink}>
            Termos de compromisso
          </Link>
          <p className={styles.bottomText}>
            Desenvolvido por{' '}
            <a
              href="https://www.stubborn.com.br?utm_source=easycorten&utm_medium=footer&utm_campaign=desenvolvido_por&utm_content=link_rodape"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.bottomLink}
            >
              Stubborn
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
}
