'use client';

export default function SolutionSection() {
  const cards = [
    {
      title: 'a. Optimal Market Entry Timing',
      desc: 'Predictive 90-day freight curve identifying lowest-cost windows to execute spot or time-charter contracts, mitigating Baltic Dry Index spot spikes.',
      tags: ['Forward Curve', 'Rate Forecast', 'Laycan Timing'],
      accent: 'purple',
    },
    {
      title: 'b. Vessel Type & Port Optimization',
      desc: 'Intelligent matching of cargo volume to Handysize, Supramax, Panamax, or Capesize carriers while enforcing permissible draft, LOA, and berth turnaround across India’s East Coast.',
      tags: ['Draft Clearance', 'LOA Envelope', 'Deadweight Sizing'],
      accent: 'cyan',
    },
    {
      title: 'c. Idle Scenario & Backhaul Management',
      desc: 'Forecasts low-demand periods and proposes triangular repositioning routes (e.g. Vizag/Paradip iron ore pellet exports) to eliminate costly ballast deadheading.',
      tags: ['Ballast Reduction', 'Triangular Voyages', 'Bunker Savings'],
      accent: 'emerald',
    },
    {
      title: 'd. Risk Mitigation & Early Warnings',
      desc: 'Real-time anchorage waiting alerts, port congestion indices, Bay of Bengal cyclone season vulnerability scoring, and demurrage exposure calculators.',
      tags: ['Congestion Index', 'Demurrage Alarms', 'Weather Risk'],
      accent: 'violet',
    },
  ];

  return (
    <section className="sme-section sme-solution-section" id="solution">
      <div className="container">
        <div className="sme-section-header">
          <div className="sme-badge-pill cyan">
            <span className="pulse-indicator" />
            <span>Provided Solution</span>
          </div>

          <h2 className="sme-section-title">
            Intelligent Maritime Engine:{' '}
            <span className="sme-gradient-title">Predictive Chartering & Procurement</span>
          </h2>

          <p className="sme-section-subtitle">
            Transitioning bulk commodity importers from reactive, day-to-day spot charters to a proactive, data-driven strategy tailored for India&apos;s East Coast ports.
          </p>
        </div>

        <div className="sme-solution-grid">
          {cards.map((c, i) => (
            <div className={`sme-card sme-solution-card sme-accent-${c.accent}`} key={i}>
              <div className="sme-solution-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>

              <h3 className="sme-solution-card-title">{c.title}</h3>
              <p className="sme-solution-card-desc">{c.desc}</p>

              <div className="sme-solution-tags">
                {c.tags.map((t, tIdx) => (
                  <span className="sme-tag-pill" key={tIdx}>
                    <span className="sme-check-dot">✓</span>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
