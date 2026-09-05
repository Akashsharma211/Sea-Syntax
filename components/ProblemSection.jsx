export default function ProblemSection() {
  return (
    <section className="problem-section" id="problem">
      <div className="container">
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-tag">
            <span
              className="pulse-dot"
              style={{
                background: 'var(--neon-alert)',
                boxShadow: '0 0 8px var(--neon-alert)',
              }}
            />
            <span>Problem Statement</span>
          </div>
          <h2 className="section-title">
            &quot;Development of an Intelligent Freight Forecasting Model for Optimized Vessel Chartering and Bulk Cargo Procurement from overseas to East Coast of India&quot;
          </h2>
          <p className="section-subtitle">
            Navigating volatile global maritime freight indices, erratic spot charter rates, and delayed overseas supply chains heading toward India&apos;s strategic East Coast ports.
          </p>
        </div>
      </div>
    </section>
  );
}
