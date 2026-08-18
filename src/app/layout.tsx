import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Airport Modernization Intelligence Agent',
  description:
    'Executive AI advisor for airport infrastructure investment, capacity congestion scoring, and real-time aviation telemetry.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090e1a] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
