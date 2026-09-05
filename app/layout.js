import './globals.css';

export const metadata = {
  title: 'MarineMetrics | Autonomous Ocean Intelligence & Telemetry Platform',
  description:
    'MarineMetrics - AI & IoT-powered ocean health intelligence, real-time coastal telemetry, illegal fishing prevention, and microplastic tracking. Created by Team Sea & Syntax for Smart India Hackathon.',
  keywords: [
    'MarineMetrics',
    'Sea & Syntax',
    'SIH',
    'Ocean Telemetry',
    'Marine AI',
    'Coastal Monitoring',
    'Smart India Hackathon',
  ],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23050c18' stroke='%2300f0ff' stroke-width='6'/><path d='M25 55 Q 38 35, 50 55 T 75 55' fill='none' stroke='%2300ffaa' stroke-width='7' stroke-linecap='round'/></svg>",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
