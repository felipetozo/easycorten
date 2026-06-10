import Link from 'next/link';
import Image from 'next/image';
import { MdRssFeed } from 'react-icons/md';
import { BLOG_POSTS } from '@/lib/blog';
import styles from './BlogSection.module.css';

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export default function BlogSection() {
  const posts = BLOG_POSTS.slice(0, 4);

  return (
    <section className={styles.section} aria-labelledby="blog-section-title">
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <div className={styles.eyebrow}>
            <MdRssFeed className={styles.eyebrowIcon} />
            <span>BLOG</span>
          </div>
          <h2 id="blog-section-title" className={styles.title}>
            Do nosso blog
          </h2>
          <p className={styles.lead}>
            Conteúdo sobre aço corten, design, sustentabilidade e arquitetura.
          </p>
        </header>

        <div className={styles.grid}>
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className={styles.card}>
              {post.coverImage ? (
                <div className={styles.cardImg}>
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 21vw"
                  />
                </div>
              ) : (
                <div className={styles.cardImgPlaceholder} />
              )}
              <div className={styles.cardBody}>
                <span className={styles.tag}>{post.category}</span>
                <h3 className={styles.cardTitle}>{post.title}</h3>
                <p className={styles.cardExcerpt}>{post.excerpt}</p>
                <div className={styles.cardMeta}>
                  <span>{post.authorName}</span>
                  <span className={styles.dot}>·</span>
                  <span>{formatDate(post.publishedAt)}</span>
                  <span className={styles.dot}>·</span>
                  <span>{post.readTimeMinutes} min</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.footer}>
          <Link href="/blog" className={styles.allLink}>
            Ver todos os artigos
          </Link>
        </div>
      </div>
    </section>
  );
}
