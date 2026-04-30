import Link from 'next/link';
import {
  Wrench, Disc, Gauge, Package, Hammer, Palette,
  CheckCircle, Star, ArrowRight, Clock, Award, Users, ThumbsUp,
} from 'lucide-react';

const SERVICES = [
  {
    icon: Wrench,
    title: 'General Servicing',
    desc: 'Core maintenance, oil changes, fluid top-ups, parts installation, and all routine service work handled by certified technicians.',
  },
  {
    icon: Disc,
    title: 'Wheel Alignment',
    desc: 'High-volume computer-controlled alignment. Fast 30-minute jobs — approximately 22 alignments completed per day.',
  },
  {
    icon: Gauge,
    title: 'Engine Diagnostics',
    desc: 'Advanced OBD-II scanning, check engine light analysis, and full engine performance assessment by certified technicians.',
  },
  {
    icon: Package,
    title: 'Parts & Installation',
    desc: 'Genuine and premium aftermarket parts sourced and fitted same day. Our sales agent ensures the right part at the right price.',
  },
  {
    icon: Hammer,
    title: 'Body Work',
    desc: 'Structural and heavy-repair body work handled in our dedicated bays. From panel repairs to full collision restoration.',
  },
  {
    icon: Palette,
    title: 'Spray & Paint',
    desc: 'Professional cosmetic paint work and full respray services. Factory-matched finishes with lasting durability.',
  },
];

const STATS = [
  { value: '15+', label: 'Years in Business' },
  { value: '50K+', label: 'Cars Serviced' },
  { value: '24/7', label: 'Customer Support' },
  { value: '100%', label: 'Certified Technicians' },
];

const WHY_US = [
  { icon: Award, title: 'Certified Shop', desc: 'JBS-certified facility meeting international workshop standards.' },
  { icon: Clock, title: 'Fast Turnaround', desc: 'Most services completed same day — no long waits.' },
  { icon: Users, title: 'Expert Team', desc: '25+ manufacturer-certified technicians on staff.' },
  { icon: ThumbsUp, title: '5-Star Rated', desc: '4.9 / 5 from over 2,400 verified customer reviews.' },
];

const STEPS = [
  {
    n: '01',
    title: 'Book Online',
    desc: 'Choose your service, pick a date, and submit your booking in under 60 seconds.',
  },
  {
    n: '02',
    title: 'Drop Off Your Vehicle',
    desc: 'Arrive at your scheduled time. Our team will receive you promptly and begin work.',
  },
  {
    n: '03',
    title: 'Pick Up & Drive',
    desc: 'We notify you when it\'s ready. Collect your fully serviced vehicle with confidence.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Marcus T.',
    role: 'Regular Customer',
    quote:
      'WorldClass Auto is exactly what the name promises. My car is always returned cleaner than I brought it in, and their diagnostics are spot on every single time.',
  },
  {
    name: 'Simone B.',
    role: 'Fleet Manager, JPS',
    quote:
      'We trust WorldClass with our entire company fleet. Reliable, transparent pricing, and they always meet the agreed turnaround time. No surprises.',
  },
  {
    name: 'Andre W.',
    role: 'First-Time Customer',
    quote:
      'Came in for a check engine light that stumped two other shops. WorldClass diagnosed and fixed it the same day. I\'m a customer for life now.',
  },
];

