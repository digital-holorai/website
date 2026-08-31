import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = process.cwd();

const pages = [
  ['home', 'index.html', ''],
  ['services', 'services.html', 'services'],
  ['portfolio', 'portfolio.html', 'portfolio'],
  ['demos', 'demos.html', 'demos'],
  ['pricing', 'pricing.html', 'pricing'],
  ['about', 'about.html', 'about'],
  ['blog', 'blog.html', 'blog'],
  ['login', 'login.html', 'login'],
  ['dashboard', 'dashboard.html', 'dashboard'],
  ['case', 'case.html', 'case'],
  ['post', 'post.html', 'post']
];

const htmlPageMap = new Map(pages.map(([key, file, route]) => [file, route ? `/${route}` : '/']));

function extractBetween(source, startRe, endRe, label) {
  const start = source.search(startRe);
  if (start < 0) throw new Error(`Missing ${label} start`);
  const afterStart = source.slice(start).match(startRe)[0].length + start;
  const rest = source.slice(afterStart);
  const end = rest.search(endRe);
  if (end < 0) throw new Error(`Missing ${label} end`);
  return rest.slice(0, end);
}

function rewriteLegacyUrls(content) {
  let out = content;
  out = out.replace(/post\.html\?id=([A-Za-z0-9_-]+)/g, '/blog/$1');
  out = out.replace(/\/post\?id=([A-Za-z0-9_-]+)/g, '/blog/$1');
  for (const [file, route] of htmlPageMap) {
    const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(escaped, 'g'), route);
  }
  return out;
}

function metadataFrom(source) {
  const title = source.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || 'HOLORAI';
  const description = source.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1]?.trim();
  return description ? { title, description } : { title };
}

function optimizeLegacyStyles(styles) {
  return styles
    .replace(/@font-face\s*\{[\s\S]*?\}\s*/g, '')
    .replace(/--font-display:\s*'Sora',\s*/g, '--font-display: ')
    .replace(/letter-spacing:\s*-\d*\.?\d+em/g, 'letter-spacing: 0');
}

function extractPostSeed(source) {
  const match = source.match(/var POST_SEED = \[([\s\S]*?)\n  \];\n\n  var AUTHOR_BIOS = /);
  if (!match) throw new Error('Missing POST_SEED block in post.html');
  return new Function(`return [${match[1]}];`)();
}

