import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Blog article — HOLORAI',
  robots: { index: false, follow: true }
};

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const id = typeof params?.id === 'string' ? params.id : '';
  redirect(id ? `/blog/${encodeURIComponent(id)}` : '/blog');
}
