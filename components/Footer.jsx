'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="sme-footer" id="footer">
      <div className="container">
        <div className="sme-footer-grid">
          {/* Brand Column */}
          <div className="sme-footer-brand">
            <div className="sme-footer-logo-row">
              <div className="sme-brand-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                    fill="url(#footGrad)"
                  />
                  <defs>
                    <linearGradient id="footGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h3 className="sme-footer-brand-title">MarineMetrics</h3>
            </div>
            <p className="sme-footer-desc">
              Autonomous Ocean Intelligence and Coastal Defense platform designed to monitor maritime ecosystems, detect illegal fishing, and safeguard India&apos;s blue economy.
            </p>
            <div className="sme-footer-team-callout">
              <span>
                Engineering Team: <strong>Sea &amp; Syntax</strong>
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="sme-footer-col">
            <h4>Navigation</h4>
            <ul className="sme-footer-links">
              <li><a href="#hero">Overview</a></li>
              <li><a href="#problem">Problem Statement</a></li>
              <li><a href="#solution">Provided Solution</a></li>
              <li><a href="#team">Team Members</a></li>
              <li><Link href="/create">Launch Platform</Link></li>
            </ul>
          </div>

          {/* Hackathon Scope */}
          <div className="sme-footer-col">
            <h4>Hackathon Scope</h4>
            <ul className="sme-footer-links">
              <li><a href="#hero">Smart India Hackathon</a></li>
              <li><a href="#problem">Ministry of Earth Sciences</a></li>
              <li><a href="#solution">Coastal Security</a></li>
              <li><a href="#solution">Blue Economy Mission</a></li>
              <li><a href="#team">Sea &amp; Syntax Lab</a></li>
            </ul>
          </div>

          {/* System Status */}
          <div className="sme-footer-col">
            <h4>System Status</h4>
            <ul className="sme-footer-links">
              <li>
                <span className="status-indicator online" />
                <span style={{ color: '#00b67a' }}>Sentinel Feeds: Nominal</span>
              </li>
              <li>
                <span className="status-indicator online" />
                <span style={{ color: '#00b67a' }}>LoRaWAN Mesh: Online</span>
              </li>
              <li>
                <span className="status-indicator cyan" />
                <span style={{ color: '#38bdf8' }}>API Version: v2.4-SIH</span>
              </li>
              <li>
                <span className="status-indicator muted" />
                <span style={{ color: '#94a3b8' }}>Region: IN-EEZ East Coast</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Dedicated Credit Bar */}
        <div className="sme-footer-credit-bar">
          <div className="sme-credit-main">
            <span>Made with 💜 by team</span>
            <span className="sme-credit-pill">Sea &amp; Syntax</span>
          </div>

          <div className="sme-credit-sih">
            <span>Smart India Hackathon • Project MarineMetrics &copy; 2026</span>
          </div>
        </div>
      </div>

      {/* Floating Bottom Right Settings/Theme Button matching Screenshot 2 */}
      <div className="sme-floating-toggle" title="Theme & Settings">
        <button type="button" className="sme-floating-btn" aria-label="Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </button>
      </div>
    </footer>
  );
}
