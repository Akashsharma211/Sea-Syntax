'use client';

export default function SolutionSection() {
  const cards = [
    {
      title: 'Predictive & Proactive',
      desc: 'Forecasts freight rates and market conditions before chartering decisions. AI-powered freight forecasting predicts future rates and market trends for smarter decisions.',
      tags: ['Freight Forecasting', 'Market Trends'],
      accent: 'purple',
    },
    {
      title: 'AI-Powered Optimization',
      desc: 'Integrates vessels, routes, costs, ports, and charter timing for better decisions. Recommends the best vessel and route based on cost, cargo needs, fuel, weather, and congestion.',
      tags: ['Vessel Optimization', 'Route Planning'],
      accent: 'cyan',
    },
    {
      title: 'Dynamic & Risk-Aware',
      desc: 'Adapts to market changes, vessel availability, congestion, and potential delays. Smart charter planning identifies the optimal timing for short- and medium-term vessel contracts.',
      tags: ['Smart Chartering', 'Risk Mitigation'],
      accent: 'emerald',
    },
    {
      title: 'Cost & Efficiency Focused',
      desc: 'Reduces costs while improving vessel utilization and overall supply-chain efficiency. Predictive procurement reduces freight costs, vessel idle time, and delays.',
      tags: ['Predictive Procurement', 'Supply Chain Efficiency'],
      accent: 'violet',
    },
  ];

  return (
    <section className="sme-section sme-solution-section" id="solution" style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: '5rem 0' }}>
      <div className="container">
        <div className="sme-section-header">
          <div className="sme-badge-pill cyan" style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}>
            <span className="pulse-indicator" style={{ backgroundColor: '#38bdf8' }} />
            <span>Provided Solution</span>
          </div>

          <h2 className="sme-section-title" style={{ color: '#fff', fontSize: '3rem', lineHeight: '1.2', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            Marine Metrics: <span className="sme-gradient-title">An intelligent, data-driven Freight Forecasting Model</span>
          </h2>

          <p className="sme-section-subtitle" style={{ color: '#cbd5e1', fontSize: '1.25rem', lineHeight: '1.7' }}>
            Innovation & Uniqueness in predictive chartering, optimizing the entire maritime supply chain.
          </p>
        </div>

        <div className="sme-solution-grid">
          {cards.map((c, i) => (
            <div className={`sme-card sme-solution-card sme-accent-${c.accent}`} key={i} style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
              <div className="sme-solution-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>

              <h3 className="sme-solution-card-title" style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>{c.title}</h3>
              <p className="sme-solution-card-desc" style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6' }}>{c.desc}</p>

              <div className="sme-solution-tags">
                {c.tags.map((t, tIdx) => (
                  <span className="sme-tag-pill" key={tIdx} style={{ backgroundColor: '#334155', color: '#cbd5e1' }}>
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
