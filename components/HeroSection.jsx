'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="sme-hero-section relative overflow-hidden" id="hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
      >
        <source src="/webmcargo.webm" type="video/webm" />
      </video>

      {/* Dark overlay for better text readability */}
      <div
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1 }}
      ></div>

      <div style={{ position: 'relative', zIndex: 2, width: '100%', paddingLeft: '8%', display: 'flex', justifyContent: 'flex-start', marginTop: '-12vh' }}>
        <div style={{ maxWidth: '900px', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

          {/* Top Tagline with Line */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', justifyContent: 'flex-start' }}>
            <div style={{ width: '60px', height: '1px', backgroundColor: '#fff', marginRight: '20px' }}></div>
            <span style={{ color: '#fff', letterSpacing: '0.3em', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>
              SIH 2026 Initiative
            </span>
          </div>

          {/* Huge Typography Title */}
          <div style={{
            fontSize: 'clamp(5rem, 16vw, 13rem)',
            lineHeight: '0.9',
            fontWeight: '900',
            color: '#fff',
            textTransform: 'uppercase',
            margin: '0 0 2rem 0',
            fontFamily: 'Impact, "Arial Black", "Montserrat", sans-serif',
            textAlign: 'left'
          }}>
            <div style={{ letterSpacing: '0.12em' }}>MARINE</div>
            <div style={{ letterSpacing: '0.02em' }}>METRICS</div>
          </div>

          {/* Subtitle / Description Paragraph */}
          <p style={{
            fontSize: '1.25rem',
            lineHeight: '1.6',
            color: '#fff',
            fontWeight: '500',
            maxWidth: '650px',
            marginBottom: '3.5rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            textAlign: 'left'
          }}>
            An advanced ocean data intelligence platform. Optimizing vessel chartering and bulk cargo procurement to navigate the challenges of global maritime logistics.
          </p>

          {/* Solid White Button with Arrow */}
          <div style={{ textAlign: 'left' }}>
            <Link href="/create" style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#fff',
              color: '#000',
              padding: '1.2rem 3rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              textDecoration: 'none',
              fontSize: '0.95rem'
            }}>
              START NOW
              <svg style={{ marginLeft: '12px', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
