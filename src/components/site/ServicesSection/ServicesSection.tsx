import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import { MdMapsHomeWork } from "react-icons/md";
import { RiPencilRuler2Fill } from "react-icons/ri";
import styles from "./ServicesSection.module.css";

type Service = {
  image: string;
  alt: string;
  Icon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  reversed: boolean;
};

const services: Service[] = [
  {
    image: "/EM_200611_MEZA_1393_Edit.avif",
    alt: "Fachada em Aço Corten em construção civil",
    Icon: MdMapsHomeWork,
    eyebrow: "CONSTRUÇÃO CIVIL",
    title:
      "Expertise e autenticidade: seu projeto elevado ao próximo nível com Aço Corten Genuíno.",
    description:
      "Em cada projeto, vemos mais do que simplesmente aço. Vemos uma expressão de visão e design. E, assim como você, estamos apaixonados pelo que fazemos. Se busca uma execução impecável e um parceiro que compreende profundamente o valor estético e funcional do Aço Corten, não espere mais. Vamos juntos transformar sua ideia em realidade.",
    href: "/construcao-civil",
    reversed: false,
  },
  {
    image: "/IMG_3049_-_copia_f1aae601-f494-464b-af2d-291cfe4929fe.avif",
    alt: "Produto personalizado em Aço Corten",
    Icon: RiPencilRuler2Fill,
    eyebrow: "PERSONALIZADOS",
    title: "Sua criatividade, nossa precisão: peças únicas em Aço Corten.",
    description:
      "Transformamos ideias em realidade com personalização em Aço Corten. Seja para números residenciais, logotipos, portas, mesas ou projetos exclusivos. Analisamos sua necessidade, refinamos o design e fabricamos com precisão. Combinamos técnica e qualidade para criar peças que unem funcionalidade e estética, garantindo longa durabilidade e um acabamento impecável.",
    href: "/personalizados",
    reversed: true,
  },
];

export default function ServicesSection() {
  return (
    <section className={styles.section}>
      <div className={styles.wrapper}>
        {services.map((service) => (
          <div
            key={service.eyebrow}
            className={`${styles.item} ${service.reversed ? styles.reversed : ""}`}
          >
            <div className={styles.imageContainer}>
              <Image
                src={service.image}
                alt={service.alt}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className={styles.textCol}>
              <div className={styles.textGroup}>
                <div className={styles.eyebrow}>
                  <service.Icon className={styles.eyebrowIcon} />
                  <span>{service.eyebrow}</span>
                </div>
                <h3 className={styles.title}>{service.title}</h3>
                <p className={styles.description}>{service.description}</p>
              </div>
              <Link href={service.href} className={styles.button}>
                Saiba mais
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
