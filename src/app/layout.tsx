import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import MascotGuide from '@/components/MascotGuide';

export const metadata: Metadata = {
  title: 'Redrob Jugaad — AI-Powered Micro-Gig Marketplace',
  description: 'Post tasks, find verified student talent, and build your career track record. Powered by Redrob AI.',
  keywords: 'Redrob, Jugaad, micro-gig, freelance, students, India, AI marketplace',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" style={{ colorScheme: 'dark' }}>
      <body>
        <Navbar />
        <MascotGuide />
        <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg)' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
