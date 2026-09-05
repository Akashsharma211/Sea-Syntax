export default function SolutionSection() {
  const cards = [
    {
      title: 'Lorem Ipsum Dolor',
      desc: 'Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud.',
      tags: ['Lorem', 'Ipsum', 'Dolor'],
    },
    {
      title: 'Vessel Charter Algorithm',
      desc: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur vel illum qui dolorem eum.',
      tags: ['Neural Net', 'Random Matrix', 'Charter AI'],
    },
    {
      title: 'Bulk Cargo Analytics',
      desc: 'Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum sed ut perspiciatis.',
      tags: ['Predictive', 'Optimization', 'Overseas'],
    },
    {
      title: 'East Coast Terminal Feeds',
      desc: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores.',
      tags: ['Real-Time', 'Freight Index', 'Dispatch'],
    },
  ];

  return (
    <section className="solution-section" id="solution">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <span className="pulse-dot" />
            <span>Provided Solution</span>
          </div>
          <h2 className="section-title">
            Our Provided Solution: <span className="gradient-text">Intelligent Forecasting Engine</span>
          </h2>
          <p className="section-subtitle">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        <div className="solution-grid">
          {cards.map((c, i) => (
            <div className="solution-card" key={i}>
              <div className="solution-icon-wrap">
                <svg viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <div className="solution-tags">
                {c.tags.map((t, tIdx) => (
                  <span className="solution-tag-pill" key={tIdx}>
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
