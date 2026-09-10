'use client';

import { useState } from 'react';

export default function TeamSection() {
  const members = [
    {
      name: 'Nitika Rathi',
      role: 'Team Lead',
      experience: 'Solution Architecture',
      image: '/team/nitika.jpeg',
    },
    {
      name: 'Khushi Taliyan',
      role: 'Research',
      experience: 'AI Analytics',
      image: '/team/khushi.jpeg',
    },
    {
      name: 'Piyush Chopra',
      role: 'UI/UX',
      experience: 'Frontend Engineering',
      image: '/team/piyush.jpeg',
    },
    {
      name: 'Saanvi Satish',
      role: 'UI/UX Design',
      experience: 'Research',
      image: '/team/saanvi.jpeg',
    },
    {
      name: 'Yakshita Arora',
      role: 'Terminal Feeds',
      experience: 'UI/UX Design',
      image: '/team/yakshita.jpeg',
    },
    {
      name: 'Akash Kumar Sharma',
      role: 'AI Predictive Modeling',
      experience: 'Full Stack Arrangement',
      image: '/team/akash.jpg',
    },
  ];

  const [startIndex, setStartIndex] = useState(0);

  const prevSlide = () => {
    setStartIndex((prev) => (prev === 0 ? members.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setStartIndex((prev) => (prev === members.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="sme-section sme-team-section" id="team" style={{ backgroundColor: '#0f172a', padding: '5rem 0' }}>
      <div className="container">
        {/* Tagline matching Screenshot 1 */}
        <div className="sme-team-tagline-wrap">
          <p className="sme-team-tagline" style={{ color: '#cbd5e1' }}>We work harder so maritime logistics navigates smarter.</p>
        </div>

        {/* Meet our team Button (Moved to top) */}
        <div className="sme-team-cta-wrap" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="sme-btn-team-experts" style={{ display: 'inline-block', backgroundColor: '#311b5e', color: '#e9d5ff', padding: '1rem 2rem', borderRadius: '9999px', fontWeight: 'bold', fontSize: '1.25rem' }}>
            Meet our team of experts
          </span>
        </div>

        {/* Team Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', padding: '2rem 0' }}>
          {members.map((m, idx) => (
            <div className="sme-expert-card" key={idx} style={{ margin: '0' }}>
              {/* Portrait Image Container */}
              <div className="sme-expert-photo-wrap">
                <img
                  src={m.image}
                  alt={m.name}
                  className="sme-expert-photo"
                  loading="lazy"
                />
              </div>

              {/* Expert Name */}
              <h3 className="sme-expert-name">{m.name}</h3>

              {/* Checkmark Bullets (Purple Circle with White Checkmark) */}
              <div className="sme-expert-meta">
                <div className="sme-expert-bullet">
                  <span className="sme-bullet-check">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="sme-bullet-text">{m.role}</span>
                </div>

                <div className="sme-expert-bullet">
                  <span className="sme-bullet-check">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="sme-bullet-text">{m.experience}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
