import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: { default: 'PhysiquePath', template: '%s | PhysiquePath' },
  description:
    'Your personalised physique journey — sustainable nutrition, smart training, and real progress tracking.',
  keywords: ['fitness', 'nutrition', 'workout', 'physique', 'health', 'training'],
  authors: [{ name: 'PhysiquePath' }],
};

export const viewport: Viewport = {
  themeColor: '#059669',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head />
      <body className="min-h-screen bg-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
