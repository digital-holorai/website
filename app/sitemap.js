import { blogPosts } from './blogPosts';

const SITE_URL = 'https://holorai.com';

const staticRoutes = [
  ['', 1],
  ['services', 0.9],
  ['portfolio', 0.9],
  ['demos', 0.9],
  ['pricing', 0.8],
  ['about', 0.8],
  ['blog', 0.9],
  ['case', 0.7],
  ['privacy', 0.3],
  ['terms', 0.3]
];

export default function sitemap() {
  const now = new Date();
  const pages = staticRoutes.map(([route, priority]) => ({
    url: `${SITE_URL}/${route}`.replace(/\/$/, route ? '' : '/'),
    lastModified: now,
    changeFrequency: route === 'blog' ? 'weekly' : 'monthly',
    priority
  }));

  const posts = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.id}`,
    lastModified: post.date ? new Date(`${post.date}T00:00:00.000Z`) : now,
    changeFrequency: 'monthly',
    priority: post.caseStudy ? 0.85 : 0.75
  }));

  return [...pages, ...posts];
}
