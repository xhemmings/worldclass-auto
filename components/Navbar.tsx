'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Services', href: '/#services' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const textColor = scrolled ? 'text-gray-700 hover:text-primary' : 'text-white/90 hover:text-white';
  const logoText = scrolled ? 'text-gray-900' : 'text-white';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-black text-sm">
            WC
          </span>
          <span className={`font-bold text-lg transition-colors ${logoText}`}>
            WorldClass Auto
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className={`font-medium text-sm transition-colors ${textColor}`}
            >
              {label}
            </a>
          ))}
          <a
            href="tel:+18761234567"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${textColor}`}
          >
            <Phone size={14} />
            (876) 123-4567
          </a>
          <Link
            href="/booking"
            className="bg-primary hover:bg-primary-dark text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
          >
            Book Now
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden p-1 transition-colors ${scrolled ? 'text-gray-700' : 'text-white'}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-5 space-y-4 shadow-lg">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="block text-gray-700 font-medium hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
          <a
            href="tel:+18761234567"
            className="flex items-center gap-2 text-gray-700 font-medium hover:text-primary"
          >
            <Phone size={15} />
            (876) 123-4567
          </a>
          <Link
            href="/booking"
            className="block bg-primary text-white text-center font-bold py-3 rounded-lg hover:bg-primary-dark transition-colors"
            onClick={() => setOpen(false)}
          >
            Book Now
          </Link>
        </div>
      )}
    </header>
  );
}
