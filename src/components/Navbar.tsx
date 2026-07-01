'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const ROLES = [
  { id: 'b1', label: 'Rahul Sharma (Business)', href: '/business' },
  { id: 'b2', label: 'Priya Iyer (Business)', href: '/business' },
  { id: 's1', label: 'Arjun Mehta (Dev)', href: '/student/s1' },
  { id: 's2', label: 'Sanya Kapoor (Design)', href: '/student/s2' },
  { id: 's3', label: 'Rohan Verma (Dev)', href: '/student/s3' },
  { id: 's4', label: 'Divya Nair (Content)', href: '/student/s4' },
  { id: 's5', label: 'Karan Singh (Marketing)', href: '/student/s5' },
  { id: 's6', label: 'Neha Patel (Design)', href: '/student/s6' },
  { id: 's7', label: 'Aditya Kumar (Content)', href: '/student/s7' },
  { id: 's8', label: 'Ishita Rao (Marketing)', href: '/student/s8' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showSwitcher, setShowSwitcher] = useState(false);

  // Hide entirely inside embed iframes
  if (pathname.startsWith('/embed')) return null;

  const isLanding = pathname === '/';

  return (
    <nav style={{
      background: 'rgba(8,8,8,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Logo — rJ monogram */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 0, textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* r — white on black */}
          <div style={{
            background: '#000', border: '1px solid #333',
            borderRadius: '6px 0 0 6px',
            padding: '4px 9px',
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 17, fontWeight: 800,
            color: '#fff', letterSpacing: '-0.03em',
            lineHeight: 1.3,
          }}>r</div>
          {/* J — black on green */}
          <div style={{
            background: 'var(--green)',
            borderRadius: '0 6px 6px 0',
            padding: '4px 9px',
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 17, fontWeight: 800,
            color: '#000', letterSpacing: '-0.03em',
            lineHeight: 1.3,
          }}>J</div>
        </div>
      </Link>

      {/* Nav links */}
      {!isLanding && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <NavLink href="/how-it-works" label="How It Works" pathname={pathname} />
          <NavLink href="/leaderboard" label="Leaderboard" pathname={pathname} />
        </div>
      )}

      {/* Role switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowSwitcher(!showSwitcher)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 16px',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.45)',
            borderRadius: 8,
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
        >
          <span>Demo: Switch Role</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
            <path d="M3 5l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          </svg>
        </button>

        {showSwitcher && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: 220,
            overflow: 'hidden',
            animation: 'fadeUp 0.15s ease both',
            zIndex: 100,
          }}>
            <div style={{ padding: '8px 14px 6px', fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Business Owners
            </div>
            {ROLES.filter(r => r.id.startsWith('b')).map(role => (
              <button key={role.id} onClick={() => {
                setShowSwitcher(false);
                router.push(role.href);
              }} style={dropdownItemStyle}>
                {role.label}
              </button>
            ))}
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <div style={{ padding: '6px 14px', fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Students
            </div>
            {ROLES.filter(r => r.id.startsWith('s')).map(role => (
              <button key={role.id} onClick={() => {
                setShowSwitcher(false);
                router.push(role.href);
              }} style={dropdownItemStyle}>
                {role.label}
              </button>
            ))}
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <button onClick={() => { setShowSwitcher(false); router.push('/'); }} style={{ ...dropdownItemStyle, color: 'var(--purple)', fontWeight: 600 }}>
              ← Back to Landing
            </button>
          </div>
        )}
        </div>
      </div>
    </nav>
  );
}

const dropdownItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '9px 16px',
  background: 'transparent',
  border: 'none',
  textAlign: 'left',
  fontSize: 13,
  color: 'var(--ink)',
  cursor: 'pointer',
  fontFamily: "'Inter', sans-serif",
  transition: 'background 0.1s',
};

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = pathname.startsWith(href);
  return (
    <Link href={href} style={{
      padding: '6px 14px',
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 500,
      color: active ? 'white' : 'rgba(255,255,255,0.7)',
      background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
      textDecoration: 'none',
      transition: 'all 0.15s',
      fontFamily: "'Inter', sans-serif",
    }}>
      {label}
    </Link>
  );
}