export default function HomePage() {
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gray-950">
        {/* layered background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#7f1d1d_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#1c1917_0%,_transparent_70%)]" />
        {/* decorative diagonal stripe */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-primary/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-7 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Jamaica&apos;s #1 Auto Service Center
            </span>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
              Professional<br />
              Auto Service<br />
              <span className="text-primary">You Can Trust.</span>
            </h1>

            <p className="text-gray-300 text-lg sm:text-xl mt-6 leading-relaxed max-w-lg">
              Certified technicians. Transparent pricing. Same-day service on most repairs.
              Book your appointment in 60 seconds.
            </p>
          </div>

          {/* Booking widget */}
          <form
            action="/booking"
            method="GET"
            className="mt-10 bg-white rounded-2xl shadow-2xl p-5 sm:p-6 max-w-2xl"
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Schedule Your Service
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                name="service"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="">Select a Service</option>
                <option value="servicing">General Servicing</option>
                <option value="alignment">Wheel Alignment</option>
                <option value="diagnostics">Engine Diagnostics</option>
                <option value="parts">Parts &amp; Installation</option>
                <option value="bodywork">Body Work</option>
                <option value="spray">Spray &amp; Paint</option>
              </select>
              <input
                type="date"
                name="date"
                min={today}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white font-bold px-7 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap text-sm"
              >
                Book Now <ArrowRight size={15} />
              </button>
            </div>
            <div className="flex flex-wrap gap-5 mt-4 text-xs text-gray-400">
              {['Free diagnostic with any service', 'No hidden fees', '12-month service warranty'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle size={12} className="text-primary" />
                  {t}
                </span>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────────────── */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-primary font-bold text-xs uppercase tracking-widest">What We Do</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2">Our Services</h2>
            <p className="text-gray-500 text-lg mt-4 max-w-2xl mx-auto">
              From routine maintenance to complex repairs — every make, every model, handled with precision.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group border border-gray-100 rounded-2xl p-7 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary transition-colors duration-300">
                  <Icon size={22} className="text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-1 text-primary font-semibold text-sm mt-4 hover:gap-2 transition-all"
                >
                  Book this service <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────────── */}
      <section className="bg-primary py-14">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-4xl md:text-5xl font-black">{value}</p>
              <p className="text-white/75 text-sm mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── About / Why Us ───────────────────────────────────────────────────── */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Copy */}
            <div>
              <span className="text-primary font-bold text-xs uppercase tracking-widest">Why WorldClass</span>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2 leading-tight">
                The Standard Every<br />Car Deserves
              </h2>
              <p className="text-gray-500 text-lg mt-5 leading-relaxed">
                We built WorldClass Auto on one principle: every vehicle that leaves our shop should perform
                better than when it arrived. Our technicians are manufacturer-certified and continuously
                trained on the latest diagnostics technology.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  'ASE-certified master technicians on every job',
                  'OEM and premium aftermarket parts only',
                  'Transparent pricing — no surprise charges ever',
                  'Digital service records and inspection reports',
                  '12-month / 12,000 km warranty on all services',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-700 text-sm">
                    <CheckCircle size={16} className="text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-7 py-4 rounded-xl mt-9 transition-colors"
              >
                Book a Service <ArrowRight size={16} />
              </Link>
            </div>

            {/* Tiles */}
            <div className="grid grid-cols-2 gap-4">
              {WHY_US.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <Icon size={26} className="text-primary mb-3" />
                  <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-primary font-bold text-xs uppercase tracking-widest">Simple Process</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2">How It Works</h2>
            <p className="text-gray-500 text-lg mt-4 max-w-xl mx-auto">
              Getting your car serviced with WorldClass has never been easier.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(({ n, title, desc }, i) => (
              <div key={n} className="relative text-center">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+2.5rem)] right-[calc(-50%+2.5rem)] h-px bg-gray-200" />
                )}
                <div className="w-20 h-20 bg-gray-950 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black">
                  {n}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-primary font-bold text-xs uppercase tracking-widest">Customer Stories</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">What Our Customers Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, quote }) => (
              <div key={name} className="bg-gray-900 rounded-2xl p-7 border border-gray-800 flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3 pt-5 border-t border-gray-800">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{name}</p>
                    <p className="text-gray-500 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section id="contact" className="py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            Ready to Book Your Service?
          </h2>
          <p className="text-white/80 text-lg mt-4">
            Join thousands of satisfied customers. Book online in under 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-9">
            <Link
              href="/booking"
              className="bg-white text-primary hover:bg-gray-100 font-bold px-8 py-4 rounded-xl text-base transition-colors inline-flex items-center gap-2"
            >
              Book a Service <ArrowRight size={17} />
            </Link>
            <a
              href="tel:+18764629709"
              className="border-2 border-white/40 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors"
            >
              Call (876) 462-9709
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
