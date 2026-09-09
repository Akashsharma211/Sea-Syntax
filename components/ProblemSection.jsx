'use client';

export default function ProblemSection() {
  return (
    <section className="sme-section sme-problem-section" id="problem">
      <div className="container">
        {/* Section Header */}
        <div className="sme-section-header">
          <div className="sme-badge-pill purple">
            <span className="pulse-indicator" />
            <span>Problem Statement</span>
          </div>

          <h2 className="sme-section-title">
            &quot;Development of an Intelligent Freight Forecasting Model for Optimized Vessel Chartering and Bulk Cargo Procurement from overseas to East Coast of India&quot;
          </h2>

          <p className="sme-section-subtitle">
            Navigating volatile global maritime freight indices, erratic spot charter rates, and delayed overseas supply chains heading toward India&apos;s strategic East Coast ports.
          </p>
        </div>

        {/* Feature Cards Breakdown matching SaveMyExams Card Style */}
        <div className="sme-problem-cards-grid">
          <div className="sme-feature-card">
            <div className="sme-card-header-row">
              <div className="sme-card-icon-box purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="sme-card-status">Volatile Indices</span>
            </div>
            <h3 className="sme-card-heading">Erratic Spot Charter Rates</h3>
            <p className="sme-card-desc">
              Fluctuating Baltic Dry Index (BDI) and Supramax charter dynamics cause multi-million dollar procurement variances for inbound Indian industrial bulk imports.
            </p>
            <div className="sme-check-list">
              <div className="sme-check-item">
                <span className="sme-check-circle">✓</span>
                <span>Unpredictable spot charter spikes</span>
              </div>
              <div className="sme-check-item">
                <span className="sme-check-circle">✓</span>
                <span>Overseas lead time uncertainty</span>
              </div>
            </div>
          </div>

          <div className="sme-feature-card">
            <div className="sme-card-header-row">
              <div className="sme-card-icon-box cyan">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="sme-card-status">Port Congestion</span>
            </div>
            <h3 className="sme-card-heading">East Coast Port Bottlenecks</h3>
            <p className="sme-card-desc">
              Visakhapatnam, Paradip, Haldia, and Chennai experience berth scheduling clashes and demurrage penalties due to lack of predictive forward intelligence.
            </p>
            <div className="sme-check-list">
              <div className="sme-check-item">
                <span className="sme-check-circle">✓</span>
                <span>Demurrage penalty reduction</span>
              </div>
              <div className="sme-check-item">
                <span className="sme-check-circle">✓</span>
                <span>Berth window synchronization</span>
              </div>
            </div>
          </div>

          <div className="sme-feature-card">
            <div className="sme-card-header-row">
              <div className="sme-card-icon-box emerald">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="sme-card-status">Bulk Procurement</span>
            </div>
            <h3 className="sme-card-heading">Sub-Optimal Vessel Allocation</h3>
            <p className="sme-card-desc">
              Manual procurement decisions lead to mismatched deadweight tonnage (DWT), higher bunker fuel consumption, and delayed commodity turnaround.
            </p>
            <div className="sme-check-list">
              <div className="sme-check-item">
                <span className="sme-check-circle">✓</span>
                <span>Optimal vessel deadweight matching</span>
              </div>
              <div className="sme-check-item">
                <span className="sme-check-circle">✓</span>
                <span>AI-driven charter timing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
