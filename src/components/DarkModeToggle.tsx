'use client';
import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const isLight = saved === 'light';
    setLight(isLight);
    document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.setAttribute('data-theme', next ? 'light' : 'dark');
    localStorage.setItem('theme', next ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggle}
      title={light ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      style={{
        width: 34, height: 34, borderRadius: 7,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s', fontSize: 15, flexShrink: 0,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
    >
      {light ? '🌙' : '☀️'}
    </button>
  );
}
