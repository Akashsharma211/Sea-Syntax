'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="sme-footer" id="footer" style={{ backgroundColor: '#0f172a' }}>
      <div className="container">
        <div className="sme-footer-grid">
          {/* Brand Column */}
          <div className="sme-footer-brand">
            <div className="sme-footer-logo-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="sme-brand-icon" style={{ width: '40px', height: '40px', overflow: 'hidden', borderRadius: '50%' }}>
                <img src="/seaandsyntaxlogo.png" alt="Sea & Syntax" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h3 className="sme-footer-brand-title" style={{ color: '#fff', margin: 0 }}>MarineMetrics</h3>
            </div>
            <p className="sme-footer-desc" style={{ color: '#cbd5e1' }}>
              Autonomous Ocean Intelligence and Coastal Defense platform designed to monitor maritime ecosystems, detect illegal fishing, and safeguard India&apos;s blue economy.
            </p>
            <div className="sme-footer-team-callout" style={{ color: '#94a3b8' }}>
              <span>
                Engineering Team: <strong>Sea &amp; Syntax</strong>
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="sme-footer-col">
            <h4 style={{ color: '#fff' }}>Navigation</h4>
            <ul className="sme-footer-links">
              <li><a href="#hero" style={{ color: '#cbd5e1' }}>Overview</a></li>
              <li><a href="#problem" style={{ color: '#cbd5e1' }}>Problem Statement</a></li>
              <li><a href="#solution" style={{ color: '#cbd5e1' }}>Provided Solution</a></li>
              <li><a href="#team" style={{ color: '#cbd5e1' }}>Team Members</a></li>
              <li><Link href="/create" style={{ color: '#cbd5e1' }}>Launch Platform</Link></li>
            </ul>
          </div>

          {/* Hackathon Scope */}
          <div className="sme-footer-col">
            <h4 style={{ color: '#fff' }}>Hackathon Scope</h4>
            <ul className="sme-footer-links">
              <li><a href="#hero" style={{ color: '#cbd5e1' }}>Smart India Hackathon</a></li>
              <li><a href="#problem" style={{ color: '#cbd5e1' }}>Ministry of Earth Sciences</a></li>
              <li><a href="#solution" style={{ color: '#cbd5e1' }}>Coastal Security</a></li>
              <li><a href="#solution" style={{ color: '#cbd5e1' }}>Blue Economy Mission</a></li>
              <li><a href="#team" style={{ color: '#cbd5e1' }}>Sea &amp; Syntax Lab</a></li>
            </ul>
          </div>

          {/* System Status */}
          <div className="sme-footer-col">
            <h4 style={{ color: '#fff' }}>System Status</h4>
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

        {/* Massive THANK YOU */}
        <div style={{ marginTop: '5rem', marginBottom: '2rem', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          <h1 style={{
            fontSize: 'clamp(4rem, 15vw, 20rem)',
            fontWeight: '900',
            fontFamily: 'Impact, "Arial Black", sans-serif',
            margin: 0,
            lineHeight: 1,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: '#e9d5ff',
            textAlign: 'center'
          }}>
            THANK YOU
          </h1>
        </div>

        {/* Copyright */}
        <div className="sme-footer-credit-bar" style={{ borderTop: '1px solid #334155', paddingTop: '1.5rem', justifyContent: 'center' }}>
          <div className="sme-credit-sih" style={{ color: '#94a3b8' }}>
            <span>Smart India Hackathon • Project MarineMetrics &copy; 2026</span>
          </div>
        </div>
      </div>

      {/* Floating Steady Logo */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
        <img 
          src="/seaandsyntaxlogo.png" 
          alt="Sea & Syntax Logo" 
          style={{ width: '80px', height: 'auto', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} 
        />
      </div>
    </footer>
  );
}
