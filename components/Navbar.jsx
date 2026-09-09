'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('charter');
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sme-navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="sme-nav-inner">
        {/* Brand */}
        <Link href="/" className="sme-brand" id="brandLogo">
          <div className="sme-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
                fill="url(#brandGrad)"
              />
              <defs>
                <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="sme-brand-text">
            <span className="sme-brand-title">MarineMetrics</span>
            <span className="sme-brand-subtitle">For East Coast Charterers</span>
          </div>
        </Link>

        {/* Role / Mode Switcher Pill */}
        <div className="sme-pill-switch" role="tablist">
          <button
            type="button"
            className={`sme-pill-btn ${activeTab === 'ports' ? 'active' : ''}`}
            onClick={() => setActiveTab('ports')}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style={{ marginRight: 6 }}>
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Port Authority
          </button>
          <button
            type="button"
            className={`sme-pill-btn ${activeTab === 'charter' ? 'active' : ''}`}
            onClick={() => setActiveTab('charter')}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style={{ marginRight: 6 }}>
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            Vessel Charterer
            <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style={{ marginLeft: 4, opacity: 0.8 }}>
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Resources Dropdown */}
        <div className="sme-dropdown-wrap">
          <button
            type="button"
            className="sme-nav-link sme-dropdown-trigger"
            onClick={() => setResourcesOpen(!resourcesOpen)}
            aria-expanded={resourcesOpen}
          >
            <span>Resources</span>
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" className={resourcesOpen ? 'rotate-180' : ''}>
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {resourcesOpen && (
            <div className="sme-dropdown-menu" onClick={() => setResourcesOpen(false)}>
              <a href="#problem" className="sme-dropdown-item">
                <span className="dot purple" /> Problem Statement
              </a>
              <a href="#solution" className="sme-dropdown-item">
                <span className="dot cyan" /> Provided Solution
              </a>
              <a href="#team" className="sme-dropdown-item">
                <span className="dot emerald" /> Team Sea &amp; Syntax
              </a>
              <Link href="/create" className="sme-dropdown-item">
                <span className="dot violet" /> Interactive Simulation Engine
              </Link>
            </div>
          )}
        </div>

        {/* Search Bar Pill */}
        <div className="sme-search-pill">
          <input
            type="text"
            placeholder="Search freight index, vessel, port..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sme-search-input"
          />
          <button type="button" className="sme-search-icon-btn" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        {/* Right CTA Area */}
        <div className="sme-nav-right">
          <a href="#problem" className="sme-nav-link-subtle">
            Overview
          </a>
          <Link href="/create" className="sme-btn-purple-pill" id="navLaunchBtn">
            Start
          </Link>
        </div>
      </div>
    </header>
  );
}
