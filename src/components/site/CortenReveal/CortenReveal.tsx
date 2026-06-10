'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './CortenReveal.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function CortenReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,
        },
      });

      // Phase 1: image rises from below into view
      tl.fromTo(
        imageRef.current,
        { y: '70vh' },
        { y: '0vh', ease: 'none', duration: 0.6 }
      );

      // Phase 2: image shrinks from the top as it settles
      tl.to(
        imageRef.current,
        { scale: 0.62, ease: 'none', duration: 0.4 }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.sticky}>
        <div ref={imageRef} className={styles.imageWrap}>
          <picture>
            <source srcSet="/cortenmadeeasy_Prancheta_1.avif" type="image/avif" />
            <source srcSet="/cortenmadeeasy_Prancheta_1.webp" type="image/webp" />
            <img
              src="/cortenmadeeasy_Prancheta_1.png"
              alt="EasyCorten – Aço Corten"
              className={styles.image}
            />
          </picture>
        </div>
      </div>
    </div>
  );
}
