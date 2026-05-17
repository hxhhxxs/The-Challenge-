import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeModeProvider } from '@/components/ThemeModeProvider';

export const metadata: Metadata = {
  title: 'The Challenge',
  description: 'A personalized 100-point whole-life transformation app.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <ThemeModeProvider>
          <div id="main-content" className="app-shell" tabIndex={-1}>{children}</div>
        </ThemeModeProvider>
      </body>
    </html>
  );
}
