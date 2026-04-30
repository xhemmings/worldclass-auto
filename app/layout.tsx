import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'WorldClass Auto | Professional Auto Service — Kingston, Jamaica',
  description:
    "Jamaica's premier auto service center. Book oil changes, brake service, engine diagnostics, tire alignment, and more online. Certified technicians. Same-day service.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-white text-gray-900 antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
