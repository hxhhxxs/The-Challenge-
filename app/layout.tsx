import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Challenge',
  description: 'A personalized 100-point whole-life transformation app.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
