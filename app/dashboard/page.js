'use client';

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div
      style={{
        backgroundColor: '#000000',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontFamily: 'var(--font-display), sans-serif',
        position: 'relative',
        margin: 0,
        padding: 0,
      }}
    >
      <Link
        href="/create"
        style={{
          position: 'absolute',
          top: '30px',
          left: '30px',
          color: '#38bdf8',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontFamily: 'sans-serif',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid rgba(56, 189, 248, 0.2)',
        }}
      >
        ← Back
      </Link>

      <h1
        style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: '#ffffff',
        }}
      >
        Dashboard
      </h1>
    </div>
  );
}
