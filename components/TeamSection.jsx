'use client';

import { useState } from 'react';

export default function TeamSection() {
  const members = [
    {
      name: 'Sumit Sharma',
      role: 'Team Lead & Freight Modeler',
      experience: 'AI & Predictive Analytics Lead',
      image: '/assets/team_sumit.jpg',
    },
    {
      name: 'Aarav Kapoor',
      role: 'Full-Stack System Architect',
      experience: 'Ocean Telemetry & Core Engineering',
      image: '/assets/team_aarav.jpg',
    },
    {
      name: 'Rohan Verma',
      role: 'Vessel Charter Algorithm Lead',
      experience: 'Bulk Cargo Data Pipeline',
      image: '/assets/team_rohan.jpg',
    },
    {
      name: 'Priya Nair',
      role: 'Terminal Feeds & UI/UX Design',
      experience: 'Maritime Geospatial Analytics',
      image: '/assets/team_priya.jpg',
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
    <section className="sme-section sme-team-section" id="team">
      <div className="container">
        {/* Tagline matching Screenshot 1 */}
        <div className="sme-team-tagline-wrap">
          <p className="sme-team-tagline">We work harder so maritime logistics navigates smarter.</p>
        </div>

        {/* Carousel Container */}
        <div className="sme-carousel-container">
          {/* Left Arrow Button */}
          <button
            type="button"
            className="sme-carousel-nav-btn prev"
            onClick={prevSlide}
            aria-label="Previous team member"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Carousel Track */}
          <div className="sme-carousel-track">
            {members.map((m, idx) => {
              // Calculate distance from startIndex for smooth responsive rendering
              return (
                <div className="sme-expert-card" key={idx}>
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
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            className="sme-carousel-nav-btn next"
            onClick={nextSlide}
            aria-label="Next team member"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Center Bottom Pill Button matching Screenshot 1 */}
        <div className="sme-team-cta-wrap">
          <a href="#footer" className="sme-btn-team-experts">
            Meet our team of experts
          </a>
        </div>
      </div>
    </section>
  );
}
