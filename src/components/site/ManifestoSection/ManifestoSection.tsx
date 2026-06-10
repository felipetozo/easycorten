import styles from "./ManifestoSection.module.css";

export default function ManifestoSection() {
  return (
    <section className={styles.section}>
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <h2 className={styles.title}>
            Aço Corten genuíno, para projetos que não abrem mão de identidade.
          </h2>
          <p className={styles.description}>
            A EasyCorten democratiza o acesso ao verdadeiro Aço Corten. Com
            revestimentos sob medida, produtos autorais e execução de projetos
            personalizados. Para arquitetos, designers e construtores que
            entendem que material é parte da linguagem.
          </p>
        </div>
      </div>
    </section>
  );
}
