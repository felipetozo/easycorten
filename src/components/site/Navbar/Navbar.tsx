import Image from "next/image";
import Link from "next/link";
import { BsWhatsapp } from "react-icons/bs";
import styles from "./Navbar.module.css";

const links = [
  { label: "Construção Civil", href: "/construcao-civil" },
  { label: "Personalizados", href: "/personalizados" },
  { label: "Projetos", href: "/projetos" },
  { label: "Sobre Nós", href: "/sobre-nos" },
  { label: "Contato", href: "/contato" },
];

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <Link href="/">
            <Image
              src="/easycorten-Ago2023-LogotipoHorizontal_Color.svg"
              alt="Easy Corten"
              width={160}
              height={40}
              priority
            />
          </Link>
          <ul className={styles.links}>
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cta}
        >
          Solicitar orçamento <BsWhatsapp />
        </a>
      </div>
    </nav>
  );
}
