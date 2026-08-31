export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/login']
      }
    ],
    sitemap: 'https://holorai.com/sitemap.xml',
    host: 'https://holorai.com'
  };
}
