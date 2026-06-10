import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { BLOG_POSTS, getAllCategories, getPostsByCategory } from '@/lib/blog';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Blog – Easy Corten',
  description: 'Artigos sobre aço corten, design, sustentabilidade e arquitetura.',
};

type Props = {
  searchParams: Promise<{ category?: string }>;
};

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(dateStr)
  );
}

export default async function BlogPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const posts = getPostsByCategory(category);
  const categories = getAllCategories();

  const [featured, ...rest] = posts;

  return (
    <main className={styles.main}>
      <div className={styles.wrapper}>
        <header className={styles.pageHeader}>
          <p className={styles.pageLabel}>Blog</p>
          <h1 className={styles.pageTitle}>Conteúdo sobre aço corten</h1>
          <p className={styles.pageSubtitle}>
            Artigos, guias e referências sobre design, sustentabilidade e arquitetura com corten.
          </p>
        </header>

        <nav className={styles.categoryBar} aria-label="Filtrar por categoria">
          <Link
            href="/blog"
            className={`${styles.categoryChip} ${!category ? styles.categoryChipActive : ''}`}
          >
            Todos
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/blog?category=${encodeURIComponent(cat)}`}
              className={`${styles.categoryChip} ${category === cat ? styles.categoryChipActive : ''}`}
            >
              {cat}
            </Link>
          ))}
        </nav>

        {featured && (
          <Link href={`/blog/${featured.slug}`} className={styles.featured}>
            {featured.coverImage ? (
              <div className={styles.featuredImg}>
                <Image
                  src={featured.coverImage}
                  alt={featured.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 900px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div className={styles.featuredImgPlaceholder} />
            )}
            <div className={styles.featuredBody}>
              <span className={styles.categoryTag}>{featured.category}</span>
              <h2 className={styles.featuredTitle}>{featured.title}</h2>
              <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
              <div className={styles.featuredMeta}>
                <span className={styles.authorAvatarFallback}>
                  {featured.authorName.charAt(0)}
                </span>
                <span className={styles.authorName}>{featured.authorName}</span>
                <span className={styles.metaDot}>·</span>
                <span className={styles.metaDate}>{formatDate(featured.publishedAt)}</span>
                <>
                  <span className={styles.metaDot}>·</span>
                  <span className={styles.metaRead}>{featured.readTimeMinutes} min de leitura</span>
                </>
              </div>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div className={styles.grid}>
            {rest.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className={styles.card}>
                {post.coverImage ? (
                  <div className={styles.cardImg}>
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className={styles.cardImgPlaceholder} />
                )}
                <div className={styles.cardBody}>
                  <span className={styles.categoryTag}>{post.category}</span>
                  <h3 className={styles.cardTitle}>{post.title}</h3>
                  <p className={styles.cardExcerpt}>{post.excerpt}</p>
                  <div className={styles.cardMeta}>
                    <span className={styles.authorAvatarFallbackSm}>
                      {post.authorName.charAt(0)}
                    </span>
                    <span className={styles.authorName}>{post.authorName}</span>
                    <span className={styles.metaDot}>·</span>
                    <span className={styles.metaDate}>{formatDate(post.publishedAt)}</span>
                    <>
                      <span className={styles.metaDot}>·</span>
                      <span className={styles.metaRead}>{post.readTimeMinutes} min</span>
                    </>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 && (
          <div className={styles.empty}>
            <p>Nenhum artigo publicado nesta categoria ainda.</p>
          </div>
        )}
      </div>
    </main>
  );
}
