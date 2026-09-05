import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="hero-section" id="hero">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-content">
            <div className="hero-sih-pill">
              <span className="glow-tag">SIH INITIATIVE</span>
              <span>Maritime Intelligence &amp; Bulk Cargo Freight Optimization</span>
            </div>

            <h1 className="hero-title">
              MarineMetrics <br />
              <span className="gradient-text">Intelligent Maritime Platform</span>
            </h1>

            <p className="hero-desc">
              Development of an Intelligent Freight Forecasting Model for Optimized Vessel Chartering and Bulk Cargo Procurement from overseas to East Coast of India.
            </p>

            {/* SINGLE START BUTTON */}
            <div className="hero-cta-group">
              <Link
                href="/create"
                className="btn-start-hero"
                id="startBtn"
                style={{ textDecoration: 'none' }}
              >
                <span className="icon-sonar">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="none" />
                    <polygon points="10 8 16 12 10 16 10 8" fill="#020813" />
                  </svg>
                </span>
                <span>START</span>
              </Link>
            </div>
          </div>

          {/* Hero Visual Showcase */}
          <div className="hero-visual-card">
            <img
              src="/assets/hero_marine_telemetry.jpg"
              alt="MarineMetrics Platform"
              className="hero-img"
              id="heroGraphic"
            />
            <div className="hero-card-overlay" />
          </div>
        </div>
      </div>
    </section>
  );
}
