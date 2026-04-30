'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle, ArrowRight, ArrowLeft, Car, User, Wrench,
  Loader2, ChevronLeft, ChevronRight,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const SERVICE_OPTIONS = [
  { value: 'servicing',   label: 'General Servicing' },
  { value: 'alignment',   label: 'Wheel Alignment' },
  { value: 'diagnostics', label: 'Engine Diagnostics' },
  { value: 'parts',       label: 'Parts & Installation' },
  { value: 'bodywork',    label: 'Body Work' },
  { value: 'spray',       label: 'Spray & Paint' },
];

const VEHICLE_MAKES = [
  'Toyota','Honda','Nissan','Mitsubishi',
  'Hyundai','Kia','Mazda','Suzuki','Isuzu','Other',
];

const VEHICLE_MODELS: Record<string, string[]> = {
  Toyota:     ['Axio','Fielder','Corolla','Allion','Premio','Camry','Mark X','Crown','Yaris / Vitz','IST','Wish','Noah','Voxy','Hilux','Land Cruiser Prado','Land Cruiser 200','Fortuner','RAV4','Rush','HiAce'],
  Honda:      ['Fit / Jazz','Civic','City','Accord','Freed','Stream','Stepwgn','Airwave','CR-V','HR-V / Vezel','Odyssey'],
  Nissan:     ['Tiida','Almera','Sylphy','March / Micra','Note','AD Van','Wingroad','Cube','X-Trail','Navara / Frontier','Pathfinder'],
  Mitsubishi: ['Lancer','Galant','Colt','Space Star','ASX','Outlander','Pajero','Pajero Sport','L200 / Triton'],
  Hyundai:    ['Accent','Elantra','Sonata','Tucson','Santa Fe','Creta','i10','i20'],
  Kia:        ['Picanto','Rio','Cerato / Forte','Stonic','Sportage','Sorento','Seltos'],
  Mazda:      ['Demio / Mazda 2','Axela / Mazda 3','Atenza / Mazda 6','CX-3','CX-5','BT-50'],
  Suzuki:     ['Alto','Swift','Cultus','Wagon R','SX4','Vitara','Grand Vitara','Jimny','APV'],
  Isuzu:      ['D-Max','MU-X','Rodeo','Trooper'],
  Other:      [],
};

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const THIS_YEAR  = new Date().getFullYear();
const YEARS      = Array.from({ length: 30 }, (_, i) => THIS_YEAR - i);

// ── Custom DatePicker ─────────────────────────────────────────────────────────

