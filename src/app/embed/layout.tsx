// Embed layout — strips global Navbar and MascotGuide
// so the page is clean when iframed into Redrob App Store
import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Redrob Jugaad',
  description: 'AI-powered micro-gig marketplace for students and businesses.',
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" style={{ colorScheme: 'dark' }}>
      <body style={{ margin: 0, padding: 0, background: 'var(--bg)', color: 'var(--ink)' }}>
        {/* No Navbar, no MascotGuide — clean iframe */}
        {children}
      </body>
    </html>
  );
}
