"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { BsChevronLeft, BsChevronRight, BsWhatsapp } from "react-icons/bs";
import type { ReactNode } from "react";
import styles from "./HeroBanner.module.css";

type Slide = {
  image: string;
  alt: string;
  title: ReactNode;
  description: string;
};

const slides: Slide[] = [
  {
    image: "/EasyCorten-Corten-Fachada.avif",
    alt: "A autenticidade do Aço Corten, mais simples que nunca.",
    title: (
      <>
        A autenticidade do <br />
        Aço Corten, mais <br />
        simples que nunca.
      </>
    ),
    description:
      "Mergulhe na sofisticação e durabilidade do Aço Corten e descubra por que ele é a escolha ideal para projetos que buscam destaque e uma identidade única.",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <section className={styles.section}>
      <Image
        src={slides[current].image}
        alt={slides[current].alt}
        fill
        style={{ objectFit: "cover", objectPosition: "center" }}
        priority
      />
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div className={styles.textGroup}>
            <h1 className={styles.title}>{slides[current].title}</h1>
            <p className={styles.description}>{slides[current].description}</p>
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
        <div className={styles.controls}>
          <button className={styles.control} onClick={prev} aria-label="Anterior">
            <BsChevronLeft />
          </button>
          <button className={styles.control} onClick={next} aria-label="Próximo">
            <BsChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}