function writeBlogPostRoute() {
  const filePath = join(root, 'app', 'blog', '[slug]', 'page.jsx');
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(
    filePath,
    `import { notFound } from 'next/navigation';\n` +
      `import { blogPosts, getBlogPost } from '../../blogPosts';\n\n` +
      `const SITE_URL = 'https://holorai.com';\n\n` +
      `const AUTHOR_BIOS = {\n` +
      `  'Hamza Qureshi': 'HOLORAI writer focused on practical software delivery, client scope and production engineering.',\n` +
      `  'Mahnoor Baig': 'HOLORAI writer focused on AI systems, model evaluation and retrieval pipelines.',\n` +
      `  'Sana Riaz': 'HOLORAI writer focused on product workflows, interface design and discovery notes.',\n` +
      `  'Bilal Ahmed': 'HOLORAI writer focused on delivery planning, documentation and project handover.',\n` +
      `  'Talha Nadeem': 'HOLORAI writer focused on software systems, IoT workflows and engineering delivery.',\n` +
      `  'Ayesha Khan': 'HOLORAI writer focused on mechanical design, Fusion 360 workflows and product systems.'\n` +
      `};\n\n` +
      `const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];\n\n` +
      `export const dynamicParams = false;\n\n` +
      `export function generateStaticParams() {\n` +
      `  return blogPosts.map((post) => ({ slug: post.id }));\n` +
      `}\n\n` +
      `export async function generateMetadata({ params }) {\n` +
      `  const { slug } = await params;\n` +
      `  const post = getBlogPost(slug);\n` +
      `  if (!post) return { title: 'Article not found — HOLORAI' };\n` +
      `  const description = post.metaDescription || post.dek || 'A HOLORAI blog article.';\n` +
      `  const url = \`/blog/\${post.id}\`;\n` +
      `  return {\n` +
      `    title: \`\${post.title} — HOLORAI Blog\`,\n` +
      `    description,\n` +
      `    keywords: post.keywords || [],\n` +
      `    alternates: { canonical: url },\n` +
      `    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },\n` +
      `    openGraph: {\n` +
      `      type: 'article',\n` +
      `      siteName: 'HOLORAI PVT LTD',\n` +
      `      url,\n` +
      `      title: post.title,\n` +
      `      description,\n` +
      `      publishedTime: post.date,\n` +
      `      authors: [post.author?.name || 'HOLORAI'],\n` +
      `      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: post.title }]\n` +
      `    },\n` +
      `    twitter: {\n` +
      `      card: 'summary_large_image',\n` +
      `      title: post.title,\n` +
      `      description,\n` +
      `      images: ['/og-image.png']\n` +
      `    }\n` +
      `  };\n` +
      `}\n\n` +
      `function formatDate(iso) {\n` +
      `  const parts = String(iso || '').split('-');\n` +
      `  if (parts.length !== 3) return iso || '';\n` +
      `  const month = Number(parts[1]);\n` +
      `  return \`\${Number(parts[2])} \${MONTHS[month - 1] || ''} \${parts[0]}\`.trim();\n` +
      `}\n\n` +
      `function initials(name) {\n` +
      `  const parts = String(name || '').trim().split(/\\s+/);\n` +
      `  const first = parts[0]?.charAt(0) || '';\n` +
      `  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';\n` +
      `  return (first + last).toUpperCase() || 'H';\n` +
      `}\n\n` +
      `function Avatar({ name, size = 48 }) {\n` +
      `  return (\n` +
      `    <svg className=\"avatar-svg\" viewBox=\"0 0 48 48\" width={size} height={size} aria-hidden=\"true\" focusable=\"false\">\n` +
      `      <circle cx=\"24\" cy=\"24\" r=\"23\" style={{ fill: 'var(--wash-indigo)', stroke: 'var(--line-strong)' }} />\n` +
      `      <text x=\"24\" y=\"29.5\" textAnchor=\"middle\" style={{ fill: 'var(--blue)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, letterSpacing: '.02em' }}>{initials(name)}</text>\n` +
      `    </svg>\n` +
      `  );\n` +
      `}\n\n` +
      `function Cover({ kind = 'grid' }) {\n` +
      `  const common = { width: 1200, height: 280, viewBox: '0 0 1200 280', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true', focusable: 'false' };\n` +
      `  if (kind === 'arcs') return <svg {...common}><circle cx=\"1200\" cy=\"280\" r=\"130\" fill=\"none\" style={{ stroke: 'var(--teal)', strokeWidth: 2.5 }} /><circle cx=\"1200\" cy=\"280\" r=\"200\" fill=\"none\" style={{ stroke: 'var(--teal)', strokeWidth: 2, opacity: .55 }} /><circle cx=\"1200\" cy=\"280\" r=\"270\" fill=\"none\" style={{ stroke: 'var(--teal)', strokeWidth: 2, opacity: .32 }} /><line x1=\"0\" y1=\"170\" x2=\"1200\" y2=\"170\" style={{ stroke: 'var(--indigo)', strokeWidth: 1.5, opacity: .28 }} /><circle cx=\"906\" cy=\"170\" r=\"5\" style={{ fill: 'var(--teal)' }} /></svg>;\n` +
      `  if (kind === 'dots') return <svg {...common}><circle cx=\"260\" cy=\"120\" r=\"7\" style={{ fill: 'var(--teal)' }} /><circle cx=\"420\" cy=\"190\" r=\"7\" style={{ fill: 'var(--blue)' }} /><circle cx=\"600\" cy=\"130\" r=\"7\" style={{ fill: 'var(--indigo)', opacity: .7 }} /><circle cx=\"780\" cy=\"205\" r=\"7\" style={{ fill: 'var(--teal)' }} /><path d=\"M260 120 C 420 190, 600 130, 780 205\" fill=\"none\" style={{ stroke: 'var(--teal)', strokeWidth: 2, opacity: .5 }} /><line x1=\"0\" y1=\"236\" x2=\"1200\" y2=\"236\" style={{ stroke: 'var(--indigo)', strokeWidth: 1.5, opacity: .25 }} /></svg>;\n` +
      `  if (kind === 'cube') return <svg {...common}><path d=\"M430 210 L600 70 L770 210 Z\" fill=\"none\" style={{ stroke: 'var(--teal)', strokeWidth: 2.5 }} /><path d=\"M430 210 L600 260 L770 210\" fill=\"none\" style={{ stroke: 'var(--indigo)', strokeWidth: 1.5, opacity: .5 }} /><line x1=\"600\" y1=\"70\" x2=\"600\" y2=\"260\" style={{ stroke: 'var(--blue)', strokeWidth: 1.5, opacity: .45 }} /></svg>;\n` +
      `  return <svg {...common}><rect x=\"320\" y=\"70\" width=\"560\" height=\"150\" rx=\"10\" fill=\"none\" style={{ stroke: 'var(--indigo)', strokeWidth: 1.5, opacity: .35 }} /><rect x=\"390\" y=\"110\" width=\"140\" height=\"72\" rx=\"6\" fill=\"none\" style={{ stroke: 'var(--teal)', strokeWidth: 2.5 }} /><rect x=\"590\" y=\"128\" width=\"140\" height=\"72\" rx=\"6\" fill=\"none\" style={{ stroke: 'var(--blue)', strokeWidth: 2 }} /><line x1=\"0\" y1=\"246\" x2=\"1200\" y2=\"246\" style={{ stroke: 'var(--indigo)', strokeWidth: 1.5, opacity: .25 }} /></svg>;\n` +
      `}\n\n` +
      `function jsonLd(post) {\n` +
      `  const url = \`\${SITE_URL}/blog/\${post.id}\`;\n` +
      `  return {\n` +
      `    '@context': 'https://schema.org',\n` +
      `    '@graph': [\n` +
      `      { '@type': 'BreadcrumbList', itemListElement: [\n` +
      `        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },\n` +
      `        { '@type': 'ListItem', position: 2, name: 'Blog', item: \`\${SITE_URL}/blog\` },\n` +
      `        { '@type': 'ListItem', position: 3, name: post.title, item: url }\n` +
      `      ] },\n` +
      `      { '@type': 'BlogPosting', headline: post.title, description: post.metaDescription || post.dek || '', datePublished: post.date, dateModified: post.date, articleSection: post.category, keywords: (post.keywords || []).join(', '), author: { '@type': 'Person', name: post.author?.name || 'HOLORAI' }, publisher: { '@type': 'Organization', name: 'HOLORAI PVT LTD', url: SITE_URL, logo: { '@type': 'ImageObject', url: \`\${SITE_URL}/holorai-logo-transparent.png\` } }, image: \`\${SITE_URL}/og-image.png\`, mainEntityOfPage: url, inLanguage: 'en' }\n` +
      `    ]\n` +
      `  };\n` +
      `}\n\n` +
      `export default async function Page({ params }) {\n` +
      `  const { slug } = await params;\n` +
      `  const post = getBlogPost(slug);\n` +
      `  if (!post) notFound();\n` +
      `  const authorName = post.author?.name || 'HOLORAI';\n` +
      `  const related = blogPosts.filter((item) => item.id !== post.id).sort((a, b) => (a.category === post.category ? -1 : 0) - (b.category === post.category ? -1 : 0) || String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 2);\n` +
      `  return (\n` +
      `    <>\n` +
      `      <a className=\"skip-link\" href=\"#main\">Skip to main content</a>\n` +
      `      <header className=\"site-header\"><div className=\"container nav-bar\"><a className=\"logotype\" href=\"/\" aria-label=\"HOLORAI PVT LTD — home\"><img className=\"brand-logo\" src=\"/holorai-logo-transparent.png\" alt=\"\" width=\"1600\" height=\"689\" decoding=\"async\" /></a><nav className=\"primary-nav\" aria-label=\"Primary\"><div className=\"nav-menu\"><ul className=\"nav-links\"><li><a href=\"/services\">Services</a></li><li><a href=\"/portfolio\">Portfolio</a></li><li><a href=\"/demos\">Demos</a></li><li><a href=\"/pricing\">Pricing</a></li><li><a href=\"/about\">About</a></li><li><a href=\"/blog\">Blog</a></li></ul><a className=\"nav-login\" href=\"/login\">Log in</a><a className=\"btn btn-teal btn-nav\" href=\"/demos#book\">Book a free demo</a></div></nav></div></header>\n` +
      `      <main id=\"main\">\n` +
      `        <article>\n` +
      `          <header className=\"post-hero\"><div className=\"container\"><div className=\"post-hero-inner\"><p className=\"eyebrow\">{post.category || 'Blog'}</p><h1>{post.title}</h1><p className=\"post-dek-lead\">{post.dek}</p><div className=\"byline\"><Avatar name={authorName} /><span className=\"byline-who\"><span className=\"name\">{authorName}</span></span><p className=\"post-meta\"><time dateTime={post.date}>{formatDate(post.date)}</time><span>{post.readMins || 5} min read</span><span className=\"post-tag\">{post.category || 'Notes'}</span></p></div><ul className=\"kw-chips\" aria-label=\"Keywords\">{(post.keywords || []).map((kw) => <li className=\"kw-chip\" key={kw}>{kw}</li>)}</ul></div></div></header>\n` +
      `          <div className=\"post-cover\" aria-hidden=\"true\"><Cover kind={post.cover} /></div>\n` +
      `          <div className=\"article-wrap\"><div className=\"article\" dangerouslySetInnerHTML={{ __html: post.body }} /><aside className=\"author-card\" aria-label=\"About the author\"><Avatar name={authorName} size={56} /><div><p className=\"eyebrow\">Written by</p><span className=\"name\">{authorName}</span><p className=\"bio\">{AUTHOR_BIOS[authorName] || 'Part of the HOLORAI team behind shipped software, AI and automation projects.'}</p></div></aside></div>\n` +
      `        </article>\n` +
      `        <section className=\"related cv\" aria-labelledby=\"h-related\"><div className=\"container\"><p className=\"eyebrow\">Read next</p><h2 className=\"h2\" id=\"h-related\">Related posts</h2><div className=\"related-cards\">{related.map((item) => <article className=\"related-card\" key={item.id}><p className=\"post-meta\"><span className=\"post-tag\">{item.category || 'Notes'}</span><time dateTime={item.date}>{formatDate(item.date)}</time></p><h3><a href={\`/blog/\${item.id}\`}>{item.title}</a></h3></article>)}</div></div></section>\n` +
      `      </main>\n` +
      `      <script type=\"application/ld+json\" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(post)).replace(/</g, '\\\\u003c') }} />\n` +
      `    </>\n` +
      `  );\n` +
      `}\n`
  );
}

