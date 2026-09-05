'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="container">
        <Link href="/" className="brand-logo" id="brandLogo">
          <div className="brand-icon-wrap">
            <svg viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="brand-text-block">
            <span className="brand-name">MarineMetrics</span>
            <span className="brand-team-tag">by Team Sea &amp; Syntax</span>
          </div>
        </Link>

        <div className="nav-actions">
          <Link href="/create" className="nav-cta-btn" id="navLaunchBtn">
            Start
          </Link>
        </div>
      </div>
    </header>
  );
}
