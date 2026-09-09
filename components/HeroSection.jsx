'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="sme-hero-section" id="hero">
      {/* Decorative Background Doodle Elements (SaveMyExams style) */}
      <div className="sme-doodle sme-doodle-top-left" aria-hidden="true">
        <svg viewBox="0 0 160 160" fill="none">
          <path
            d="M80 0C85 45 115 75 160 80C115 85 85 115 80 160C75 115 45 85 0 80C45 75 75 45 80 0Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="sme-doodle sme-doodle-top-right" aria-hidden="true">
        <svg viewBox="0 0 200 200" fill="none">
          <path
            d="M100 20C120 60 140 80 180 100C140 120 120 140 100 180C80 140 60 120 20 100C60 80 80 60 100 20Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="sme-doodle sme-doodle-mid-right" aria-hidden="true">
        <svg viewBox="0 0 180 180" fill="none">
          <path
            d="M90 10C105 50 130 75 170 90C130 105 105 130 90 170C75 130 50 105 10 90C50 75 75 50 90 10Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="sme-doodle sme-doodle-bottom-left" aria-hidden="true">
        <svg viewBox="0 0 150 150" fill="none">
          <circle cx="75" cy="75" r="50" stroke="currentColor" strokeWidth="8" strokeDasharray="12 12" />
        </svg>
      </div>

      <div className="container">
        <div className="sme-hero-center">
          {/* Trustpilot / SIH Verified Badge */}
          <div className="sme-trust-badge">
            <span className="sme-trust-label">Excellent</span>
            <div className="sme-trust-stars" aria-label="5 out of 5 stars">
              {[...Array(5)].map((_, i) => (
                <span className="sme-star-box" key={i}>
                  ★
                </span>
              ))}
            </div>
            <span className="sme-trust-brand">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--color-trust-green)" style={{ marginRight: 5 }}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              SIH 2026 Initiative
            </span>
          </div>

          {/* Hero Main Headline */}
          <h1 className="sme-hero-title">
            Development of an Intelligent Freight Forecasting Model for Optimized Vessel Chartering and Bulk Cargo Procurement
          </h1>

          {/* Subtitle with Purple Highlight Pill */}
          <p className="sme-hero-subtitle">
            Development of an Intelligent Freight Forecasting Model for Optimized Vessel Chartering and Bulk Cargo Procurement{' '}
            <span className="sme-highlight-pill">from overseas to East Coast of India</span>.
          </p>

          {/* Dual Action Buttons (Vibrant purple pill & dark pill) */}
          <div className="sme-hero-btn-group">
            <Link href="/create" className="sme-btn-primary-purple" id="startBtn">
              START
            </Link>
            <a href="#problem" className="sme-btn-secondary-dark">
              Explore Problem Statement
            </a>
          </div>

          {/* MarineMetrics Visual Telemetry Card */}
          <div className="sme-hero-media-wrapper">
            <div className="sme-media-card">
              <img
                src="/assets/hero_marine_telemetry.jpg"
                alt="MarineMetrics Platform"
                className="sme-hero-image"
                id="heroGraphic"
              />
              <div className="sme-media-badge-left">
                <span className="live-dot" />
                <span>East Coast Feeds • Live</span>
              </div>
              <div className="sme-media-badge-right">
                <span>Charter Optimization AI</span>
              </div>
            </div>
          </div>

          {/* Section Transition Heading with Hand-Drawn Squiggle Underline */}
          <div className="sme-explore-bridge">
            <h2 className="sme-explore-text">
              Explore all our{' '}
              <span className="sme-squiggle-target">
                resources
                <svg
                  className="sme-squiggle-svg"
                  viewBox="0 0 170 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M3 13C32.5 3 61.5 16 93.5 8C117.5 2 142.5 14 167 7"
                    stroke="#8b5cf6"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8 15C39 6.5 68 17 99 9C122 3 146 15 165 9"
                    stroke="#a855f7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                </svg>
              </span>
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
