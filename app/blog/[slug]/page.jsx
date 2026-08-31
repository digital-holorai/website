import { notFound } from 'next/navigation';
import { blogPosts, getBlogPost } from '../../blogPosts';

const SITE_URL = 'https://holorai.com';

const AUTHOR_BIOS = {
  'Hamza Qureshi': 'HOLORAI writer focused on practical software delivery, client scope and production engineering.',
  'Mahnoor Baig': 'HOLORAI writer focused on AI systems, model evaluation and retrieval pipelines.',
  'Sana Riaz': 'HOLORAI writer focused on product workflows, interface design and discovery notes.',
  'Bilal Ahmed': 'HOLORAI writer focused on delivery planning, documentation and project handover.',
  'Talha Nadeem': 'HOLORAI writer focused on software systems, IoT workflows and engineering delivery.',
  'Ayesha Khan': 'HOLORAI writer focused on mechanical design, Fusion 360 workflows and product systems.'
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.id }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: 'Article not found — HOLORAI' };
  const description = post.metaDescription || post.dek || 'A HOLORAI blog article.';
  const url = `/blog/${post.id}`;
  return {
    title: `${post.title} — HOLORAI Blog`,
    description,
    keywords: post.keywords || [],
    alternates: { canonical: url },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
    openGraph: {
      type: 'article',
      siteName: 'HOLORAI PVT LTD',
      url,
      title: post.title,
      description,
      publishedTime: post.date,
      authors: [post.author?.name || 'HOLORAI'],
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: post.title }]
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: ['/og-image.png']
    }
  };
}

function formatDate(iso) {
  const parts = String(iso || '').split('-');
  if (parts.length !== 3) return iso || '';
  const month = Number(parts[1]);
  return `${Number(parts[2])} ${MONTHS[month - 1] || ''} ${parts[0]}`.trim();
}

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/);
  const first = parts[0]?.charAt(0) || '';
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase() || 'H';
}

