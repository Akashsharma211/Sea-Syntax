'use client';

import OceanCanvas from '@/components/OceanCanvas';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ProblemSection from '@/components/ProblemSection';
import SolutionSection from '@/components/SolutionSection';
import TeamSection from '@/components/TeamSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      {/* Background bioluminescent plankton & wave canvas */}
      <OceanCanvas />

      {/* Navigation Bar with single Start button */}
      <Navbar />

      <main>
        {/* Hero Section with single Start button */}
        <HeroSection />

        {/* Problem Statement */}
        <ProblemSection />

        {/* Provided Solution (lorem & random words) */}
        <SolutionSection />

        {/* Team (only names) */}
        <TeamSection />
      </main>

      {/* Footer (remains with Sea & Syntax credit) */}
      <Footer />
    </>
  );
}
