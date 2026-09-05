export default function TeamSection() {
  const members = [
    { name: 'Sumit Sharma', initials: 'SS' },
    { name: 'Aarav Kapoor', initials: 'AK' },
    { name: 'Rohan Verma', initials: 'RV' },
    { name: 'Priya Nair', initials: 'PN' },
  ];

  return (
    <section className="team-section" id="team">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <span className="pulse-dot" />
            <span>Team Sea &amp; Syntax</span>
          </div>
          <h2 className="section-title">
            Team <span className="gradient-text">Sea &amp; Syntax</span>
          </h2>
        </div>

        <div className="team-grid">
          {members.map((m, idx) => (
            <div className="team-card" key={idx}>
              <div className="team-avatar-wrap">
                <div className="team-avatar">{m.initials}</div>
              </div>
              <h3 className="team-name" style={{ margin: 0 }}>
                {m.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