function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = value ? new Date(value + 'T00:00:00') : null;

  const [view, setView] = useState(() => ({
    year:  selected?.getFullYear() ?? today.getFullYear(),
    month: selected?.getMonth()    ?? today.getMonth(),
  }));

  function prev() {
    setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  }
  function next() {
    setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });
  }

  const firstDow   = (new Date(view.year, view.month, 1).getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function pick(day: number) {
    const m = String(view.month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${view.year}-${m}-${d}`);
  }

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gray-950">
        <button
          type="button" onClick={prev}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-white font-bold text-sm tracking-wide">
          {MONTHS[view.month]} {view.year}
        </span>
        <button
          type="button" onClick={next}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="p-4">
        {/* Day-of-week labels */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-[10px] font-black text-gray-400 uppercase py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const cellDate = new Date(view.year, view.month, day);
            cellDate.setHours(0, 0, 0, 0);
            const isPast      = cellDate < today;
            const isSelected  = selected?.toDateString() === cellDate.toDateString();
            const isToday     = today.toDateString()     === cellDate.toDateString();

            return (
              <button
                key={i}
                type="button"
                disabled={isPast}
                onClick={() => pick(day)}
                className={[
                  'w-full aspect-square rounded-xl text-sm font-semibold flex items-center justify-center transition-all',
                  isPast     ? 'text-gray-300 cursor-not-allowed' :
                  isSelected ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105' :
                  isToday    ? 'ring-2 ring-primary text-primary hover:bg-primary hover:text-white' :
                               'text-gray-700 hover:bg-primary/10 hover:text-primary',
                ].join(' ')}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected date label */}
      {selected ? (
        <div className="px-5 py-3 bg-primary text-center">
          <span className="text-white font-bold text-sm">
            {selected.toLocaleDateString('en-JM', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </span>
        </div>
      ) : (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-center">
          <span className="text-gray-400 text-sm">No date selected</span>
        </div>
      )}
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label, required, optional, children, span2, error,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
  span2?: boolean;
  error?: string;
}) {
  return (
    <div className={span2 ? 'sm:col-span-2' : ''}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
        {optional && <span className="text-gray-400 font-normal ml-1 text-xs">(optional)</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  );
}

function inputCls(err?: string) {
  return `form-input ${err ? 'border-red-300 focus:ring-red-400' : ''}`;
}

// ── Validation ────────────────────────────────────────────────────────────────

function validate(f: {
  name: string; phoneNumber: string; email: string;
  vehicleYear: string; vehicleMake: string; vehicleModel: string;
  serviceType: string; preferredDate: string;
}) {
  const e: Record<string, string> = {};
  if (!f.name.trim())                                            e.name          = 'Full name is required.';
  if (!/^\d{7}$/.test(f.phoneNumber))                           e.phone         = 'Enter exactly 7 digits — no dashes or spaces.';
  if (!f.email.trim())                                           e.email         = 'Email address is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email         = 'Enter a valid email address.';
  if (!f.vehicleYear)                                            e.vehicleYear   = 'Please select a year.';
  if (!f.vehicleMake)                                            e.vehicleMake   = 'Please select a make.';
  if (!f.vehicleModel.trim())                                    e.vehicleModel  = 'Please select or enter a model.';
  if (!f.serviceType)                                            e.serviceType   = 'Please select a service.';
  if (!f.preferredDate)                                          e.preferredDate = 'Please pick an appointment date.';
  return e;
}

// ── Test Booking Panel ────────────────────────────────────────────────────────

function TestPanel() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  async function run() {
    setStatus('loading'); setMsg('');
    const d = new Date(); d.setDate(d.getDate() + 1);
    const date = d.toISOString().split('T')[0];
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Customer', phone: '8761234567',
          email: 'test@worldclassautorepairs.com',
          vehicleMake: 'Toyota', vehicleModel: '2024 Axio',
          serviceType: 'servicing', preferredDate: date,
          description: 'Database connectivity test — please ignore',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { setStatus('success'); setMsg('✓ Test booking inserted. Database is connected.'); }
      else        { setStatus('error');   setMsg(data.message || 'Insert failed.'); }
    } catch { setStatus('error'); setMsg('Network error — check your connection.'); }
  }

  return (
    <div className="border-2 border-dashed border-amber-200 bg-amber-50/40 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-amber-100 text-amber-700 text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">
          DEV TEST
        </span>
        <span className="text-sm font-bold text-gray-700">Database Connectivity Check</span>
      </div>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        Submits a pre-filled test record to verify the database connection end-to-end. Safe to run at any time.
      </p>
      <div className="grid sm:grid-cols-2 gap-3 text-xs text-gray-500 mb-4 bg-white rounded-xl p-4 border border-amber-100">
        {[
          ['Name', 'Test Customer'],['Phone', '876 1234567'],
          ['Email', 'test@worldclassautorepairs.com'],['Vehicle', '2024 Toyota Axio'],
          ['Service', 'General Servicing'],['Date', 'Tomorrow'],
        ].map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <span className="font-semibold text-gray-400 w-16 shrink-0">{k}:</span>
            <span className="text-gray-700">{v}</span>
          </div>
        ))}
      </div>
      <button
        type="button" onClick={run} disabled={status === 'loading'}
        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors inline-flex items-center gap-2"
      >
        {status === 'loading'
          ? <><Loader2 size={14} className="animate-spin" />Running test…</>
          : 'Insert Test Booking'}
      </button>
      {msg && (
        <p className={`mt-3 text-sm font-semibold ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {msg}
        </p>
      )}
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

function BookingForm() {
  const params = useSearchParams();

  const [form, setForm] = useState({
    name: '', phoneArea: '876', phoneNumber: '', email: '',
    vehicleYear: '', vehicleMake: '', vehicleModel: '',
    serviceType: params?.get('service') || '',
    preferredDate: params?.get('date') || '',
    description: '',
  });

  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [status, setStatus]     = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitErr, setSubmitErr] = useState('');

  function set(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  }

  function setPhone(raw: string) {
    set('phoneNumber', raw.replace(/\D/g, '').slice(0, 7));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStatus('loading'); setSubmitErr('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:          form.name.trim(),
          phone:         form.phoneArea + form.phoneNumber,
          email:         form.email.trim(),
          vehicleMake:   form.vehicleMake,
          vehicleModel:  [form.vehicleYear, form.vehicleModel].filter(Boolean).join(' '),
          serviceType:   form.serviceType,
          preferredDate: form.preferredDate,
          description:   form.description.trim() || null,
        }),
      });
      if (res.ok) { setStatus('success'); }
      else {
        const data = await res.json().catch(() => ({}));
        setSubmitErr(data.message || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setSubmitErr('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-32">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Booking Confirmed!</h2>
          <p className="text-gray-500 mt-3 text-sm leading-relaxed">
            Thank you, <span className="font-semibold text-gray-700">{form.name}</span>. We received your
            request for{' '}
            <span className="font-semibold text-gray-700">
              {new Date(form.preferredDate + 'T12:00:00').toLocaleDateString('en-JM', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>. Our team will call{' '}
            <span className="font-semibold text-gray-700">
              +{form.phoneArea} {form.phoneNumber}
            </span>{' '}
            within 1 hour to confirm.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl mt-8 transition-colors"
          >
            <ArrowLeft size={15} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-950 pt-28 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-sm mb-5">
            <ArrowLeft size={13} /> Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black text-white">Book a Service</h1>
          <p className="text-gray-400 mt-2 text-sm">Fill in the details below. We'll confirm within 1 hour.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          {/* ── Service Details ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                <Wrench size={16} className="text-primary" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Service Details</h2>
            </div>
            <div className="px-8 py-6 space-y-6">
              <Field label="Service Type" required error={errors.serviceType}>
                <select
                  value={form.serviceType}
                  onChange={e => set('serviceType', e.target.value)}
                  className={inputCls(errors.serviceType)}
                >
                  <option value="">Select a service</option>
                  {SERVICE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Preferred Date <span className="text-primary">*</span>
                </p>
                <DatePicker value={form.preferredDate} onChange={v => set('preferredDate', v)} />
                {errors.preferredDate && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.preferredDate}</p>
                )}
              </div>

              <Field label="Describe the Issue" optional>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Any symptoms, noises, or concerns you've noticed about your vehicle…"
                  rows={3}
                  className="form-input resize-none"
                />
              </Field>
            </div>
          </div>

          {/* ── Vehicle Information ──────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                <Car size={16} className="text-primary" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Vehicle Information</h2>
            </div>
            <div className="px-8 py-6 grid sm:grid-cols-3 gap-5">
              <Field label="Year" required error={errors.vehicleYear}>
                <select value={form.vehicleYear} onChange={e => set('vehicleYear', e.target.value)} className={inputCls(errors.vehicleYear)}>
                  <option value="">Year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </Field>

              <Field label="Make" required error={errors.vehicleMake}>
                <select
                  value={form.vehicleMake}
                  onChange={e => { set('vehicleMake', e.target.value); set('vehicleModel', ''); }}
                  className={inputCls(errors.vehicleMake)}
                >
                  <option value="">Make</option>
                  {VEHICLE_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>

              <Field label="Model" required error={errors.vehicleModel}>
                {form.vehicleMake && form.vehicleMake !== 'Other' ? (
                  <select value={form.vehicleModel} onChange={e => set('vehicleModel', e.target.value)} className={inputCls(errors.vehicleModel)}>
                    <option value="">Model</option>
                    {VEHICLE_MODELS[form.vehicleMake]?.map(m => <option key={m} value={m}>{m}</option>)}
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <input
                    type="text" value={form.vehicleModel}
                    onChange={e => set('vehicleModel', e.target.value)}
                    placeholder="Enter model"
                    className={inputCls(errors.vehicleModel)}
                  />
                )}
              </Field>
            </div>
          </div>

          {/* ── Personal Information ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Your Information</h2>
            </div>
            <div className="px-8 py-6 grid sm:grid-cols-2 gap-5">
              <Field label="Full Name" required span2 error={errors.name}>
                <input
                  type="text" value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="John Smith"
                  className={inputCls(errors.name)}
                />
              </Field>

              <Field label="Phone Number" required error={errors.phone}>
                <div className="flex gap-2">
                  <select
                    value={form.phoneArea}
                    onChange={e => set('phoneArea', e.target.value)}
                    className="form-input w-24 shrink-0 font-semibold"
                  >
                    <option value="876">+876</option>
                    <option value="658">+658</option>
                  </select>
                  <input
                    type="tel" value={form.phoneNumber}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="1234567"
                    maxLength={7}
                    inputMode="numeric"
                    className={`form-input flex-1 ${errors.phone ? 'border-red-300 focus:ring-red-400' : ''}`}
                  />
                </div>
                <p className="text-gray-400 text-xs mt-1">7 digits only — no dashes or spaces</p>
              </Field>

              <Field label="Email Address" required error={errors.email}>
                <input
                  type="email" value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="john@example.com"
                  className={inputCls(errors.email)}
                />
              </Field>
            </div>
          </div>

          {status === 'error' && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 text-red-600 text-sm font-medium">
              {submitErr}
            </div>
          )}

          <button
            type="submit" disabled={status === 'loading'}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-bold py-4 rounded-xl text-base transition-colors flex items-center justify-center gap-2"
          >
            {status === 'loading'
              ? <><Loader2 size={18} className="animate-spin" />Submitting…</>
              : <>Confirm Booking <ArrowRight size={17} /></>}
          </button>

          <p className="text-center text-xs text-gray-400">
            By booking you agree to our terms of service. We'll contact you within 1 hour to confirm.
          </p>

          {/* ── Dev test panel ────────────────────────────────────────────────── */}
          <TestPanel />

        </form>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={28} className="text-primary animate-spin" />
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}