function Avatar({ name, size = 48 }) {
  return (
    <svg className="avatar-svg" viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="23" style={{ fill: 'var(--wash-indigo)', stroke: 'var(--line-strong)' }} />
      <text x="24" y="29.5" textAnchor="middle" style={{ fill: 'var(--blue)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, letterSpacing: '.02em' }}>{initials(name)}</text>
    </svg>
  );
}

function Cover({ kind = 'grid' }) {
  const common = { width: 1200, height: 280, viewBox: '0 0 1200 280', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true', focusable: 'false' };
  if (kind === 'arcs') return <svg {...common}><circle cx="1200" cy="280" r="130" fill="none" style={{ stroke: 'var(--teal)', strokeWidth: 2.5 }} /><circle cx="1200" cy="280" r="200" fill="none" style={{ stroke: 'var(--teal)', strokeWidth: 2, opacity: .55 }} /><circle cx="1200" cy="280" r="270" fill="none" style={{ stroke: 'var(--teal)', strokeWidth: 2, opacity: .32 }} /><line x1="0" y1="170" x2="1200" y2="170" style={{ stroke: 'var(--indigo)', strokeWidth: 1.5, opacity: .28 }} /><circle cx="906" cy="170" r="5" style={{ fill: 'var(--teal)' }} /></svg>;
  if (kind === 'dots') return <svg {...common}><circle cx="260" cy="120" r="7" style={{ fill: 'var(--teal)' }} /><circle cx="420" cy="190" r="7" style={{ fill: 'var(--blue)' }} /><circle cx="600" cy="130" r="7" style={{ fill: 'var(--indigo)', opacity: .7 }} /><circle cx="780" cy="205" r="7" style={{ fill: 'var(--teal)' }} /><path d="M260 120 C 420 190, 600 130, 780 205" fill="none" style={{ stroke: 'var(--teal)', strokeWidth: 2, opacity: .5 }} /><line x1="0" y1="236" x2="1200" y2="236" style={{ stroke: 'var(--indigo)', strokeWidth: 1.5, opacity: .25 }} /></svg>;
  if (kind === 'cube') return <svg {...common}><path d="M430 210 L600 70 L770 210 Z" fill="none" style={{ stroke: 'var(--teal)', strokeWidth: 2.5 }} /><path d="M430 210 L600 260 L770 210" fill="none" style={{ stroke: 'var(--indigo)', strokeWidth: 1.5, opacity: .5 }} /><line x1="600" y1="70" x2="600" y2="260" style={{ stroke: 'var(--blue)', strokeWidth: 1.5, opacity: .45 }} /></svg>;
  return <svg {...common}><rect x="320" y="70" width="560" height="150" rx="10" fill="none" style={{ stroke: 'var(--indigo)', strokeWidth: 1.5, opacity: .35 }} /><rect x="390" y="110" width="140" height="72" rx="6" fill="none" style={{ stroke: 'var(--teal)', strokeWidth: 2.5 }} /><rect x="590" y="128" width="140" height="72" rx="6" fill="none" style={{ stroke: 'var(--blue)', strokeWidth: 2 }} /><line x1="0" y1="246" x2="1200" y2="246" style={{ stroke: 'var(--indigo)', strokeWidth: 1.5, opacity: .25 }} /></svg>;
}

function jsonLd(post) {
  const url = `${SITE_URL}/blog/${post.id}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: url }
      ] },
      { '@type': 'BlogPosting', headline: post.title, description: post.metaDescription || post.dek || '', datePublished: post.date, dateModified: post.date, articleSection: post.category, keywords: (post.keywords || []).join(', '), author: { '@type': 'Person', name: post.author?.name || 'HOLORAI' }, publisher: { '@type': 'Organization', name: 'HOLORAI PVT LTD', url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/holorai-logo-transparent.png` } }, image: `${SITE_URL}/og-image.png`, mainEntityOfPage: url, inLanguage: 'en' }
    ]
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const authorName = post.author?.name || 'HOLORAI';
  const related = blogPosts.filter((item) => item.id !== post.id).sort((a, b) => (a.category === post.category ? -1 : 0) - (b.category === post.category ? -1 : 0) || String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 2);
  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>
      <header className="site-header"><div className="container nav-bar"><a className="logotype" href="/" aria-label="HOLORAI PVT LTD — home"><img className="brand-logo" src="/holorai-logo-transparent.png" alt="" width="1600" height="689" decoding="async" /></a><nav className="primary-nav" aria-label="Primary"><div className="nav-menu"><ul className="nav-links"><li><a href="/services">Services</a></li><li><a href="/portfolio">Portfolio</a></li><li><a href="/demos">Demos</a></li><li><a href="/pricing">Pricing</a></li><li><a href="/about">About</a></li><li><a href="/blog">Blog</a></li></ul><a className="nav-login" href="/login">Log in</a><a className="btn btn-teal btn-nav" href="/demos#book">Book a free demo</a></div></nav></div></header>
      <main id="main">
        <article>
          <header className="post-hero"><div className="container"><div className="post-hero-inner"><p className="eyebrow">{post.category || 'Blog'}</p><h1>{post.title}</h1><p className="post-dek-lead">{post.dek}</p><div className="byline"><Avatar name={authorName} /><span className="byline-who"><span className="name">{authorName}</span></span><p className="post-meta"><time dateTime={post.date}>{formatDate(post.date)}</time><span>{post.readMins || 5} min read</span><span className="post-tag">{post.category || 'Notes'}</span></p></div><ul className="kw-chips" aria-label="Keywords">{(post.keywords || []).map((kw) => <li className="kw-chip" key={kw}>{kw}</li>)}</ul></div></div></header>
          <div className="post-cover" aria-hidden="true"><Cover kind={post.cover} /></div>
          <div className="article-wrap"><div className="article" dangerouslySetInnerHTML={{ __html: post.body }} /><aside className="author-card" aria-label="About the author"><Avatar name={authorName} size={56} /><div><p className="eyebrow">Written by</p><span className="name">{authorName}</span><p className="bio">{AUTHOR_BIOS[authorName] || 'Part of the HOLORAI team behind shipped software, AI and automation projects.'}</p></div></aside></div>
        </article>
        <section className="related cv" aria-labelledby="h-related"><div className="container"><p className="eyebrow">Read next</p><h2 className="h2" id="h-related">Related posts</h2><div className="related-cards">{related.map((item) => <article className="related-card" key={item.id}><p className="post-meta"><span className="post-tag">{item.category || 'Notes'}</span><time dateTime={item.date}>{formatDate(item.date)}</time></p><h3><a href={`/blog/${item.id}`}>{item.title}</a></h3></article>)}</div></div></section>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(post)).replace(/</g, '\\u003c') }} />
    </>
  );
}
