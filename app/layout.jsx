import './globals.css';

export const metadata = {
  metadataBase: new URL('https://holorai.com'),
  title: {
    default: 'HOLORAI',
    template: '%s'
  },
  description:
    'HOLORAI builds custom software, AI integrations, automation systems and practical engineering content for businesses and individuals.',
  applicationName: 'HOLORAI',
  authors: [{ name: 'HOLORAI PVT LTD' }],
  creator: 'HOLORAI PVT LTD',
  publisher: 'HOLORAI PVT LTD',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large'
    }
  },
  openGraph: {
    type: 'website',
    siteName: 'HOLORAI PVT LTD',
    url: 'https://holorai.com',
    title: 'HOLORAI',
    description:
      'Custom software, AI integrations, automation systems and practical engineering content.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HOLORAI — custom software, AI integration and automation'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HOLORAI',
    description:
      'Custom software, AI integrations, automation systems and practical engineering content.',
    images: ['/og-image.png']
  },
  icons: {
    icon: '/holorai-logo-transparent.png',
    shortcut: '/holorai-logo-transparent.png',
    apple: '/holorai-logo-transparent.png'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1B264F',
  colorScheme: 'light'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="js">
      <body>{children}</body>
    </html>
  );
}
