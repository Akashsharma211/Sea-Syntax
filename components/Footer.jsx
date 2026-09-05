export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3 className="brand-font">MarineMetrics</h3>
            <p>
              Autonomous Ocean Intelligence and Coastal Defense platform designed to monitor maritime ecosystems, detect illegal fishing, and safeguard India&apos;s blue economy.
            </p>
            <div className="footer-team-callout">
              <span>
                Engineering Team: <strong>Sea &amp; Syntax</strong>
              </span>
            </div>
          </div>

          <div className="footer-col">
            <h4>Navigation</h4>
            <ul className="footer-links">
              <li><a href="#hero">Overview</a></li>
              <li><a href="#problem">Problem Statement</a></li>
              <li><a href="#solution">Provided Solution</a></li>
              <li><a href="#how-it-works">Architecture</a></li>
              <li><a href="#team">Team Members</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Hackathon Scope</h4>
            <ul className="footer-links">
              <li><a href="#hero">Smart India Hackathon</a></li>
              <li><a href="#problem">Ministry of Earth Sciences</a></li>
              <li><a href="#solution">Coastal Security</a></li>
              <li><a href="#solution">Blue Economy Mission</a></li>
              <li><a href="#team">Sea &amp; Syntax Lab</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>System Status</h4>
            <ul className="footer-links">
              <li><a href="#" style={{ color: 'var(--neon-emerald)' }}>● Sentinel Feeds: Nominal</a></li>
              <li><a href="#" style={{ color: 'var(--neon-emerald)' }}>● LoRaWAN Mesh: Online</a></li>
              <li><a href="#" style={{ color: 'var(--neon-cyan)' }}>● API Version: v2.4-SIH</a></li>
              <li><a href="#" style={{ color: 'var(--text-secondary)' }}>● Region: IN-EEZ Grid</a></li>
            </ul>
          </div>
        </div>

        {/* Dedicated Credit Bar */}
        <div className="footer-credit-bar">
          <div className="footer-credit-main">
            <span>Made with 💙 by team</span>
            <span className="team-highlight">Sea &amp; Syntax</span>
          </div>

          <div className="footer-sih-tag">
            <span>Smart India Hackathon • Project MarineMetrics &copy; 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
