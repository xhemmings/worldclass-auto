import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const SERVICES = [
  'General Servicing',
  'Wheel Alignment',
  'Engine Diagnostics',
  'Parts & Installation',
  'Body Work',
  'Spray & Paint',
];

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/#services' },
  { label: 'About Us', href: '/#about' },
  { label: 'Book a Service', href: '/booking' },
  { label: 'Contact', href: '/#contact' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-black text-sm">
              WC
            </span>
            <span className="font-bold text-white text-lg">WorldClass Auto</span>
          </div>
          <p className="text-sm leading-relaxed">
            Jamaica's premier auto service center. Certified technicians, transparent pricing, and guaranteed results.
          </p>
          <div className="flex gap-4 mt-5">
            {[
              { Icon: Facebook, href: '#' },
              { Icon: Instagram, href: '#' },
              { Icon: Twitter, href: '#' },
            ].map(({ Icon, href }, i) => (
              <a key={i} href={href} className="hover:text-white transition-colors">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            {QUICK_LINKS.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Our Services</h4>
          <ul className="space-y-2.5 text-sm">
            {SERVICES.map((s) => (
              <li key={s}>
                <Link href="/booking" className="hover:text-white transition-colors">
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin size={15} className="text-primary mt-0.5 shrink-0" />
              <span>123 Auto Drive, Kingston, Jamaica</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={15} className="text-primary shrink-0" />
              <a href="tel:+18764629709" className="hover:text-white transition-colors">
                (876) 462-9709
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={15} className="text-primary shrink-0" />
              <a href="mailto:worldclassautorepairs1@gmail.com" className="hover:text-white transition-colors break-all">
                worldclassautorepairs1@gmail.com
              </a>
            </li>
          </ul>
          <div className="mt-5 text-sm">
            <p className="text-white font-semibold mb-2">Business Hours</p>
            <p>Mon – Fri: 8:00 AM – 6:00 PM</p>
            <p>Saturday: 8:00 AM – 4:00 PM</p>
            <p className="text-gray-600">Sunday: Closed</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 px-6 py-5 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} WorldClass Auto Service Ltd. All rights reserved. | Kingston, Jamaica
      </div>
    </footer>
  );
}