const contents = {};
const scripts = {};
const metadata = {};
const cssChunks = [];
let blogPosts = [];

for (const [key, file] of pages) {
  const source = readFileSync(join(root, file), 'utf8');
  if (file === 'post.html') {
    blogPosts = extractPostSeed(source);
  }
  const styles = optimizeLegacyStyles(
    [...source.matchAll(/<style>([\s\S]*?)<\/style>/gi)].map((match) => match[1].trim()).join('\n\n')
  );
  const body = extractBetween(source, /<body[^>]*>/i, /<\/body>/i, 'body').trim();
  const scriptMatches = [...body.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)];
  const bodyWithoutScripts = body.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').trim();

  cssChunks.push(`/* ===== ${file} ===== */\n${rewriteLegacyUrls(styles)}`);
  contents[key] = rewriteLegacyUrls(bodyWithoutScripts);
  scripts[key] = scriptMatches.map((match) => {
    const attrs = {};
    for (const attr of match[1].matchAll(/\s+([^\s=]+)(?:=(["'])(.*?)\2)?/g)) {
      attrs[attr[1]] = attr[3] ?? '';
    }
    return { attrs, code: rewriteLegacyUrls(match[2]) };
  });
  metadata[key] = metadataFrom(source);
}

mkdirSync(join(root, 'app'), { recursive: true });
writeFileSync(
  join(root, 'app', 'blogPosts.js'),
  `export const blogPosts = ${JSON.stringify(blogPosts, null, 2)};\n\n` +
    `export function getBlogPost(slug) {\n` +
    `  return blogPosts.find((post) => post.id === slug);\n` +
    `}\n`
);

writeFileSync(
  join(root, 'app', 'legacyContent.js'),
  `export const legacyPages = ${JSON.stringify(contents, null, 2)};\n\nexport const legacyScripts = ${JSON.stringify(scripts, null, 2)};\n\nexport const legacyMetadata = ${JSON.stringify(metadata, null, 2)};\n`
);

writeFileSync(
  join(root, 'app', 'globals.css'),
  `${cssChunks.join('\n\n')}\n`
);

function writePageFile(routeDir, key) {
  const filePath = routeDir ? join(root, 'app', routeDir, 'page.jsx') : join(root, 'app', 'page.jsx');
  mkdirSync(dirname(filePath), { recursive: true });
  if (key === 'post') {
    writeFileSync(
      filePath,
      `import { redirect } from 'next/navigation';\n\n` +
        `export const metadata = {\n` +
        `  title: 'Blog article — HOLORAI',\n` +
        `  robots: { index: false, follow: true }\n` +
        `};\n\n` +
        `export default async function Page({ searchParams }) {\n` +
        `  const params = await searchParams;\n` +
        `  const id = typeof params?.id === 'string' ? params.id : '';\n` +
        `  redirect(id ? \`/blog/\${encodeURIComponent(id)}\` : '/blog');\n` +
        `}\n`
    );
    return;
  }
  writeFileSync(
    filePath,
    `import LegacyPage from ${routeDir ? "'../components/LegacyPage'" : "'./components/LegacyPage'"};\n` +
      `import { legacyMetadata, legacyPages, legacyScripts } from ${routeDir ? "'../legacyContent'" : "'./legacyContent'"};\n\n` +
      `export const metadata = legacyMetadata.${key};\n\n` +
      `export default function Page() {\n` +
      `  return <LegacyPage html={legacyPages.${key}} scripts={legacyScripts.${key}} />;\n` +
      `}\n`
  );
}

for (const [key, , route] of pages) {
  writePageFile(route, key);
}

writeBlogPostRoute();

for (const route of ['privacy', 'terms']) {
  const title = route === 'privacy' ? 'Privacy — HOLORAI' : 'Terms — HOLORAI';
  const heading = route === 'privacy' ? 'Privacy' : 'Terms';
  const filePath = join(root, 'app', route, 'page.jsx');
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(
    filePath,
    `export const metadata = { title: ${JSON.stringify(title)} };\n\n` +
      `export default function Page() {\n` +
      `  return (\n` +
      `    <main id="main" className="section section--roomy-top">\n` +
      `      <div className="container">\n` +
      `        <p className="eyebrow">HOLORAI</p>\n` +
      `        <h1 className="h2">${heading}</h1>\n` +
      `        <p style={{ marginTop: 'var(--space-4)', color: 'var(--ink-2)', maxWidth: '64ch' }}>\n` +
      `          This page is ready for your ${route} content.\n` +
      `        </p>\n` +
      `      </div>\n` +
      `    </main>\n` +
      `  );\n` +
      `}\n`
  );
}

console.log(`Generated ${pages.length} legacy routes and shared CSS.`);
